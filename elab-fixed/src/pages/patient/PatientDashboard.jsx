import React from 'react';
import { useApi } from '../../hooks/useApi';
import {
  bookingsPatientApi,
  resultsPatientApi,
  notificationsApi,
  branchesApi,
} from '../../api/patient';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function PatientDashboard({ onNavigate }) {

  const { data: bookingsRes, loading: bLoad } = useApi(bookingsPatientApi.getMyBookings);
  const { data: resultsRes }                  = useApi(resultsPatientApi.getMyResults);
  const { data: notifRes }                    = useApi(notificationsApi.getUnread);
  const { data: branchesRaw }                 = useApi(branchesApi.getAll);

  const bookings = Array.isArray(bookingsRes)      ? bookingsRes
                 : Array.isArray(bookingsRes?.data) ? bookingsRes.data : [];

  const results  = Array.isArray(resultsRes)       ? resultsRes
                 : Array.isArray(resultsRes?.data)  ? resultsRes.data  : [];

  const branches = Array.isArray(branchesRaw)      ? branchesRaw
                 : Array.isArray(branchesRaw?.data) ? branchesRaw.data : [];

  const getBranchName = (id) => {
    const b = branches.find(x => Number(x.id) === Number(id));
    return b?.name || `Branch #${id}`;
  };

  const pending = bookings.filter(b => b.status === 'Pending').length;
  const unread = notifRes?.unreadCount?.data ?? 0;

  const recentBookings = bookings.slice(0, 8);
  console.log('notifRes:', notifRes);
console.log('unread value:', unread);

  return (
    <div>

      {/* STATS */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
        <StatCard icon="📅" label="My Bookings"   value={bookings.length} color="teal"  />
        <StatCard icon="⏳" label="Pending"        value={pending}         color="amber" />
        <StatCard icon="🔬" label="My Results"    value={results.length}  color="blue"  />
        <StatCard icon="🔔" label="Unread Alerts"  value={unread}          color="red"   />
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* BOOKINGS TABLE */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Bookings</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('bookings')}>
              View all →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Branch</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bLoad ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>
                      <span className="spinner" />
                    </td>
                  </tr>
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 32 }}>
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  recentBookings.map(b => (
                    <tr key={b.id} className="table-row-hover">
                      <td className="td-mono">#{b.id}</td>
                      <td className="td-muted">{formatDate(b.bookingDate)}</td>
                      <td className="td-bold">{getBranchName(b.branchId)}</td>
                      <td>{formatCurrency(b.totalAmount)}</td>
                      <td><Badge status={b.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Results</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('results')}>
              View all →
            </button>
          </div>

          <div>
            {!results.length ? (
              <div style={{ padding: 32, textAlign: 'center' }}>No results yet</div>
            ) : (
              results.slice(0, 6).map(r => (
                <div
                  key={r.id}
                  className="table-row-hover"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 22px',
                    borderBottom: '1px solid var(--gray-100)',
                    cursor: 'pointer'
                  }}
                  onClick={() => onNavigate('results')}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{r.testName}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{formatDate(r.resultDate)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.hasAbnormalValues && <Badge status="High" label="⚠" />}
                    <Badge status={r.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { icon: '🧪', label: 'Browse Tests', page: 'tests'   },
          { icon: '📅', label: 'Book Now',     page: 'book'    },
          { icon: '🤖', label: 'AI Analysis',  page: 'ai-chat' },
          { icon: '💬', label: 'Chat',          page: 'chats'   },
        ].map(a => (
          <button
            key={a.page}
            className="card table-row-hover"
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              border: '1.5px solid var(--gray-150)',
              transition: 'all 0.2s'
            }}
            onClick={() => onNavigate(a.page)}
          >
            <div style={{ fontSize: 28 }}>{a.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{a.label}</div>
          </button>
        ))}
      </div>

    </div>
  );
}