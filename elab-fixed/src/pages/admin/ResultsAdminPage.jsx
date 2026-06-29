import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { resultsAdminApi } from '../../api/admin';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { formatDate, formatDateTime } from '../../utils/helpers';

const flagColor = (flag) => {
  if (!flag || flag === 'Normal') return { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' };
  if (flag === 'High')            return { bg: '#fff1f2', text: '#e11d48', border: '#fda4af' };
  if (flag === 'Low')             return { bg: '#eff6ff', text: '#2563eb', border: '#93c5fd' };
  return                                 { bg: '#fefce8', text: '#ca8a04', border: '#fde047' };
};

export default function ResultsAdminPage() {
  const { data, loading } = useApi(resultsAdminApi.getAll);

  const [detail, setDetail]               = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');

  // ─── Fetch detail — unwrap axios + API envelope ────────────────────────────
  const handleView = async (row) => {
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await resultsAdminApi.getById(row.id);
      // axios: res.data = API body = { success, data: { ...actual result } }
      const payload = res?.data?.data ?? res?.data ?? res;
      setDetail(payload);
    } catch (err) {
      console.error('[ResultsAdmin] detail error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Filter list ───────────────────────────────────────────────────────────
  const filtered = (data || []).filter(r => {
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchSearch = !search || r.testName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ─── Table columns (summary fields only) ──────────────────────────────────
  const cols = [
    { key: 'id',       label: 'ID',          render: v => <span className="td-mono">#{v}</span> },
    { key: 'testName', label: 'Test',         render: v => <span className="td-bold">{v || '—'}</span> },
    { key: 'resultDate', label: 'Result Date', render: v => formatDate(v) },
    { key: 'uploadedAt', label: 'Uploaded',   render: v => formatDate(v) },
    { key: 'status',   label: 'Status',       render: v => <Badge status={v} /> },
    {
      key: 'hasAbnormalValues',
      label: 'Abnormal',
      render: (v, row) => v
        ? <span className="badge badge-red">⚠ {row.abnormalCount ?? ''}</span>
        : <span style={{ color: '#aaa' }}>—</span>,
    },
    {
      key: '_view',
      label: 'Actions',
      render: (_, row) => (
        <button className="btn btn-outline btn-sm" onClick={() => handleView(row)}>
          View
        </button>
      ),
    },
  ];

  // ─── Normalize parameters using real API field names ──────────────────────
  const normalizedParams = (detail?.parameters || []).map(p => ({
    name:      p.parameterName || p.fieldName || p.name || '—',
    value:     p.value !== undefined && p.value !== null ? String(p.value) : '—',
    unit:      p.unit || '',
    flag:      p.flag || 'Normal',
    rangeMin:  p.rangeMin ?? p.minValue ?? p.min ?? null,
    rangeMax:  p.rangeMax ?? p.maxValue ?? p.max ?? null,
    isAbnormal: (p.flag && p.flag !== 'Normal') || p.isAbnormal || false,
  }));

  return (
    <div>
      <PageHeader title="Results" subtitle="All laboratory results across patients" />

      <div className="filters-row">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by test name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['Pending','Uploaded','Reviewed','Approved','Rejected'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <Table columns={cols} data={filtered} loading={loading} emptyMessage="No results found." />
      </div>

      {/* ── DETAIL MODAL ── */}
      <Modal
        open={detailLoading || !!detail}
        onClose={() => setDetail(null)}
        title={detail?.testName ?? 'Loading…'}
        subtitle={detail?.templateName ? `Template: ${detail.templateName}` : ''}
        size="lg"
      >
        {detailLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner-lg spinner" />
          </div>
        ) : detail && (
          <div>
            {/* ── META GRID ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
              background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 20,
            }}>
              {[
                ['🧬 Test',        detail.testName],
                ['📋 Template',    detail.templateName],
                ['👤 Patient',     detail.patientName],
                ['🏥 Uploaded By', detail.uploadedByName],
                ['✅ Approved By', detail.approvedByName],
                ['📅 Result Date', formatDateTime(detail.resultDate)],
                ['🕐 Uploaded At', formatDateTime(detail.uploadedAt)],
                ['🔍 Reviewed At', formatDateTime(detail.reviewedAt)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                    {value || '—'}
                  </span>
                </div>
              ))}

              {/* Status + abnormal + PDF — full width */}
              <div style={{
                gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10,
                paddingTop: 10, borderTop: '1px solid #e2e8f0',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📊 Status
                </span>
                <Badge status={detail.status} />
                {detail.hasAbnormalValues && (
                  <span className="badge badge-red">⚠ {detail.abnormalCount} Abnormal</span>
                )}
                {detail.fileUrl && (
                  <a
                    href={detail.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: 'auto' }}
                  >
                    📄 Download PDF
                  </a>
                )}
              </div>
            </div>

            {/* ── PARAMETERS TABLE ── */}
            {normalizedParams.length > 0 ? (
              <div>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
                }}>
                  Parameters ({normalizedParams.length})
                </div>

                {/* Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 140px 80px',
                  padding: '6px 12px', borderRadius: 8,
                  background: '#f1f5f9', marginBottom: 6,
                  fontSize: 11, fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  <span>Parameter</span>
                  <span style={{ textAlign: 'center' }}>Value</span>
                  <span style={{ textAlign: 'center' }}>Reference Range</span>
                  <span style={{ textAlign: 'center' }}>Flag</span>
                </div>

                {/* Rows */}
                {normalizedParams.map((p, i) => {
                  const colors = flagColor(p.flag);
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '1fr 100px 140px 80px',
                      padding: '10px 12px', borderRadius: 8,
                      background: p.isAbnormal ? '#fff8f8' : i % 2 === 0 ? '#fff' : '#fafafa',
                      borderLeft: p.isAbnormal ? '3px solid #fca5a5' : '3px solid transparent',
                      marginBottom: 3, alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 500, color: '#1e293b', fontSize: 14 }}>
                        {p.name}
                      </span>
                      <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, color: p.isAbnormal ? '#dc2626' : '#0f172a' }}>
                        {p.value}
                        {p.unit && <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8', marginLeft: 3 }}>{p.unit}</span>}
                      </span>
                      <span style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
                        {p.rangeMin !== null && p.rangeMax !== null
                          ? `${p.rangeMin} – ${p.rangeMax}${p.unit ? ` ${p.unit}` : ''}`
                          : '—'}
                      </span>
                      <span style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                          background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                        }}>
                          {p.flag}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 14 }}>
                No parameters recorded for this result.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}