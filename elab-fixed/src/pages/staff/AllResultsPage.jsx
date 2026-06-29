import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { resultsStaffApi } from '../../api/staff';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { formatDate, formatDateTime } from '../../utils/helpers';

export default function ResultsStaffPage() {
  const { data: rawData, loading } = useApi(resultsStaffApi.getAll);

  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  // =========================
  // FILTER
  // =========================
  const filtered = data.filter(r => {
    const matchStatus = !statusFilter || r.status === statusFilter;

    const matchSearch =
      !search ||
      r.testName?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).includes(search);

    return matchStatus && matchSearch;
  });

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
      key: 'patientName',
      label: 'Patient',
      render: v => v || '—',
    },
    {
      key: 'templateName',
      label: 'Template',
      render: v => v || '—',
    },
    {
      key: 'resultDate',
      label: 'Result Date',
      render: v => (v ? formatDate(v) : '—'),
    },
    {
      key: 'uploadedByName',
      label: 'Uploaded By',
      render: v => v || '—',
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
          className="btn btn-outline btn-sm"
          onClick={() => setViewing(row)}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="All laboratory results across patients"
      />

      {/* ================= FILTERS ================= */}
      <div className="filters-row">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>

          <input
            placeholder="Search by test, patient or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>

          {['Pending', 'Uploaded', 'Reviewed', 'Approved', 'Rejected'].map(
            s => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>

        <div
          style={{
            marginLeft: 'auto',
            fontSize: 13,
            color: 'var(--gray-500)',
          }}
        >
          {filtered.length} results
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card">
        <Table
          columns={cols}
          data={filtered}
          loading={loading}
          emptyMessage="No results found."
        />
      </div>

      {/* ================= MODAL ================= */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`Result #${viewing?.id}`}
        subtitle={viewing?.testName}
        size="lg"
        footer={
          <button
            className="btn btn-outline"
            onClick={() => setViewing(null)}
          >
            Close
          </button>
        }
      >
        {viewing && (
          <div>
            {/* ================= INFO GRID ================= */}
            <div
              className="info-grid"
              style={{ marginBottom: 16 }}
            >
              {[
                ['Patient', viewing.patientName || '—'],
                ['Template', viewing.templateName || '—'],
                ['Uploaded By', viewing.uploadedByName || '—'],
                ['Approved By', viewing.approvedByName || '—'],

                [
                  'Result Date',
                  viewing.resultDate
                    ? formatDate(viewing.resultDate)
                    : '—',
                ],

                [
                  'Uploaded At',
                  viewing.uploadedAt
                    ? formatDateTime(viewing.uploadedAt)
                    : '—',
                ],

                [
                  'Reviewed At',
                  viewing.reviewedAt
                    ? formatDateTime(viewing.reviewedAt)
                    : '—',
                ],

                [
                  'Abnormal',
                  viewing.hasAbnormalValues
                    ? `${viewing.abnormalCount} value(s)`
                    : 'None',
                ],

                ['Status', <Badge status={viewing.status} />],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="info-row"
                >
                  <div className="info-row-key">{k}</div>

                  <div className="info-row-val">{v}</div>
                </div>
              ))}
            </div>

            {/* ================= PARAMETERS ================= */}
            {viewing.parameters?.length > 0 && (
              <>
                <div className="section-title">
                  Parameters
                </div>

                <div className="result-params">
                  {viewing.parameters.map((p, i) => (
                    <div
                      className="result-param"
                      key={i}
                    >
                      {/* PARAMETER NAME */}
                      <span className="result-param-name">
                        {p.parameterName}
                      </span>

                      {/* VALUE */}
                      <span
                        className={`result-param-value ${
                          p.flag?.toLowerCase() || 'normal'
                        }`}
                      >
                        {p.value} {p.unit}
                      </span>

                      {/* REFERENCE RANGE */}
                      <span className="result-param-range">
                        Ref: {p.rangeMin} – {p.rangeMax}
                      </span>

                      {/* STATUS */}
                      <Badge
                        status={p.flag || 'Normal'}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}