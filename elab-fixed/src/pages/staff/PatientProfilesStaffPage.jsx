import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  patientProfilesStaffApi,
  branchesStaffApi,
  staffProfileApi
} from '../../api/staff';

import Table from '../../components/Table';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';

import { formatDate, genderLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const emptyForm = {
  userName: '',
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  identityNumber: '',
  gender: 1,
  dateOfBirth: '',
  bloodType: '',
  allergies: '',
  chronicDiseases: '',
  notes: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  insuranceCompany: '',
  insuranceNumber: '',
};

export default function StaffPatientsPage() {

  const { data, loading, refetch } =
    useApi(patientProfilesStaffApi.getAll);

  const { data: branches } =
    useApi(branchesStaffApi.getAll);

  const { data: staffProfile } =
    useApi(staffProfileApi.getMyProfile);

  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // =========================
  // LOCK STAFF BRANCH
  // =========================
  const getStaffBranchId = () =>
    staffProfile?.branchId ||
    staffProfile?.branch?.id ||
    branches?.[0]?.id;

  // =========================
  // CREATE
  // =========================
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  // =========================
  // EDIT
  // =========================
  const openEdit = (patient) => {
    setEditing(patient);
    setForm({
      ...emptyForm,
      ...patient,
      password: '',
      dateOfBirth: patient.dateOfBirth
        ? String(patient.dateOfBirth).slice(0, 10)
        : ''
    });
    setOpen(true);
  };

  // =========================
  // SAVE (CREATE + UPDATE)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const branchId = getStaffBranchId();

      if (!branchId) {
        toast.error("Staff branch not found");
        return;
      }

      const basePayload = {
        userName: form.userName,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        identityNumber: form.identityNumber,
        gender: Number(form.gender),
        dateOfBirth: form.dateOfBirth,
        bloodType: form.bloodType,
        allergies: form.allergies,
        chronicDiseases: form.chronicDiseases,
        notes: form.notes,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        insuranceCompany: form.insuranceCompany,
        insuranceNumber: form.insuranceNumber,
        branchId: Number(branchId),   // 🔒 always auto-assigned
      };

      // Only include password when creating, or when explicitly changed on edit
      if (!editing?.id || form.password) {
        basePayload.password = form.password;
      }

      if (editing?.id) {
        await patientProfilesStaffApi.updateById(editing.id, basePayload);
        toast.success(`Patient ${form.fullName} updated`);
      } else {
        await patientProfilesStaffApi.create(basePayload);
        toast.success(`Patient ${form.fullName} created`);
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      refetch();

    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const filtered =
    data?.filter(p =>
      !search ||
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.identityNumber?.includes(search)
    ) || [];

  const cols = [
    { key: 'fullName', label: 'Patient Name', render: v => <b>{v}</b> },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'identityNumber', label: 'ID' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm"
            onClick={() => setViewing(row)}>
            View
          </button>
          <button className="btn btn-primary btn-sm"
            onClick={() => openEdit(row)}>
            Edit
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Patient Profiles"
        subtitle="Staff Management"
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Patient
          </button>
        }
      />

      <input
        className="form-input"
        placeholder="Search patients..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <div className="card">
        <Table
          columns={cols}
          data={filtered}
          loading={loading}
        />
      </div>

      {/* ============================
          CREATE / EDIT MODAL
      ============================ */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 style={{ marginBottom: 16 }}>
          {editing ? 'Edit Patient' : 'Add Patient'}
        </h3>

        <form onSubmit={handleSubmit} className="form-grid">

          {/* ── Account ── */}
          <input
            className="form-input"
            placeholder="Username *"
            required
            value={form.userName}
            onChange={e => set('userName', e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Full Name *"
            required
            value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
          />

          <input
            className="form-input"
            type="email"
            placeholder="Email *"
            required
            value={form.email}
            onChange={e => set('email', e.target.value)}
          />

          <input
            className="form-input"
            type="password"
            placeholder={editing ? 'New Password (leave blank to keep)' : 'Password *'}
            required={!editing}
            value={form.password}
            onChange={e => set('password', e.target.value)}
          />

          {/* ── Personal ── */}
          <input
            className="form-input"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={e => set('phoneNumber', e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Identity Number"
            value={form.identityNumber}
            onChange={e => set('identityNumber', e.target.value)}
          />

          <select
            className="form-input"
            value={form.gender}
            onChange={e => set('gender', Number(e.target.value))}
          >
            <option value={1}>Male</option>
            <option value={2}>Female</option>
          </select>

          <input
            className="form-input"
            type="date"
            placeholder="Date of Birth"
            value={form.dateOfBirth}
            onChange={e => set('dateOfBirth', e.target.value)}
          />

          {/* ── Medical ── */}
          <input
            className="form-input"
            placeholder="Blood Type (e.g. O+)"
            value={form.bloodType}
            onChange={e => set('bloodType', e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Allergies"
            value={form.allergies}
            onChange={e => set('allergies', e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Chronic Diseases"
            value={form.chronicDiseases}
            onChange={e => set('chronicDiseases', e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Notes"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />

          {/* ── Emergency Contact ── */}
          <input
            className="form-input"
            placeholder="Emergency Contact Name"
            value={form.emergencyContactName}
            onChange={e => set('emergencyContactName', e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Emergency Contact Phone"
            value={form.emergencyContactPhone}
            onChange={e => set('emergencyContactPhone', e.target.value)}
          />

          {/* ── Insurance ── */}
          <input
            className="form-input"
            placeholder="Insurance Company"
            value={form.insuranceCompany}
            onChange={e => set('insuranceCompany', e.target.value)}
          />

          <input
            className="form-input"
            placeholder="Insurance Number"
            value={form.insuranceNumber}
            onChange={e => set('insuranceNumber', e.target.value)}
          />

          {/* branchId is auto-assigned from staffProfile — not shown */}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ gridColumn: '1 / -1' }}
          >
            {saving ? 'Saving...' : editing ? 'Update Patient' : 'Create Patient'}
          </button>

        </form>
      </Modal>

      {/* ============================
          VIEW MODAL
      ============================ */}
      {viewing && (
        <Modal open={!!viewing} onClose={() => setViewing(null)}>
          <h3 style={{ marginBottom: 16 }}>{viewing.fullName}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Username', viewing.userName],
                ['Email', viewing.email],
                ['Phone', viewing.phoneNumber],
                ['Identity Number', viewing.identityNumber],
                ['Gender', genderLabel(viewing.gender)],
                ['Date of Birth', viewing.dateOfBirth ? formatDate(viewing.dateOfBirth) : '—'],
                ['Blood Type', viewing.bloodType],
                ['Allergies', viewing.allergies],
                ['Chronic Diseases', viewing.chronicDiseases],
                ['Notes', viewing.notes],
                ['Emergency Contact', viewing.emergencyContactName],
                ['Emergency Phone', viewing.emergencyContactPhone],
                ['Insurance Company', viewing.insuranceCompany],
                ['Insurance Number', viewing.insuranceNumber],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600, whiteSpace: 'nowrap', color: '#555' }}>
                    {label}
                  </td>
                  <td style={{ padding: '8px 4px' }}>{value || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

    </div>
  );
}
