import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { patientProfilesAdminApi, branchesAdminApi } from '../../api/admin';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { formatDate, genderLabel } from '../../utils/helpers';

export default function AdminPatientsPage() {
  const { data: patientsRaw, loading } = useApi(patientProfilesAdminApi.getAll);
  const { data: branchesRaw }          = useApi(branchesAdminApi.getAll);

  const [viewing, setViewing] = useState(null);
  const [search,  setSearch]  = useState('');

  const patients = Array.isArray(patientsRaw)       ? patientsRaw
                 : Array.isArray(patientsRaw?.data)  ? patientsRaw.data : [];
  const branches = Array.isArray(branchesRaw)       ? branchesRaw
                 : Array.isArray(branchesRaw?.data)  ? branchesRaw.data : [];

  const branchName = (id) =>
    !id ? '—' : (branches.find(b => String(b.id) === String(id))?.name ?? `Branch #${id}`);

  const filtered = patients.filter(p =>
    !search ||
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.identityNumber?.includes(search)
  );

  const cols = [
    {
      key: 'fullName',
      label: 'Patient Name',
      render: v => <span className="td-bold">{v}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: v => <span className="td-muted">{v}</span>,
    },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'gender',      label: 'Gender',     render: v => genderLabel(v) },
    { key: 'dateOfBirth', label: 'DOB',         render: v => formatDate(v) },
    { key: 'bloodType',   label: 'Blood Type',  render: v => v || '—' },
    {
      key: 'branchId',
      label: 'Branch',
      render: v => branchName(v),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setViewing(row)}
        >
          View Profile
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Patient Profiles"
        subtitle="View registered patients"
      />

      <div className="filters-row">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by name, email, or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-500)' }}>
          {filtered.length} patients
        </div>
      </div>

      <div className="card">
        <Table
          columns={cols}
          data={filtered}
          loading={loading}
          emptyMessage="No patients found."
        />
      </div>

      {/* VIEW MODAL */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.fullName}
        subtitle="Patient Profile"
        size="lg"
      >
        {viewing && (
          <div>
            <div className="section-title">Personal Information</div>
            <div className="info-grid">
              {[
                ['Email',      viewing.email],
                ['Phone',      viewing.phoneNumber],
                ['ID Number',  viewing.identityNumber],
                ['Gender',     genderLabel(viewing.gender)],
                ['DOB',        formatDate(viewing.dateOfBirth)],
                ['Blood Type', viewing.bloodType || '—'],
                ['Branch',     branchName(viewing.branchId)],
              ].map(([k, v]) => (
                <div key={k} className="info-row">
                  <div className="info-row-key">{k}</div>
                  <div className="info-row-val">{v}</div>
                </div>
              ))}
            </div>

            <div className="section-title" style={{ marginTop: 16 }}>Medical Information</div>
            <div className="info-grid">
              {[
                ['Allergies',         viewing.allergies        || '—'],
                ['Chronic Diseases',  viewing.chronicDiseases  || '—'],
                ['Emergency Contact', viewing.emergencyContactName  || '—'],
                ['Emergency Phone',   viewing.emergencyContactPhone || '—'],
                ['Insurance Company', viewing.insuranceCompany || '—'],
                ['Insurance Number',  viewing.insuranceNumber  || '—'],
              ].map(([k, v]) => (
                <div key={k} className="info-row">
                  <div className="info-row-key">{k}</div>
                  <div className="info-row-val">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}