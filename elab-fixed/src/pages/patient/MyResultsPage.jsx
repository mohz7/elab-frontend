import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { resultsPatientApi, aiChatApi, chatsPatientApi } from '../../api/patient';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { formatDate, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function MyResultsPage({ onNavigate }) {
  const { data, loading } = useApi(resultsPatientApi.getMyResults);

  const [detail, setDetail]               = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [startingAI, setStartingAI]       = useState(false);
  const [startingChat, setStartingChat]   = useState(false); // ✅ new
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');

  // ─── Fetch detail ──────────────────────────────────────────────────────────
  const handleView = async (summary) => {
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await resultsPatientApi.getById(summary.id);
      const payload = res?.data?.data ?? res?.data ?? res;
      setDetail(payload);
    } catch (err) {
      console.error('[MyResults] detail error:', err);
      toast.error('Failed to load result details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── List filtering ────────────────────────────────────────────────────────
  const summaryList = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const filtered = summaryList.filter(r => {
    const matchSearch = !search || r.testName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ─── Normalize parameters ──────────────────────────────────────────────────
  const normalizedParams = useMemo(() => {
    if (!detail?.parameters) return [];
    return detail.parameters.map(p => ({
      name:       p.parameterName || p.fieldName || p.name || '—',
      value:      p.value !== undefined && p.value !== null ? String(p.value) : '—',
      unit:       p.unit || '',
      flag:       p.flag || 'Normal',
      rangeMin:   p.rangeMin ?? p.minValue ?? p.min ?? null,
      rangeMax:   p.rangeMax ?? p.maxValue ?? p.max ?? null,
      isAbnormal: (p.flag && p.flag !== 'Normal') || p.isAbnormal || false,
    }));
  }, [detail]);

  // ─── AI session ───────────────────────────────────────────────────────────
  const handleStartAI = async (resultId) => {
    setStartingAI(true);
    try {
      const res = await aiChatApi.startSession({ resultId });
      const sessionId = res?.data?.data?.id || res?.data?.id || res?.data?.sessionId;
      if (sessionId) sessionStorage.setItem('aiSessionId', String(sessionId));
      toast.success('AI session started!');
      onNavigate('ai-chat');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to start AI session.');
    } finally {
      setStartingAI(false);
    }
  };

  // ─── Staff chat session ✅ ────────────────────────────────────────────────
  const handleStartChat = async (resultId) => {
    setStartingChat(true);
    try {
      await chatsPatientApi.createSession({ resultId });
      toast.success('Chat session created!');
      setDetail(null);
      onNavigate('chats');
    } catch (err) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.message || '';
      // Backend returns 400 when session already exists for this result
      if (status === 400) {
        toast('A chat already exists for this result — opening it now.', { icon: 'ℹ️' });
        setDetail(null);
        onNavigate('chats');
      } else {
        toast.error(msg || 'Failed to start chat.');
      }
    } finally {
      setStartingChat(false);
    }
  };

  const flagColor = (flag) => {
    if (!flag || flag === 'Normal') return { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' };
    if (flag === 'High')            return { bg: '#fff1f2', text: '#e11d48', border: '#fda4af' };
    if (flag === 'Low')             return { bg: '#eff6ff', text: '#2563eb', border: '#93c5fd' };
    return                                 { bg: '#fefce8', text: '#ca8a04', border: '#fde047' };
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader title="My Results" subtitle="Your laboratory test results" />

      {/* FILTERS */}
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
          {['Pending', 'Uploaded', 'Reviewed', 'Approved', 'Rejected'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="page-loader"><span className="spinner-lg spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <div className="empty-state-icon">🔬</div>
          <h3>{search || statusFilter ? 'No matching results' : 'No results yet'}</h3>
          <p>{search || statusFilter
            ? 'Try adjusting your search or filter.'
            : 'Your lab results will appear here once uploaded by our staff.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(result => (
            <div key={result.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 15 }}>{result.testName}</b>
                    <Badge status={result.status} />
                    {result.hasAbnormalValues && (
                      <span className="badge badge-red">
                        ⚠ {result.abnormalCount ? `${result.abnormalCount} Abnormal` : 'Abnormal'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#888', marginTop: 5 }}>
                    📅 {formatDate(result.resultDate)}
                    {result.uploadedAt && <>&nbsp;·&nbsp;Uploaded {formatDate(result.uploadedAt)}</>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleView(result)}>
                    View
                  </button>
                  {/* ✅ Chat button — available on Uploaded / Reviewed / Approved */}
                  {['Uploaded', 'Reviewed', 'Approved'].includes(result.status) && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleStartChat(result.id)}
                      disabled={startingChat}
                      title="Chat with lab staff about this result"
                    >
                      {startingChat ? '…' : '💬 Chat'}
                    </button>
                  )}
                  {result.status === 'Approved' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartAI(result.id)}
                      disabled={startingAI}
                    >
                      {startingAI ? '…' : '🤖 AI'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DETAIL MODAL ──────────────────────────────────────────────────────── */}
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
          <div style={{ fontFamily: 'inherit' }}>

            {/* ── HEADER BAND ── */}
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

              {/* Status spans full width */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4, borderTop: '1px solid #e2e8f0' }}>
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
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: 10,
                }}>
                  Parameters ({normalizedParams.length})
                </div>

                {/* Header row */}
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
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: p.isAbnormal ? '#fff8f8' : i % 2 === 0 ? '#fff' : '#fafafa',
                      borderLeft: p.isAbnormal ? '3px solid #fca5a5' : '3px solid transparent',
                      marginBottom: 3,
                      alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 500, color: '#1e293b', fontSize: 14 }}>
                        {p.name}
                      </span>

                      <span style={{
                        textAlign: 'center', fontWeight: 700,
                        fontSize: 15, color: p.isAbnormal ? '#dc2626' : '#0f172a',
                      }}>
                        {p.value}
                        {p.unit && (
                          <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8', marginLeft: 3 }}>
                            {p.unit}
                          </span>
                        )}
                      </span>

                      <span style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
                        {p.rangeMin !== null && p.rangeMax !== null
                          ? `${p.rangeMin} – ${p.rangeMax}${p.unit ? ` ${p.unit}` : ''}`
                          : '—'}
                      </span>

                      <span style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                          background: colors.bg, color: colors.text,
                          border: `1px solid ${colors.border}`,
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

            {/* ── MODAL ACTION BUTTONS ✅ ── */}
            {['Uploaded', 'Reviewed', 'Approved'].includes(detail.status) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {/* ✅ Chat button inside modal */}
                <button
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  disabled={startingChat}
                  onClick={() => handleStartChat(detail.id)}
                >
                  {startingChat ? 'Opening…' : '💬 Chat with Staff'}
                </button>

                {/* AI button — only when Approved */}
                {detail.status === 'Approved' && (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={startingAI}
                    onClick={() => { setDetail(null); handleStartAI(detail.id); }}
                  >
                    {startingAI ? 'Starting…' : '🤖 Analyze with AI'}
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </Modal>
    </div>
  );
}