import { useState } from 'react';

// Format price as $X.XX
function fmt(n) {
  if (n == null) return '—';
  return `$${Number(n).toFixed(2)}`;
}

// Individual store card component
function StoreCard({ store }) {
  const [expanded, setExpanded] = useState(false);
  const itemsToShow = expanded ? store.items : store.items.slice(0, 4);
  const hasMore = store.items.length > 4;

  return (
    <div className={`store-card${store.cheapest ? ' best' : ''}`}>
      {/* Colored accent bar at top */}
      <div className="store-accent-bar" style={{ background: store.logoColor }} />

      <div className="store-card-body">
        {/* Store name row */}
        <div className="store-card-top">
          <div>
            <div className="store-name">{store.name}</div>
            <div className="store-location">{store.location}</div>
          </div>
          {store.cheapest && (
            <span className="best-badge" aria-label="Best price">🏆 Best Price</span>
          )}
        </div>

        {/* Total price */}
        <div className={`store-total${store.cheapest ? ' best-total' : ''}`} aria-label={`Total: ${fmt(store.total)}`}>
          {fmt(store.total)}
        </div>

        {/* Savings pill */}
        {store.cheapest && store.savings > 0 && (
          <div className="store-savings-pill">
            Save {fmt(store.savings)} vs most expensive
          </div>
        )}

        {/* Collapsible item breakdown */}
        <button
          className="store-toggle-btn"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-controls={`items-${store.id}`}
        >
          <span>
            {expanded ? 'Hide items' : `View ${store.items.length} item${store.items.length !== 1 ? 's' : ''}`}
          </span>
          <span className={`toggle-arrow${expanded ? ' open' : ''}`} aria-hidden="true">▼</span>
        </button>

        {expanded && (
          <div className="store-items-list" id={`items-${store.id}`}>
            {itemsToShow.map(item => (
              <div
                key={item.productId}
                className={`store-item-row${!item.available ? ' unavailable' : ''}`}
              >
                <div className="store-item-left">
                  <div className="store-item-product">{item.name}</div>
                  <div className="store-item-qty-label">
                    {item.brand && `${item.brand} · `}{item.unit}
                    {item.quantity > 1 && ` · qty ${item.quantity}`}
                  </div>
                  {item.cheapestInCategory && item.available && (
                    <div className="cheapest-tag">✓ Cheapest here</div>
                  )}
                </div>

                <div className="store-item-right">
                  {item.available ? (
                    <>
                      <div className="store-item-subtotal">{fmt(item.subtotal)}</div>
                      {item.quantity > 1 && (
                        <div className="store-item-unit-price">{fmt(item.price)} each</div>
                      )}
                    </>
                  ) : (
                    <span className="unavailable-label">Not available</span>
                  )}
                </div>
              </div>
            ))}

            {hasMore && !expanded && (
              <button
                className="store-toggle-btn"
                onClick={() => setExpanded(true)}
                style={{ paddingTop: 6 }}
              >
                <span>+ {store.items.length - 4} more items</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Substitution suggestions panel
function SubstitutionPanel({ substitutions, onSwapItem }) {
  if (!substitutions || substitutions.length === 0) return null;

  return (
    <div className="subs-section">
      <div className="subs-header">
        <span className="subs-header-icon" aria-hidden="true">💡</span>
        <div className="subs-header-text">
          <h3>Smart Substitutions — Save More</h3>
          <p>Cheaper alternatives with same or similar kosher certification</p>
        </div>
      </div>

      <div className="subs-list">
        {substitutions.map((sub, idx) => (
          <div key={idx} className="sub-card">
            <div className="sub-card-info">
              <div className="sub-card-title">
                Switch{' '}
                <strong>{sub.originalProduct.name}</strong>
                {sub.originalProduct.brand && ` (${sub.originalProduct.brand})`}
                {' '}<span className="sub-card-arrow">→</span>{' '}
                <strong>{sub.substitute.name}</strong>
                {sub.substitute.brand && ` (${sub.substitute.brand})`}
              </div>
              <div className="sub-card-store">
                Best price at <strong>{sub.storeName}</strong>
              </div>
              {sub.reason && (
                <div className="sub-card-reason">{sub.reason}</div>
              )}
            </div>

            <div className="sub-card-right">
              <span className="sub-save-badge">
                Save {fmt(sub.savePerUnit)}/unit
              </span>
              <button
                className="sub-add-btn"
                onClick={() => onSwapItem(sub.originalProduct.id, {
                  ...sub.substitute,
                  cert: sub.substitute.cert || {},
                  kosher_level: sub.substitute.kosher_level || 'kosher',
                })}
                aria-label={`Swap ${sub.originalProduct.name} with ${sub.substitute.name}`}
              >
                Swap item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonResults({ comparison, onSwapItem }) {
  if (!comparison) return null;

  const { stores, substitutions } = comparison;
  const cheapestStore = stores.find(s => s.cheapest);
  const mostExpensiveTotal = stores.length > 0 ? stores[stores.length - 1].total : 0;

  return (
    <div className="results-section">
      {/* Results header */}
      <div className="results-header">
        <div>
          <div className="results-title">
            📊 Price Comparison — {stores.length} stores
          </div>
          {cheapestStore && (
            <div className="results-subtitle">
              Best deal at <strong>{cheapestStore.name}</strong> ({cheapestStore.location})
              {cheapestStore.savings > 0 && ` — save ${fmt(cheapestStore.savings)} vs most expensive`}
            </div>
          )}
        </div>
      </div>

      {/* Store cards grid */}
      <div className="stores-grid">
        {stores.map(store => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      {/* Substitution suggestions */}
      {substitutions && substitutions.length > 0 && (
        <SubstitutionPanel
          substitutions={substitutions}
          onSwapItem={onSwapItem}
        />
      )}
    </div>
  );
}
