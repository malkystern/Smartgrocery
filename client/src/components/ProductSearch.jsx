import { useState, useEffect, useRef, useCallback } from 'react';

const KOSHER_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'glatt', label: 'Glatt' },
  { value: 'cholov_yisroel', label: 'Cholov Yisroel' },
  { value: 'pas_yisroel', label: 'Pas Yisroel' },
];

// Returns CSS class for cert badge
function certClass(abbr) {
  if (!abbr) return 'def';
  const key = abbr.toLowerCase().replace('-', '-');
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

// Human-readable kosher level label
function levelLabel(level) {
  const map = {
    glatt: 'Glatt',
    cholov_yisroel: 'Cholov Yisroel',
    pas_yisroel: 'Pas Yisroel',
    kosher: '',
  };
  return map[level] ?? '';
}

export default function ProductSearch({ orderItems, onAddProduct }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [kosherLevel, setKosherLevel] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  // Load categories on mount
  useEffect(() => {
    fetch('/api/products/categories')
      .then(r => r.json())
      .then(cats => setCategories(cats))
      .catch(() => {});
  }, []);

  const doSearch = useCallback(async (q, cat, kl) => {
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (cat) params.set('category', cat);
    if (kl) params.set('kosher_level', kl);

    // If nothing to filter by, show no dropdown
    if (!q && !cat && !kl) {
      setResults([]);
      setOpen(false);
      return;
    }

    setFetching(true);
    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setFetching(false);
    }
  }, []);

  // Debounced search whenever any filter changes
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doSearch(query, category, kosherLevel);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query, category, kosherLevel, doSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const isInOrder = (id) => orderItems.some(i => i.product.id === id);

  const handleAdd = (product) => {
    onAddProduct(product);
    // Don't clear query so user can keep adding; just close dropdown momentarily
    setOpen(false);
    // Re-open after a tick so user can see updated "in list" state
    setTimeout(() => {
      if (query || category || kosherLevel) {
        setOpen(true);
      }
    }, 150);
  };

  const toggleCategory = (cat) => {
    setCategory(prev => (prev === cat ? '' : cat));
  };

  const toggleKosher = (kl) => {
    setKosherLevel(prev => (prev === kl ? '' : kl));
  };

  return (
    <div className="card search-section" ref={wrapRef}>
      <div className="section-title">
        <span className="icon">🔍</span> Search Products
      </div>

      {/* Search input */}
      <div className="search-input-wrap">
        <span className="search-icon-pos" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          className="search-input"
          type="search"
          autoComplete="off"
          placeholder="Search by product name or brand (e.g. challah, chicken, milk…)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search kosher products"
        />
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="filter-row" role="group" aria-label="Filter by category">
          <span className="filter-label">Category:</span>
          <button
            className={`chip ${category === '' ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Kosher level filter */}
      <div className="filter-row" role="group" aria-label="Filter by kosher level">
        <span className="filter-label">Level:</span>
        {KOSHER_LEVELS.map(kl => (
          <button
            key={kl.value}
            className={`chip ${kosherLevel === kl.value ? 'active' : ''}`}
            onClick={() => toggleKosher(kl.value)}
          >
            {kl.label}
          </button>
        ))}
      </div>

      {/* Search dropdown */}
      <div className="search-dropdown-wrap">
        {open && (
          <div className="search-dropdown" role="listbox" aria-label="Search results">
            {fetching && (
              <div className="dropdown-loading">Searching…</div>
            )}
            {!fetching && results.length === 0 && (
              <div className="dropdown-empty">
                <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: 4 }}>🔍</span>
                No products found. Try a different search or filter.
              </div>
            )}
            {!fetching && results.map(product => {
              const already = isInOrder(product.id);
              const klLabel = levelLabel(product.kosher_level);
              const certAbbr = product.cert?.abbreviation;
              return (
                <div
                  key={product.id}
                  className={`dropdown-item ${already ? 'in-list' : ''}`}
                  role="option"
                  aria-selected={already}
                  onClick={() => handleAdd(product)}
                  title={already ? `${product.name} is already in your list` : `Add ${product.name} to your list`}
                >
                  <div className="dropdown-item-left">
                    <div className="dropdown-item-name">
                      {product.name}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.84rem' }}>
                        {' '}&middot; {product.brand}
                      </span>
                    </div>
                    <div className="dropdown-item-meta">
                      <span>{product.unit}</span>
                      {certAbbr && (
                        <span className={`cert-badge ${certClass(certAbbr)}`}>{certAbbr}</span>
                      )}
                      {klLabel && (
                        <span className={`level-badge ${product.kosher_level}`}>{klLabel}</span>
                      )}
                      <span style={{ color: 'var(--border)', fontSize: '0.68rem' }}>
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown-item-right">
                    {already ? (
                      <span className="in-list-indicator">✓ In list</span>
                    ) : (
                      <span className="add-btn-round" aria-hidden="true">+</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
