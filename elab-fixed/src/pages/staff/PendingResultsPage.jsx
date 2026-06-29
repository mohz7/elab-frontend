import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { resultsStaffApi } from '../../api/staff';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { formatDate, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function PendingResultsPage() {
  const { data: rawData, loading, refetch } = useApi(resultsStaffApi.getPending);

  // =========================
  // SAFE DATA HANDLING
  // =========================
  const data = Array.isArray(rawData)
    ? rawData
    : rawData?.data?.data
    ? rawData.data.data
    : rawData?.data
    ? rawData.data
    : [];

  const [reviewing, setReviewing] = useState(null);
  const [action, setAction] = useState('approve'); // approve | reject
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // =========================
  // ENUM MAPPING (IMPORTANT FIX)
  // =========================
  const RESULT_STATUS = {
    APPROVED: 2,
    REJECTED: 3,
  };

  // =========================
  // REVIEW CALL (FIXED)
  // =========================
  const handleReview = async () => {
    if (!reviewing?.id) return;

    setSaving(true);

    try {
      // ✅ MATCH BACKEND DTO (enum int)
      const payload = {
        Action:
          action === 'approve'
            ? RESULT_STATUS.APPROVED
            : RESULT_STATUS.REJECTED,

        RejectionNotes:
          action === 'reject' ? notes || null : null,
      };

      console.log("PAYLOAD SENT:", payload);

      await resultsStaffApi.review(reviewing.id, payload);

      toast.success('Result updated successfully');

      setReviewing(null);
      setAction('approve');
      setNotes('');

      refetch();
    } catch (err) {
      console.log('REVIEW ERROR:', err.response?.data);

      toast.error(
        err.response?.data?.errors?.Action?.[0] ||
        err.response?.data?.title ||
        'Review failed'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // SAFE DATE
  // =========================
  const safeDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  // =========================
  // TABLE COLUMNS
  // =========================
  const cols = [
    {
      key: 'id',
      label: 'ID',
      render: v => <span className="td-mono">#{v}</span>,
    },
    {
      key: 'testName',
      label: 'Test',
      render: v => <span className="td-bold">{v}</span>,
    },
    {
      key: 'resultDate',
      label: 'Result Date',
      render: v => (v ? formatDate(v) : '—'),
    },
    {
      key: 'uploadedAt',
      label: 'Uploaded',
      render: v =>
        safeDate(v) ? (
          <span className="td-muted">{formatDateTime(v)}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'hasAbnormalValues',
      label: 'Abnormal',
      render: (v, row) =>
        v ? (
          <Badge status={`${row.abnormalCount} Abnormal`} />
        ) : (
          <Badge status="Normal" />
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: v => <Badge status={v} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setReviewing(row);
            setAction('approve');
            setNotes('');
          }}
        >
          Review
        </button>
      ),
    },
  ];

  // =========================
  // UI
  // =========================
  return (
    <div>
      <PageHeader
        title="Pending Results"
        subtitle="Results waiting for review"
      />

      <div className="card">
        <Table
          columns={cols}
          data={data}
          loading={loading}
          emptyMessage="No pending results"
        />
      </div>

      {/* =========================
          MODAL
      ========================= */}
      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={`Review Result #${reviewing?.id}`}
        subtitle={reviewing?.testName}
        size="lg"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setReviewing(null)}
            >
              Cancel
            </button>

            <button
              className={`btn ${
                action === 'approve' ? 'btn-primary' : 'btn-danger'
              }`}
              onClick={handleReview}
              disabled={saving}
            >
              {saving ? 'Processing...' : action}
            </button>
          </>
        }
      >
        {reviewing && (
          <div>
            {/* INFO */}
            <div className="info-grid" style={{ marginBottom: 16 }}>
              {[
                ['Uploaded', reviewing.uploadedAt ? formatDateTime(reviewing.uploadedAt) : '—'],
                ['Result Date', reviewing.resultDate ? formatDate(reviewing.resultDate) : '—'],
                ['Abnormal', reviewing.hasAbnormalValues ? reviewing.abnormalCount : 'None'],
              ].map(([k, v]) => (
                <div key={k} className="info-row">
                  <div className="info-row-key">{k}</div>
                  <div className="info-row-val">{v}</div>
                </div>
              ))}
            </div>

            {/* DECISION */}
            <div className="section-title">Decision</div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button
                className={`btn ${action === 'approve' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setAction('approve')}
              >
                Approve
              </button>

              <button
                className={`btn ${action === 'reject' ? 'btn-danger' : 'btn-outline'}`}
                onClick={() => setAction('reject')}
              >
                Reject
              </button>
            </div>

            {action === 'reject' && (
              <div className="form-group">
                <label className="form-label">Rejection Notes</label>
                <textarea
                  className="form-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason..."
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}