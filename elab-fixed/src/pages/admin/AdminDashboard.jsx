import React from 'react';
import { useApi } from '../../hooks/useApi';

import { bookingsAdminApi } from '../../api/admin';
import { staffProfilesAdminApi } from '../../api/admin';
import { patientProfilesAdminApi } from '../../api/admin';
import { branchesAdminApi } from '../../api/admin';

import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';

import { formatDate, formatCurrency } from '../../utils/helpers';

export default function AdminDashboard({ onNavigate }) {

  const { data: bookings, loading: bLoad } = useApi(bookingsAdminApi.getAll);
  const { data: staff } = useApi(staffProfilesAdminApi.getAll);
  const { data: patients } = useApi(patientProfilesAdminApi.getAll);
  const { data: branches } = useApi(branchesAdminApi.getAll);

  // =========================
  // SAFE DATA
  // =========================
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safePatients = Array.isArray(patients) ? patients : [];
  const safeBranches = Array.isArray(branches) ? branches : [];

  // =========================
  // HELPERS
  // =========================
  const getPatientName = (id) => {
    const p = safePatients.find(x =>
      Number(x.id) === Number(id) ||
      x.identityNumber === id
    );
    return p?.fullName || '—';
  };

  const getBranchName = (id) => {
    const b = safeBranches.find(x => Number(x.id) === Number(id));
    return b?.name || '—';
  };

  // =========================
  // STATS
  // =========================
  const totalRevenue =
    safeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const pending = safeBookings.filter(b => b.status === 'Pending').length;
  const confirmed = safeBookings.filter(b => b.status === 'Confirmed').length;

  const recent = [...safeBookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // =========================
  // UI
  // =========================
  return (
    <div>

      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of system activity"
      />

      {/* STATS */}
      <div className="stats-row">

        <StatCard icon="📅" label="Bookings" value={safeBookings.length} />
        <StatCard icon="⏳" label="Pending" value={pending} />
        <StatCard icon="✅" label="Confirmed" value={confirmed} />
        <StatCard icon="💰" label="Revenue" value={formatCurrency(totalRevenue)} />

        <StatCard icon="👨‍⚕️" label="Staff" value={staff?.length || 0} />
        <StatCard icon="🧑‍🤝‍🧑" label="Patients" value={safePatients.length} />
        <StatCard icon="🏥" label="Branches" value={safeBranches.length} />

      </div>

      {/* =========================
          MAIN GRID SECTION
      ========================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
          marginTop: 20
        }}
      >

        {/* RECENT BOOKINGS */}
        <div className="card">

          <div className="card-header">
            <span className="card-title">Recent Bookings</span>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('bookings')}
            >
              View All →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Branch</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {bLoad ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 30 }}>
                      <span className="spinner" />
                    </td>
                  </tr>

                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 30 }}>
                      No bookings found
                    </td>
                  </tr>

                ) : recent.map(b => (
                  <tr key={b.id}>

                    <td className="td-mono">#{b.id}</td>

                    <td className="td-bold">
                      {getPatientName(b.patientProfileId)}
                    </td>

                    <td>
                      {getBranchName(b.branchId)}
                    </td>

                    <td className="td-muted">
                      {formatDate(b.bookingDate)}
                    </td>

                    <td>
                      {formatCurrency(b.totalAmount)}
                    </td>

                    <td>
                      <Badge status={b.status} />
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>

          </div>
        </div>

        {/* BRANCHES */}
        <div className="card">

          <div className="card-header">
            <span className="card-title">Branches</span>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('branches')}
            >
              Manage →
            </button>
          </div>

          <div style={{ padding: '4px 0' }}>

            {!safeBranches || safeBranches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <span className="spinner" />
              </div>

            ) : (
              safeBranches.slice(0, 6).map(b => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 22px',
                    borderBottom: '1px solid var(--gray-100)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      {b.city}
                    </div>
                  </div>

                  <Badge status={b.isActive ? 'Active' : 'Inactive'} />
                </div>
              ))
            )}

          </div>
        </div>

      </div>

    </div>
  );
}