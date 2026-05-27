const express = require('express');
const cors = require('cors');
const path = require('path');
const { stores, products, substitutions, formatProduct, getPrice } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// GET /api/products/categories
app.get('/api/products/categories', (req, res) => {
  const cats = [...new Set(products.map(p => p.category))].sort();
  res.json(cats);
});

// GET /api/products?search=&category=&kosher_level=
app.get('/api/products', (req, res) => {
  const { search = '', category = '', kosher_level = '' } = req.query;
  const q = search.toLowerCase();
  const filtered = products.filter(p => {
    if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    if (category && p.category !== category) return false;
    if (kosher_level && p.kosher_level !== kosher_level) return false;
    return true;
  });
  res.json(filtered.map(formatProduct));
});

// GET /api/stores
app.get('/api/stores', (req, res) => {
  res.json(stores.map(s => ({ id: s.id, name: s.name, logoColor: s.logo_color, location: s.location })));
});

// POST /api/compare  { items: [{productId, quantity}] }
app.post('/api/compare', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' });
  }

  const productIds = items.map(i => i.productId);
  const productMap = {};
  products.forEach(p => { if (productIds.includes(p.id)) productMap[p.id] = p; });

  // Cheapest price per product across all stores
  const cheapestPerProduct = {};
  for (const pid of productIds) {
    let min = Infinity;
    stores.forEach((_, idx) => {
      const price = getPrice(pid, idx);
      if (price != null && price < min) min = price;
    });
    cheapestPerProduct[pid] = min === Infinity ? null : min;
  }

  // Build per-store results
  const storeResults = stores.map((store, idx) => {
    let total = 0;
    const storeItems = items.map(item => {
      const product = productMap[item.productId];
      const price = getPrice(item.productId, idx);
      const subtotal = price != null ? Math.round(price * item.quantity * 100) / 100 : null;
      if (subtotal != null) total += subtotal;
      const cheapestInCategory =
        price != null &&
        cheapestPerProduct[item.productId] != null &&
        Math.abs(price - cheapestPerProduct[item.productId]) < 0.001;
      return {
        productId: item.productId,
        name: product ? product.name : 'Unknown',
        brand: product ? product.brand : '',
        unit: product ? product.unit : '',
        price, quantity: item.quantity, subtotal,
        available: price != null, cheapestInCategory,
      };
    });
    return {
      id: store.id, name: store.name, logoColor: store.logo_color, location: store.location,
      total: Math.round(total * 100) / 100,
      cheapest: false, savings: 0, items: storeItems,
    };
  });

  storeResults.sort((a, b) => a.total - b.total);
  if (storeResults.length > 0) {
    storeResults[0].cheapest = true;
    storeResults[0].savings = Math.round(
      (storeResults[storeResults.length - 1].total - storeResults[0].total) * 100
    ) / 100;
  }

  // Substitutions
  const relevantSubs = substitutions.filter(s => productIds.includes(s.product_id));
  const subResults = [];
  for (const sub of relevantSubs) {
    let bestPrice = Infinity, bestStore = null;
    stores.forEach((store, idx) => {
      const p = getPrice(sub.substitute_id, idx);
      if (p != null && p < bestPrice) { bestPrice = p; bestStore = store; }
    });
    if (!bestStore) continue;

    const origPrices = stores.map((_, idx) => getPrice(sub.product_id, idx)).filter(p => p != null);
    if (origPrices.length === 0) continue;
    const avgOrig = origPrices.reduce((a, b) => a + b, 0) / origPrices.length;
    const savePerUnit = Math.round((avgOrig - bestPrice) * 100) / 100;
    if (savePerUnit <= 0) continue;

    const origProd = products.find(p => p.id === sub.product_id);
    const subProd = products.find(p => p.id === sub.substitute_id);
    subResults.push({
      originalProduct: { id: origProd.id, name: origProd.name, brand: origProd.brand, unit: origProd.unit },
      substitute: { id: subProd.id, name: subProd.name, brand: subProd.brand, unit: subProd.unit },
      savePerUnit, storeName: bestStore.name, storeId: bestStore.id, reason: sub.reason,
    });
  }

  res.json({ stores: storeResults, substitutions: subResults });
});

// Catch-all: serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartGrocery server running on port ${PORT}`);
});
