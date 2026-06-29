import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { offersApi, branchesApi } from '../../api/patient';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/helpers';

export default function OffersPage({ onNavigate }) {
  const { data: branches } = useApi(branchesApi.getAll);
  const [branchFilter, setBranchFilter] = useState('');
  const { data: offers, loading } = useApi(() => offersApi.getAll(branchFilter || undefined), [branchFilter]);

  const today = new Date();
  const active = offers?.filter(o => o.isActive && new Date(o.endDate) >= today) || [];
  const expired = offers?.filter(o => !o.isActive || new Date(o.endDate) < today) || [];

  return (
    <div>
      <PageHeader title="Special Offers" subtitle="Discounts and promotions on lab tests" />

      <div className="filters-row">
        <select className="filter-select" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="">All Branches</option>
          {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="page-loader"><span className="spinner-lg spinner" /></div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <div className="section-title" style={{ marginBottom: 16 }}>Active Offers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
                {active.map(offer => (
                  <div key={offer.id} className="card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--teal-500)', color: 'white', padding: '6px 16px', borderBottomLeftRadius: 12, fontWeight: 700, fontSize: 13 }}>
                      {offer.discountPercent}% OFF
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-900)', marginBottom: 4, paddingRight: 60 }}>{offer.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
                      🧪 {offer.testName} &nbsp;·&nbsp; 🏥 {offer.branchName}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--gray-400)' }}>
                      <span>📅 {formatDate(offer.startDate)} – {formatDate(offer.endDate)}</span>
                    </div>
                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('book')}>
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {active.length === 0 && (
            <div className="empty-state" style={{ paddingTop: 60 }}>
              <div className="empty-state-icon">🎁</div>
              <h3>No active offers</h3>
              <p>Check back soon for promotions and discounts on lab tests.</p>
            </div>
          )}

          {expired.length > 0 && (
            <>
              <div className="section-title" style={{ marginBottom: 16, opacity: 0.6 }}>Expired Offers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, opacity: 0.55 }}>
                {expired.map(offer => (
                  <div key={offer.id} className="card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{offer.title}</span>
                      <Badge status="Inactive" />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{offer.testName} · {offer.discountPercent}% off</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Ended {formatDate(offer.endDate)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
