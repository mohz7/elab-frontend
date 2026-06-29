import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { bookingsAdminApi } from '../../api/admin';
import { branchesAdminApi, patientProfilesAdminApi } from '../../api/admin';

import Table from '../../components/Table';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';

import { formatDate, formatDateTime, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

const PAYMENT_STATUSES = [
  { label: 'Unpaid', value: 1 },
  { label: 'Paid', value: 2 },
  { label: 'Refunded', value: 3 },
];

export default function BookingsAdminPage() {
  const { data: bookings, loading, refetch } = useApi(bookingsAdminApi.getAll);
  const { data: branches } = useApi(branchesAdminApi.getAll);
  const { data: patients } = useApi(patientProfilesAdminApi.getAll);

  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [search, setSearch] = useState('');

  const [viewing, setViewing] = useState(null);
  const [changingStatus, setChangingStatus] = useState(null);

  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState(1);

  const [saving, setSaving] = useState(false);

  // =========================
  // HELPERS
  // =========================
  const getBranchName = (id) => {
    const list = branches || [];
    const b = list.find(x => Number(x.id) === Number(id));
    return b?.name || '—';
  };

  const getPatientName = (id) => {
    const list = patients || [];
    const p = list.find(x =>
      x.identityNumber === id || x.id === id
    );
    return p?.fullName || '—';
  };

  // =========================
  // FIXED API CALL (IMPORTANT)
  // =========================
  const handleStatusChange = async () => {
    if (!newStatus) return;

    setSaving(true);
    try {
      await bookingsAdminApi.changeStatus(changingStatus.id, {
        status: newStatus,
        paymentStatus: Number(newPaymentStatus),
      });

      toast.success('Booking updated successfully!');
      setChangingStatus(null);
      refetch();
    } catch {
      toast.error('Failed to update booking.');
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // FILTER
  // =========================
  const filtered = (bookings || []).filter(b => {
    const matchStatus = !statusFilter || b.status === statusFilter;

    const matchBranch =
      !branchFilter || Number(b.branchId) === Number(branchFilter);

    const matchSearch =
      !search ||
      String(b.id).includes(search) ||
      getPatientName(b.patientProfileId)
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchStatus && matchBranch && matchSearch;
  });

  // =========================
  // TABLE
  // =========================
  const cols = [
    { key: 'id', label: 'ID', render: v => <span className="td-mono">#{v}</span> },

    {
      key: 'patientProfileId',
      label: 'Patient',
      render: v => <span className="td-bold">{getPatientName(v)}</span>
    },

    {
      key: 'branchId',
      label: 'Branch',
      render: v => getBranchName(v)
    },

    {
      key: 'bookingDate',
      label: 'Date',
      render: v => formatDate(v)
    },

    {
      key: 'totalAmount',
      label: 'Amount',
      render: v => <strong>{formatCurrency(v)}</strong>
    },

    {
      key: 'status',
      label: 'Status',
      render: v => <Badge status={v} />
    },

    {
      key: 'paymentStatus',
      label: 'Payment',
      render: v => <Badge status={v} />
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-menu">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setViewing(row)}
          >
            View
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setChangingStatus(row);
              setNewStatus(row.status);
              setNewPaymentStatus(Number(row.paymentStatus) || 1);
            }}
          >
            Change Status
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Bookings" subtitle="View and manage lab appointments" />

      {/* FILTERS */}
      <div className="filters-row">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
        >
          <option value="">All Branches</option>
          {branches?.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', fontSize: 13 }}>
          {filtered.length} bookings
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <Table columns={cols} data={filtered} loading={loading} />
      </div>

      {/* VIEW MODAL */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`Booking #${viewing?.id}`}
        subtitle={`Created ${formatDateTime(viewing?.createdAt)}`}
      >
        {viewing && (
          <div className="info-grid">
            <div className="info-row">
              <div className="info-row-key">Patient</div>
              <div className="info-row-val">{getPatientName(viewing.patientProfileId)}</div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Branch</div>
              <div className="info-row-val">{getBranchName(viewing.branchId)}</div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Status</div>
              <div className="info-row-val"><Badge status={viewing.status} /></div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Payment</div>
              <div className="info-row-val"><Badge status={viewing.paymentStatus} /></div>
            </div>
          </div>
        )}
      </Modal>

      {/* CHANGE STATUS MODAL */}
      <Modal
        open={!!changingStatus}
        onClose={() => setChangingStatus(null)}
        title="Change Booking"
        size="sm"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setChangingStatus(null)}>
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleStatusChange}
              disabled={saving || !newStatus}
            >
              {saving ? <span className="spinner" /> : 'Update'}
            </button>
          </>
        }
      >
        {/* STATUS */}
        <label className="form-label">Status</label>
        <select
          className="form-select"
          value={newStatus}
          onChange={e => setNewStatus(e.target.value)}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="divider" />

        {/* PAYMENT */}
        <label className="form-label">Payment</label>

        <div className="pill-group">
          {PAYMENT_STATUSES.map(p => (
            <div
              key={p.value}
              className="badge badge-teal"
              onClick={() => setNewPaymentStatus(p.value)}
              style={{
                cursor: 'pointer',
                opacity: newPaymentStatus === p.value ? 1 : 0.4,
                transform: newPaymentStatus === p.value ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}