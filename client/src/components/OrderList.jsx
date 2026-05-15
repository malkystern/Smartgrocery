// Human-readable kosher level label
function levelLabel(level) {
  const map = {
    glatt: 'Glatt',
    cholov_yisroel: 'Cholov Yisroel',
    pas_yisroel: 'Pas Yisroel',
  };
  return map[level] || '';
}

// Returns CSS class for cert badge
function certClass(abbr) {
  if (!abbr) return 'def';
  const map = {
    'ou': 'ou',
    'ok': 'ok',
    'star-k': 'star-k',
    'kof-k': 'kof-k',
    'crc': 'crc',
    'kvh': 'kvh',
  };
  return map[abbr.toLowerCase()] || 'def';
}

export default function OrderList({ orderItems, onUpdateQty, onRemove }) {
  const itemCount = orderItems.length;

  return (
    <div className="card order-section">
      <div className="order-header-row">
        <div className="section-title" style={{ margin: 0 }}>
          <span className="icon">🛒</span>
          Your Order
          {itemCount > 0 && (
            <span className="order-count-pill" aria-label={`${itemCount} items`}>
              {itemCount}
            </span>
          )}
        </div>
      </div>

      {itemCount === 0 ? (
        <div className="order-empty" role="status">
          <div className="order-empty-icon" aria-hidden="true">🛒</div>
          <p className="order-empty-text">
            Start adding items above to compare prices across kosher stores
          </p>
        </div>
      ) : (
        <>
          <div className="order-items-list">
            {orderItems.map(({ product, quantity }) => {
              const klLabel = levelLabel(product.kosher_level);
              const certAbbr = product.cert?.abbreviation;
              return (
                <div key={product.id} className="order-item">
                  <div className="order-item-info">
                    <div className="order-item-name">{product.name}</div>
                    <div className="order-item-meta">
                      <span style={{ color: 'var(--text-muted)' }}>{product.brand}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span>{product.unit}</span>
                      {certAbbr && (
                        <span className={`cert-badge ${certClass(certAbbr)}`}>{certAbbr}</span>
                      )}
                      {klLabel && (
                        <span className={`level-badge ${product.kosher_level}`}>{klLabel}</span>
                      )}
                    </div>
                  </div>

                  <div className="order-item-controls">
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQty(product.id, quantity - 1)}
                      aria-label={`Decrease quantity of ${product.name}`}
                    >
                      −
                    </button>
                    <span className="qty-display" aria-label={`Quantity: ${quantity}`}>
                      {quantity}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQty(product.id, quantity + 1)}
                      aria-label={`Increase quantity of ${product.name}`}
                    >
                      +
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => onRemove(product.id)}
                      title={`Remove ${product.name}`}
                      aria-label={`Remove ${product.name} from order`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-footer">
            <span className="subtotal-label">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your list
            </span>
            <span className="subtotal-value">Add items and compare to see prices</span>
          </div>
        </>
      )}
    </div>
  );
}
