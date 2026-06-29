import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { staffProfilesAdminApi, branchesAdminApi } from '../../api/admin';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate, genderLabel, jobTitleLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const empty = {
  userName: '',
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  identityNumber: '',
  gender: 1,
  dateOfBirth: '',
  jobTitle: '',
  branchId: '',
};

export default function StaffPage() {
  const { data: staff, loading, refetch } = useApi(
    staffProfilesAdminApi.getAll
  );

  const { data: branches } = useApi(
    branchesAdminApi.getAll
  );

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(empty);

  const [saving, setSaving] = useState(false);

  const [toggleTarget, setToggleTarget] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(false);

  const [pwModal, setPwModal] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  // ─────────────────────────────────────────────────────────────
  // Open Create
  // ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModal(true);
  };

  // ─────────────────────────────────────────────────────────────
  // Open Edit
  // ─────────────────────────────────────────────────────────────
  const openEdit = (s) => {
    setEditing(s);

    setForm({
      userName: s.userName || '',
      fullName: s.fullName || '',
      email: s.email || '',
      password: '',
      phoneNumber: s.phoneNumber || '',
      identityNumber: s.identityNumber || '',
      gender: s.gender || 1,
      dateOfBirth: s.dateOfBirth || '',
      jobTitle: String(s.jobTitle || ''),
      branchId: String(s.branchId || ''),
    });

    setModal(true);
  };

  // ─────────────────────────────────────────────────────────────
  // Update Form
  // ─────────────────────────────────────────────────────────────
  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ─────────────────────────────────────────────────────────────
  // Create / Update Staff
  // ─────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const payload = {
        ...form,
        gender: Number(form.gender),
        jobTitle: Number(form.jobTitle),
        branchId: Number(form.branchId),
      };

      if (editing) {
        await staffProfilesAdminApi.update(editing.id, payload);
        toast.success('Staff updated!');
      } else {
        await staffProfilesAdminApi.create(payload);
        toast.success('Staff created!');
      }

      setModal(false);
      refetch();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        'Failed.';

      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Activate / Deactivate Staff
  // ─────────────────────────────────────────────────────────────
  const handleToggleActive = async () => {
    if (!toggleTarget) return;

    setSaving(true);

    try {
      if (toggleTarget.isActive) {
        await staffProfilesAdminApi.deactivate(toggleTarget.id);

        toast.success(
          `${toggleTarget.fullName} has been deactivated.`
        );
      } else {
        await staffProfilesAdminApi.activate(toggleTarget.id);

        toast.success(
          `${toggleTarget.fullName} has been activated.`
        );
      }

      setConfirmToggle(false);
      setToggleTarget(null);

      refetch();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        JSON.stringify(err.response?.data) ||
        'Failed.';

      console.error('Toggle error:', err.response?.data);

      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Change Password
  // ─────────────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await staffProfilesAdminApi.changePassword(
        editing.id,
        pwForm
      );

      toast.success('Password changed!');

      setPwModal(false);

      setPwForm({
        currentPassword: '',
        newPassword: '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        'Failed.';

      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Table Columns
  // ─────────────────────────────────────────────────────────────
  const cols = [
    {
      key: 'fullName',
      label: 'Name',
      render: (v) => (
        <span className="td-bold">{v}</span>
      ),
    },

    {
      key: 'jobTitle',
      label: 'Role',
      render: (v) => (
        <Badge
          status={jobTitleLabel(v)}
          className="badge-navy"
        />
      ),
    },

    {
      key: 'branchName',
      label: 'Branch',
    },

    {
      key: 'gender',
      label: 'Gender',
      render: (v) => genderLabel(v),
    },

    {
      key: 'hiredAt',
      label: 'Hired',
      render: (v) => (
        <span className="td-muted">
          {formatDate(v)}
        </span>
      ),
    },

    {
      key: 'isActive',
      label: 'Status',
      render: (v) => (
        <Badge status={v ? 'Active' : 'Inactive'} />
      ),
    },

    {
      key: 'id',
      label: 'Actions',

      render: (_, row) => (
        <div className="action-menu">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => openEdit(row)}
          >
            Edit
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setEditing(row);
              setPwModal(true);
            }}
          >
            🔑
          </button>

          <button
            className={`btn btn-sm ${
              row.isActive
                ? 'btn-danger'
                : 'btn-success'
            }`}
            onClick={() => {
              setToggleTarget(row);
              setConfirmToggle(true);
            }}
          >
            {row.isActive
              ? 'Deactivate'
              : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Management"
        subtitle="Manage laboratory staff and administrators"
        actions={
          <button
            className="btn btn-primary"
            onClick={openCreate}
          >
            + Add Staff
          </button>
        }
      />

      <div className="card">
        <Table
          columns={cols}
          data={staff}
          loading={loading}
          emptyMessage="No staff members found."
        />
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* Create / Edit Modal */}
      {/* ───────────────────────────────────────────── */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={
          editing
            ? 'Edit Staff Member'
            : 'Add Staff Member'
        }
        size="lg"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="spinner" />
              ) : editing ? (
                'Save Changes'
              ) : (
                'Create Staff'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">

            <div className="form-group">
              <label className="form-label">
                Username *
              </label>

              <input
                className="form-input"
                value={form.userName}
                onChange={(e) =>
                  set('userName', e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Full Name *
              </label>

              <input
                className="form-input"
                value={form.fullName}
                onChange={(e) =>
                  set('fullName', e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email *
              </label>

              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) =>
                  set('email', e.target.value)
                }
                required
              />
            </div>

            {!editing && (
              <div className="form-group">
                <label className="form-label">
                  Password *
                </label>

                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    set('password', e.target.value)
                  }
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Phone *
              </label>

              <input
                className="form-input"
                value={form.phoneNumber}
                onChange={(e) =>
                  set('phoneNumber', e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                ID Number *
              </label>

              <input
                className="form-input"
                value={form.identityNumber}
                onChange={(e) =>
                  set(
                    'identityNumber',
                    e.target.value
                  )
                }
                required
                maxLength={9}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Gender *
              </label>

              <select
                className="form-select"
                value={form.gender}
                onChange={(e) =>
                  set(
                    'gender',
                    Number(e.target.value)
                  )
                }
                required
              >
                <option value={1}>Male</option>
                <option value={2}>Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Date of Birth *
              </label>

              <input
                className="form-input"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  set(
                    'dateOfBirth',
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Job Title *
              </label>

              <select
                className="form-select"
                value={form.jobTitle}
                onChange={(e) =>
                  set(
                    'jobTitle',
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Select role…
                </option>

                <option value="1">
                  Administrator
                </option>

                <option value="2">
                  Lab Manager
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Branch *
              </label>

              <select
                className="form-select"
                value={form.branchId}
                onChange={(e) =>
                  set(
                    'branchId',
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Select branch…
                </option>

                {branches?.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                  >
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </form>
      </Modal>

      {/* ───────────────────────────────────────────── */}
      {/* Change Password Modal */}
      {/* ───────────────────────────────────────────── */}
      <Modal
        open={pwModal}
        onClose={() => setPwModal(false)}
        title="Change Staff Password"
        size="sm"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setPwModal(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleChangePassword}
              disabled={saving}
            >
              {saving ? (
                <span className="spinner" />
              ) : (
                'Change Password'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">
              Current Password
            </label>

            <input
              className="form-input"
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm((p) => ({
                  ...p,
                  currentPassword:
                    e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              New Password
            </label>

            <input
              className="form-input"
              type="password"
              value={pwForm.newPassword}
              onChange={(e) =>
                setPwForm((p) => ({
                  ...p,
                  newPassword:
                    e.target.value,
                }))
              }
              required
              minLength={8}
            />
          </div>
        </form>
      </Modal>

      {/* ───────────────────────────────────────────── */}
      {/* Confirm Activate / Deactivate */}
      {/* ───────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmToggle}
        onClose={() => {
          setConfirmToggle(false);
          setToggleTarget(null);
        }}
        onConfirm={handleToggleActive}
        title={
          toggleTarget?.isActive
            ? 'Deactivate Staff'
            : 'Activate Staff'
        }
        message={
          toggleTarget?.isActive
            ? `Deactivate "${toggleTarget?.fullName}"? They will lose access to the system.`
            : `Activate "${toggleTarget?.fullName}"? They will regain access to the system.`
        }
        confirmLabel={
          toggleTarget?.isActive
            ? 'Deactivate'
            : 'Activate'
        }
        danger={toggleTarget?.isActive}
        loading={saving}
      />
    </div>
  );
}