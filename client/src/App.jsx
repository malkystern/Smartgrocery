import { useState } from 'react';
import ProductSearch from './components/ProductSearch.jsx';
import OrderList from './components/OrderList.jsx';
import ComparisonResults from './components/ComparisonResults.jsx';

export default function App() {
  const [orderItems, setOrderItems] = useState([]); // [{product, quantity}]
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add product or increment quantity if already in order
  const addProduct = (product) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setComparison(null);
    setError('');
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    setOrderItems(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i)
    );
    setComparison(null);
  };

  const removeItem = (productId) => {
    setOrderItems(prev => prev.filter(i => i.product.id !== productId));
    setComparison(null);
  };

  // Swap original product with substitute in the order
  const swapItem = (originalProductId, substituteProduct) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.product.id === originalProductId);
      if (!existing) {
        return [...prev, { product: substituteProduct, quantity: 1 }];
      }
      return prev.map(i =>
        i.product.id === originalProductId ? { ...i, product: substituteProduct } : i
      );
    });
    setComparison(null);
  };

  const handleCompare = async () => {
    if (orderItems.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setComparison(data);
    } catch (err) {
      setError(err.message || 'Failed to compare prices. Please check the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo" aria-hidden="true">🛒</div>
          <div className="header-text">
            <h1><span>Smart</span>Grocery</h1>
            <p className="header-tagline">Find the best price across kosher supermarkets</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* ── Product Search ── */}
        <ProductSearch orderItems={orderItems} onAddProduct={addProduct} />

        {/* ── Order List ── */}
        <OrderList
          orderItems={orderItems}
          onUpdateQty={updateQty}
          onRemove={removeItem}
        />

        {/* ── Error Banner ── */}
        {error && (
          <div className="error-banner" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Compare CTA ── */}
        <div className="compare-btn-wrap">
          <button
            className="compare-btn"
            onClick={handleCompare}
            disabled={orderItems.length === 0 || loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <div className="spinner" aria-hidden="true" />
                Comparing prices…
              </>
            ) : (
              <>
                <span aria-hidden="true">📊</span>
                Compare Prices Across Stores
              </>
            )}
          </button>
        </div>

        {/* ── Results ── */}
        {comparison && (
          <ComparisonResults
            comparison={comparison}
            onSwapItem={swapItem}
          />
        )}
      </main>
    </div>
  );
}
