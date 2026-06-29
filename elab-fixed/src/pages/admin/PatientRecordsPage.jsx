import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { patientRecordsAdminApi, resultsAdminApi } from '../../api/admin';

import PageHeader from '../../components/PageHeader';

export default function PatientRecordsPage() {
  const { data, loading } = useApi(patientRecordsAdminApi.getAll);

  const [search, setSearch] = useState('');
  const [openPatient, setOpenPatient] = useState(null);

  const [selectedResult, setSelectedResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  const patients = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const filtered = patients.filter(p =>
    !search ||
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.includes(search)
  );

  const openResult = async (id) => {
    if (!id) return;

    setLoadingResult(true);
    setSelectedResult(null);

    try {
      const res = await resultsAdminApi.getById(id);
      setSelectedResult(res.data?.data);
    } finally {
      setLoadingResult(false);
    }
  };

  return (
    <div>
      <PageHeader title="Patient Files" subtitle="Click a test to view full report" />

      {/* SEARCH */}
      <div className="filters-row">
        <input
          className="form-input"
          placeholder="Search patient..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ marginLeft: 'auto', fontSize: 13 }}>
          {filtered.length} patients
        </div>
      </div>

      {/* PATIENT LIST */}
      <div style={{ display: 'grid', gap: 12 }}>
        {loading && <span className="spinner" />}

        {filtered.map(p => (
          <div key={p.patientId} className="card">

            {/* HEADER */}
            <div
              onClick={() =>
                setOpenPatient(openPatient === p.patientId ? null : p.patientId)
              }
              style={{
                padding: 14,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.patientName}</div>
                <div style={{ fontSize: 12, color: '#777' }}>
                  {p.patientId} • {p.email}
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#999' }}>
                {p.records?.length || 0} reports
              </div>
            </div>

            {/* RECORDS */}
            {openPatient === p.patientId && (
              <div style={{ padding: 12, borderTop: '1px solid #eee' }}>

                {p.records?.map(r => (
                  <div
                    key={r.id}
                    onClick={() => openResult(r.resultId)}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 10,
                      cursor: 'pointer',
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      transition: '0.2s'
                    }}
                  >

                    {/* CLICKABLE REPORT NAME (MAIN FOCUS) */}
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      📄 {r.testName}
                    </div>

                    <div style={{
                      fontSize: 12,
                      color: '#666',
                      marginTop: 4,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{r.branchName} • {r.bookingDate}</span>

                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 999,
                        fontSize: 11,
                        background:
                          r.resultStatus === 'Approved'
                            ? '#dcfce7'
                            : r.resultStatus === 'Rejected'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          r.resultStatus === 'Approved'
                            ? '#16a34a'
                            : '#dc2626'
                      }}>
                        {r.resultStatus}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                      Click report to open full view →
                    </div>

                  </div>
                ))}

              </div>
            )}
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* NOTION-STYLE REPORT VIEWER */}
      {/* ========================= */}
      {(selectedResult || loadingResult) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 20
        }}>

          <div style={{
            width: '100%',
            maxWidth: 850,
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>

            {/* LOADING */}
            {loadingResult && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <span className="spinner" />
              </div>
            )}

            {/* CONTENT */}
            {selectedResult && !loadingResult && (
              <>
                {/* HEADER */}
                <div style={{ marginBottom: 16 }}>
                  <h2 style={{ marginBottom: 4 }}>
                    📄 {selectedResult.testName}
                  </h2>

                  <div style={{ fontSize: 13, color: '#666' }}>
                    Patient: <b>{selectedResult.patientName}</b>
                  </div>

                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Status: <b>{selectedResult.status}</b>
                  </div>
                </div>

                {/* PARAMETERS TABLE (NOTION STYLE) */}
                <div style={{
                  border: '1px solid #eee',
                  borderRadius: 10,
                  overflow: 'hidden'
                }}>

                  {selectedResult.parameters?.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 120px 120px',
                        padding: '10px 14px',
                        borderBottom: i !== selectedResult.parameters.length - 1
                          ? '1px solid #eee'
                          : 'none'
                      }}
                    >
                      <div>{p.parameterName}</div>

                      <div style={{ textAlign: 'center', fontWeight: 600 }}>
                        {p.value} {p.unit}
                      </div>

                      <div style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color:
                          p.flag === 'High'
                            ? '#dc2626'
                            : p.flag === 'Low'
                            ? '#f59e0b'
                            : '#16a34a'
                      }}>
                        {p.flag}
                      </div>
                    </div>
                  ))}

                </div>

                {/* ACTIONS */}
                <div style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 20,
                  justifyContent: 'flex-end'
                }}>

                  {selectedResult.fileUrl && (
                    <a
                      href={selectedResult.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      Open PDF Report
                    </a>
                  )}

                  <button
                    className="btn btn-outline"
                    onClick={() => setSelectedResult(null)}
                  >
                    Close
                  </button>

                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}