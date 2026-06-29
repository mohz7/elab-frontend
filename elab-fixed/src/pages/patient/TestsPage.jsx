import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { testCatalogsApi, cartApi, pricesApi, offersApi } from '../../api/patient';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

export default function TestsPage({ onNavigate }) {
  const { data: tests, loading } = useApi(testCatalogsApi.getAll);
  const { data: offers } = useApi(offersApi.getAll);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewing, setViewing] = useState(null);
  const [adding, setAdding] = useState(false);

  const categories = [...new Set(tests?.map(t => t.category).filter(Boolean) || [])];
  const filtered = tests?.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || t.category === categoryFilter;
    return matchSearch && matchCat;
  }) || [];

  const getOfferForTest = (testId) => offers?.find(o => o.testCatalogId === testId && o.isActive);

  const handleAddToCart = async (testId) => {
    setAdding(true);
    try {
      await cartApi.addToCart({ testCatalogId: testId });
      toast.success('Added to cart! 🛒');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add to cart.'); }
    finally { setAdding(false); }
  };

  return (
    <div>
      <PageHeader title="Test Catalog" subtitle="Browse available laboratory tests"
        actions={<button className="btn btn-outline" onClick={() => onNavigate('cart')}>🛒 View Cart</button>} />

      <div className="filters-row">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input placeholder="Search tests…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-500)' }}>{filtered.length} tests</div>
      </div>

      {loading ? (
        <div className="page-loader"><span className="spinner-lg spinner" /><span>Loading tests…</span></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(test => {
            const offer = getOfferForTest(test.id);
            return (
              <div key={test.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 20, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-900)' }}>{test.name}</div>
                    <Badge status={test.category} className="badge-blue" />
                  </div>
                  {offer && <Badge status={`${offer.discountPercent}% OFF`} className="badge-green" />}
                </div>

                {test.description && <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.55 }}>{test.description}</p>}

                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--gray-500)' }}>
                  <span>🧪 {test.sampleType}</span>
                  <span>⏱ {test.turnaroundHours}h turnaround</span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setViewing(test)}>Details</button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                    onClick={() => handleAddToCart(test.id)} disabled={adding}>
                    {adding ? <span className="spinner" /> : '+ Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="empty-state"><div className="empty-state-icon">🔬</div><h3>No tests found</h3><p>Try adjusting your search or filters.</p></div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name} size="sm">
        {viewing && (
          <div>
            <div className="info-row"><div className="info-row-key">Category</div><div className="info-row-val"><Badge status={viewing.category} className="badge-blue" /></div></div>
            <div className="info-row"><div className="info-row-key">Sample Type</div><div className="info-row-val">{viewing.sampleType}</div></div>
            <div className="info-row"><div className="info-row-key">Turnaround</div><div className="info-row-val">{viewing.turnaroundHours} hours</div></div>
            {viewing.description && (
              <div style={{ marginTop: 14 }}>
                <div className="form-label" style={{ marginBottom: 6 }}>Description</div>
                <p style={{ fontSize: 13.5, color: 'var(--gray-600)', lineHeight: 1.6 }}>{viewing.description}</p>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary btn-full" onClick={() => { handleAddToCart(viewing.id); setViewing(null); }}>
                + Add to Cart
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
