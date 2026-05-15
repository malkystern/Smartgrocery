const express = require('express');
const cors = require('cors');
const initDb = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = initDb();

// ─── GET /api/products/categories ───────────────────────────────────────────
app.get('/api/products/categories', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT DISTINCT category FROM products ORDER BY category'
    ).all();
    res.json(rows.map(r => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ─── GET /api/products ───────────────────────────────────────────────────────
// Query params: search, category, kosher_level
app.get('/api/products', (req, res) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    const kosherLevel = req.query.kosher_level || '';

    let query = `
      SELECT p.id, p.name, p.brand, p.category, p.unit, p.kosher_level,
             k.name AS cert_name, k.abbreviation AS cert_abbreviation
      FROM products p
      LEFT JOIN kosher_certs k ON p.cert_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.brand LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }
    if (kosherLevel) {
      query += ' AND p.kosher_level = ?';
      params.push(kosherLevel);
    }

    query += ' ORDER BY p.category, p.name';

    const rows = db.prepare(query).all(...params);
    const products = rows.map(r => ({
      id: r.id,
      name: r.name,
      brand: r.brand,
      category: r.category,
      unit: r.unit,
      kosher_level: r.kosher_level,
      cert: {
        name: r.cert_name || '',
        abbreviation: r.cert_abbreviation || '',
      },
    }));
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ─── GET /api/stores ─────────────────────────────────────────────────────────
app.get('/api/stores', (req, res) => {
  try {
    const stores = db.prepare(
      'SELECT id, name, logo_color AS logoColor, location FROM stores ORDER BY id'
    ).all();
    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// ─── POST /api/compare ───────────────────────────────────────────────────────
// Body: { items: [{productId, quantity}] }
app.post('/api/compare', (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required and must not be empty' });
    }
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each item must have productId and quantity >= 1' });
      }
    }

    const productIds = items.map(i => i.productId);
    const placeholders = productIds.map(() => '?').join(',');

    // Fetch all stores
    const stores = db.prepare(
      'SELECT id, name, logo_color, location FROM stores ORDER BY id'
    ).all();

    // Fetch product details (including cert info)
    const productRows = db.prepare(`
      SELECT p.id, p.name, p.brand, p.unit, p.kosher_level,
             k.name AS cert_name, k.abbreviation AS cert_abbreviation
      FROM products p
      LEFT JOIN kosher_certs k ON p.cert_id = k.id
      WHERE p.id IN (${placeholders})
    `).all(...productIds);

    const productMap = {};
    productRows.forEach(p => { productMap[p.id] = p; });

    // Fetch all relevant prices
    const priceRows = db.prepare(
      `SELECT store_id, product_id, price FROM prices WHERE product_id IN (${placeholders})`
    ).all(...productIds);

    // priceMap[storeId][productId] = price
    const priceMap = {};
    for (const row of priceRows) {
      if (!priceMap[row.store_id]) priceMap[row.store_id] = {};
      priceMap[row.store_id][row.product_id] = row.price;
    }

    // For each product, find the cheapest store price (to mark cheapestInCategory)
    const cheapestPricePerProduct = {};
    for (const pid of productIds) {
      let minPrice = Infinity;
      for (const store of stores) {
        const p = (priceMap[store.id] || {})[pid];
        if (p != null && p < minPrice) minPrice = p;
      }
      cheapestPricePerProduct[pid] = minPrice === Infinity ? null : minPrice;
    }

    // Build store comparison data
    const storeResults = stores.map(store => {
      const storePrices = priceMap[store.id] || {};
      let total = 0;
      const storeItems = items.map(item => {
        const product = productMap[item.productId];
        const price = storePrices[item.productId] != null ? storePrices[item.productId] : null;
        const subtotal = price != null ? Math.round(price * item.quantity * 100) / 100 : null;
        if (subtotal != null) total += subtotal;

        const cheapestInCategory =
          price != null &&
          cheapestPricePerProduct[item.productId] != null &&
          Math.abs(price - cheapestPricePerProduct[item.productId]) < 0.001;

        return {
          productId: item.productId,
          name: product ? product.name : 'Unknown',
          brand: product ? product.brand : '',
          unit: product ? product.unit : '',
          price,
          quantity: item.quantity,
          subtotal,
          available: price != null,
          cheapestInCategory,
        };
      });

      total = Math.round(total * 100) / 100;

      return {
        id: store.id,
        name: store.name,
        logoColor: store.logo_color,
        location: store.location,
        total,
        cheapest: false,
        savings: 0,
        items: storeItems,
      };
    });

    // Sort ascending by total
    storeResults.sort((a, b) => a.total - b.total);

    // Mark cheapest and compute savings
    if (storeResults.length > 0) {
      storeResults[0].cheapest = true;
      const mostExpensive = storeResults[storeResults.length - 1].total;
      storeResults[0].savings = Math.round((mostExpensive - storeResults[0].total) * 100) / 100;
    }

    // ─── Substitutions ───────────────────────────────────────────────────────
    // Find substitution suggestions for items in the order
    const subRows = db.prepare(
      `SELECT s.product_id, s.substitute_id, s.reason,
              p1.name AS orig_name, p1.brand AS orig_brand, p1.unit AS orig_unit,
              p2.name AS sub_name, p2.brand AS sub_brand, p2.unit AS sub_unit
       FROM substitutions s
       JOIN products p1 ON s.product_id = p1.id
       JOIN products p2 ON s.substitute_id = p2.id
       WHERE s.product_id IN (${placeholders})`
    ).all(...productIds);

    const substitutions = [];
    for (const row of subRows) {
      // Find the cheapest store price for the substitute
      let bestSubPrice = Infinity;
      let bestSubStore = null;
      for (const store of stores) {
        const subPrice = (priceMap[store.id] || {})[row.substitute_id];
        if (subPrice != null && subPrice < bestSubPrice) {
          bestSubPrice = subPrice;
          bestSubStore = store;
        }
      }
      if (!bestSubStore) continue;

      // Average original price across stores that carry it
      let origPrices = [];
      for (const store of stores) {
        const op = (priceMap[store.id] || {})[row.product_id];
        if (op != null) origPrices.push(op);
      }
      if (origPrices.length === 0) continue;
      const avgOrigPrice = origPrices.reduce((a, b) => a + b, 0) / origPrices.length;
      const savePerUnit = Math.round((avgOrigPrice - bestSubPrice) * 100) / 100;

      if (savePerUnit <= 0) continue; // only suggest if actually cheaper

      substitutions.push({
        originalProduct: {
          id: row.product_id,
          name: row.orig_name,
          brand: row.orig_brand,
          unit: row.orig_unit,
        },
        substitute: {
          id: row.substitute_id,
          name: row.sub_name,
          brand: row.sub_brand,
          unit: row.sub_unit,
        },
        savePerUnit,
        storeName: bestSubStore.name,
        storeId: bestSubStore.id,
        reason: row.reason,
      });
    }

    res.json({ stores: storeResults, substitutions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compare prices' });
  }
});

app.listen(PORT, () => {
  console.log(`SmartGrocery server running on http://localhost:${PORT}`);
});
