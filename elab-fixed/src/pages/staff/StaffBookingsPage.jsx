import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  bookingsStaffApi,
  branchesStaffApi,
  patientProfilesStaffApi,
  checkoutsStaffApi,
} from '../../api/staff';

import Table from '../../components/Table';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';

import { formatDate, formatDateTime, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

const PAYMENT_STATUSES = [
  { label: 'Unpaid', value: 'Unpaid' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Refunded', value: 'Refunded' },
];

const emptyForm = {
  patientProfileId: '',
  branchId: '',
  bookingDate: '',
  bookingTime: '',
  notes: '',
};

export default function BookingsStaffPage() {
  const { data: bookings, loading, refetch } = useApi(bookingsStaffApi.getAll);
  const { data: branches } = useApi(branchesStaffApi.getAll);
  const { data: patients } = useApi(patientProfilesStaffApi.getAll);

  const [patientNames, setPatientNames] = useState({});

  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [search, setSearch] = useState('');

  const [viewing, setViewing] = useState(null);
  const [changingStatus, setChangingStatus] = useState(null);

  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('Unpaid');

  const [saving, setSaving] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  // =========================
  // FETCH PATIENT NAMES
  // =========================
  useEffect(() => {
    if (!bookings?.length) return;

    const list = Array.isArray(patients) ? patients : [];

    bookings.forEach(async (b) => {
      const id = String(b.patientProfileId);

      // Already resolved
      if (patientNames[id]) return;

      // Found in local patients list
      const local = list.find((x) => String(x.identityNumber) === id);
      if (local) {
        setPatientNames((prev) => ({ ...prev, [id]: local.fullName }));
        return;
      }

      // Not in local list — fetch individually
      try {
        const res = await patientProfilesStaffApi.getById(id);
        const name =
          res?.data?.data?.fullName ||
          res?.data?.fullName ||
          null;
        setPatientNames((prev) => ({
          ...prev,
          [id]: name || `Unknown (${id})`,
        }));
      } catch {
        setPatientNames((prev) => ({
          ...prev,
          [id]: `Unknown (${id})`,
        }));
      }
    });
  }, [bookings, patients]);

  // =========================
  // HELPERS
  // =========================
  const getPatientName = (id) => {
    return patientNames[String(id)] || String(id);
  };

  const getBranchName = (booking) => booking?.branch || '—';

  // =========================
  // CHANGE STATUS
  // =========================
  const handleStatusChange = async () => {
    if (!newStatus || !changingStatus) return;

    setSaving(true);
    try {
      await bookingsStaffApi.changeStatus(
        changingStatus.id,
        newStatus,
        newPaymentStatus
      );
      toast.success('Booking updated successfully!');
      setChangingStatus(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking.');
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CREATE BOOKING
  // =========================
  const handleCreateBooking = async () => {
    try {
      setCreating(true);

      if (
        !form.patientProfileId ||
        !form.branchId ||
        !form.bookingDate ||
        !form.bookingTime
      ) {
        toast.error('Please fill all required fields');
        return;
      }

      const list = Array.isArray(patients) ? patients : [];
      const selectedPatient = list.find(
        (p) => String(p.id) === String(form.patientProfileId)
      );

      if (!selectedPatient) {
        toast.error('Patient not found');
        return;
      }

      const payload = {
        paymentMethod: 1,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        notes: form.notes || '',
        branchId: Number(form.branchId),
      };

      await checkoutsStaffApi.payPatient(selectedPatient.identityNumber, payload);

      toast.success(`Booking created for ${selectedPatient.fullName}`);
      setCreateModal(false);
      setForm(emptyForm);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // FILTER
  // =========================
  const filtered = (bookings || []).filter((b) => {
    const matchStatus = !statusFilter || b.status === statusFilter;

    const matchBranch =
      !branchFilter ||
      b.branch === branchFilter ||
      Number(b.branchId) === Number(branchFilter);

    const matchSearch =
      !search ||
      String(b.id).includes(search) ||
      getPatientName(b.patientProfileId)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (b.branch || '').toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchBranch && matchSearch;
  });

  // =========================
  // TABLE COLUMNS
  // =========================
  const cols = [
    {
      key: 'id',
      label: 'ID',
      render: (v) => <span className="td-mono">#{v}</span>,
    },
    {
      key: 'patientProfileId',
      label: 'Patient',
      render: (v) => (
        <span className="td-bold">{getPatientName(v)}</span>
      ),
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (v) => v || '—',
    },
    {
      key: 'bookingDate',
      label: 'Date',
      render: (v) => formatDate(v),
    },
    {
      key: 'bookingTime',
      label: 'Time',
      render: (v) => v || '—',
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (v) => <strong>{formatCurrency(v)}</strong>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge status={v} />,
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (v) => <Badge status={v} />,
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
              setNewStatus(row.status || 'Pending');
              setNewPaymentStatus(row.paymentStatus || 'Unpaid');
            }}
          >
            Change Status
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>

      {/* HEADER */}
      <PageHeader
        title="Bookings"
        subtitle="View and manage lab appointments"
        actions={
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            + New Booking
          </button>
        }
      />

      {/* FILTERS */}
      <div className="filters-row">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by ID, patient, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
        >
          <option value="">All Branches</option>
          {branches?.map((b) => (
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

      {/* ── VIEW MODAL ── */}
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
              <div className="info-row-val">
                {getPatientName(viewing.patientProfileId)}
              </div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Branch</div>
              <div className="info-row-val">{getBranchName(viewing)}</div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Date</div>
              <div className="info-row-val">{formatDate(viewing.bookingDate)}</div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Time</div>
              <div className="info-row-val">{viewing.bookingTime || '—'}</div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Status</div>
              <div className="info-row-val">
                <Badge status={viewing.status} />
              </div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Payment</div>
              <div className="info-row-val">
                <Badge status={viewing.paymentStatus} />
              </div>
            </div>

            <div className="info-row">
              <div className="info-row-key">Total</div>
              <div className="info-row-val">
                <strong>{formatCurrency(viewing.totalAmount)}</strong>
              </div>
            </div>

            {viewing.notes && (
              <div className="info-row">
                <div className="info-row-key">Notes</div>
                <div className="info-row-val">{viewing.notes}</div>
              </div>
            )}

            {viewing.staffProfile && (
              <div className="info-row">
                <div className="info-row-key">Staff</div>
                <div className="info-row-val">{viewing.staffProfile}</div>
              </div>
            )}

            {viewing.bookingItems?.length > 0 && (
              <div className="info-row" style={{ flexDirection: 'column', gap: 8 }}>
                <div className="info-row-key" style={{ marginBottom: 4 }}>
                  Tests Ordered
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 600 }}>Test</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600 }}>Unit Price</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600 }}>Final Price</th>
                      <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600 }}>Offer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewing.bookingItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '6px 8px' }}>{item.testName}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                          <strong>{formatCurrency(item.finalPrice)}</strong>
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--color-success)' }}>
                          {item.offer || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* ── CHANGE STATUS MODAL ── */}
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
        <label className="form-label">Status</label>
        <select
          className="form-select"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="divider" />

        <label className="form-label">Payment</label>
        <div className="pill-group">
          {PAYMENT_STATUSES.map((p) => (
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

      {/* ── CREATE BOOKING MODAL ── */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Booking"
        subtitle="Booking will be created after payment"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setCreateModal(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateBooking}
              disabled={creating}
            >
              {creating ? <span className="spinner" /> : 'Create & Pay'}
            </button>
          </>
        }
      >
        <div className="form-grid">

          <div className="form-group">
            <label>Patient *</label>
            <select
              className="form-select"
              value={form.patientProfileId}
              onChange={(e) => setForm({ ...form, patientProfileId: e.target.value })}
            >
              <option value="">Select Patient</option>
              {(Array.isArray(patients) ? patients : []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.identityNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Branch *</label>
            <select
              className="form-select"
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
            >
              <option value="">Select Branch</option>
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              className="form-input"
              value={form.bookingDate}
              onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Time *</label>
            <input
              type="time"
              className="form-input"
              value={form.bookingTime}
              onChange={(e) => setForm({ ...form, bookingTime: e.target.value })}
            />
          </div>

          <div className="form-group form-full">
            <label>Notes</label>
            <textarea
              className="form-input"
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

        </div>
      </Modal>

    </div>
  );
}