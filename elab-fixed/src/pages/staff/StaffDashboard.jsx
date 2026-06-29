import React from 'react';
import { useApi } from '../../hooks/useApi';
import { resultsStaffApi } from '../../api/staff';
import { bookingsStaffApi } from '../../api/staff';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/helpers';

export default function StaffDashboard({ onNavigate }) {
  const { data: pending }    = useApi(resultsStaffApi.getPending);
  const { data: allResults } = useApi(resultsStaffApi.getAll);
  const { data: bookings }   = useApi(bookingsStaffApi.getAll);

  const today = new Date().toDateString();
  const todayBookings = bookings?.filter(b => new Date(b.bookingDate).toDateString() === today) || [];

  // =========================
  // SAFE DATA HANDLING
  // =========================
  const allResultsData = Array.isArray(allResults)
    ? allResults
    : allResults?.data?.data
    ? allResults.data.data
    : allResults?.data
    ? allResults.data
    : [];

  return (
    <div>
      <div className="stats-row">
        <StatCard icon="⏳" label="Pending Reviews"  value={pending?.length ?? '…'}       color="amber"  />
        <StatCard icon="📅" label="Today's Bookings" value={todayBookings.length}           color="teal"   />
        <StatCard icon="📋" label="Total Bookings"   value={bookings?.length ?? '…'}       color="blue"   />
        <StatCard icon="🧪" label="All Results"      value={allResultsData.length || '…'}  color="purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* PENDING RESULTS */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⏳ Pending Results</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('pending-results')}>View all →</button>
          </div>
          <div style={{ overflow: 'auto' }}>
            {!pending
              ? <div style={{ padding: 24, textAlign: 'center' }}><span className="spinner" /></div>
              : pending.length === 0
              ? <div className="empty-state"><div className="empty-state-icon">✅</div><h3>All caught up!</h3><p>No pending results.</p></div>
              : pending.slice(0, 5).map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderBottom: '1px solid var(--gray-100)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{r.testName}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>#{r.id} · {formatDate(r.resultDate)}</div>
                  </div>
                  <Badge status={r.status} />
                </div>
              ))
            }
          </div>
        </div>

        {/* TODAY'S APPOINTMENTS */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📅 Today's Appointments</span>
          </div>
          <div>
            {todayBookings.length === 0
              ? <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No appointments today</h3></div>
              : todayBookings.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderBottom: '1px solid var(--gray-100)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{b.patientProfile || `Booking #${b.id}`}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{b.branch}</div>
                  </div>
                  <Badge status={b.status} />
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* ALL RESULTS */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🧪 All Results</span>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('all-results')}>View all →</button>
        </div>
        <div style={{ overflow: 'auto' }}>
          {!allResults
            ? <div style={{ padding: 24, textAlign: 'center' }}><span className="spinner" /></div>
            : allResultsData.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">🧪</div><h3>No results yet</h3><p>Results will appear here once uploaded.</p></div>
            : allResultsData.slice(0, 5).map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderBottom: '1px solid var(--gray-100)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{r.testName}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    #{r.id}{r.patientName ? ` · ${r.patientName}` : ''}{r.resultDate ? ` · ${formatDate(r.resultDate)}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.hasAbnormalValues && <Badge status={`${r.abnormalCount} Abnormal`} />}
                  <Badge status={r.status} />
                </div>
              </div>
            ))
          }
        </div>
      </div>

    </div>
  );
}