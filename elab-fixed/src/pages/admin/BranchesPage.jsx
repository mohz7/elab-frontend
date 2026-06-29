import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { branchesAdminApi } from '../../api/admin';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const empty = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  isActive: true,
};

export default function BranchesPage() {
  const { data: branches, loading, refetch } =
    useApi(branchesAdminApi.getAll);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModal(true);
  };

  const openEdit = (b) => {
    setEditing(b);

    setForm({
      name: b.name,
      phone: b.phone,
      email: b.email,
      address: b.address,
      city: b.city,
      isActive: b.isActive,
    });

    setModal(true);
  };

  const set = (k, v) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await branchesAdminApi.update(editing.id, form);
      } else {
        await branchesAdminApi.create(form);
      }

      toast.success(
        editing
          ? 'Branch updated successfully!'
          : 'Branch created successfully!'
      );

      setModal(false);
      refetch();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to save branch.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedBranch) return;

    setSaving(true);

    try {
      if (selectedBranch.isActive) {
        await branchesAdminApi.deactivate(
          selectedBranch.id
        );

        toast.success('Branch deactivated.');
      } else {
        await branchesAdminApi.activate(
          selectedBranch.id
        );

        toast.success('Branch activated.');
      }

      setConfirmStatus(false);
      refetch();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to update branch status.'
      );
    } finally {
      setSaving(false);
    }
  };

  const cols = [
    {
      key: 'name',
      label: 'Branch Name',
      render: (v) => (
        <span className="td-bold">{v}</span>
      ),
    },

    {
      key: 'city',
      label: 'City',
    },

    {
      key: 'phone',
      label: 'Phone',
    },

    {
      key: 'email',
      label: 'Email',
      render: (v) => (
        <span className="td-muted">{v}</span>
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
      key: 'createdAt',
      label: 'Created',
      render: (v) => (
        <span className="td-muted">
          {formatDate(v)}
        </span>
      ),
    },

    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div
          className="action-menu"
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <button
            className="btn btn-outline btn-sm"
            onClick={() => openEdit(row)}
          >
            Edit
          </button>

          {row.isActive ? (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => {
                setSelectedBranch(row);
                setConfirmStatus(true);
              }}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="btn btn-success btn-sm"
              onClick={() => {
                setSelectedBranch(row);
                setConfirmStatus(true);
              }}
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle="Manage laboratory branches and locations"
        actions={
          <button
            className="btn btn-primary"
            onClick={openCreate}
          >
            + Add Branch
          </button>
        }
      />

      <div className="card">
        <Table
          columns={cols}
          data={branches}
          loading={loading}
          emptyMessage="No branches found."
        />
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={
          editing
            ? 'Edit Branch'
            : 'New Branch'
        }
        subtitle={
          editing
            ? `Editing: ${editing.name}`
            : 'Add a new laboratory branch'
        }
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
                'Create Branch'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">
                Branch Name *
              </label>

              <input
                className="form-input"
                value={form.name}
                onChange={(e) =>
                  set('name', e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone *
              </label>

              <input
                className="form-input"
                value={form.phone}
                onChange={(e) =>
                  set('phone', e.target.value)
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

            <div className="form-group form-full">
              <label className="form-label">
                Address *
              </label>

              <input
                className="form-input"
                value={form.address}
                onChange={(e) =>
                  set('address', e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                City *
              </label>

              <input
                className="form-input"
                value={form.city}
                onChange={(e) =>
                  set('city', e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                value={form.isActive}
                onChange={(e) =>
                  set(
                    'isActive',
                    e.target.value === 'true'
                  )
                }
              >
                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmStatus}
        onClose={() => setConfirmStatus(false)}
        onConfirm={handleToggleStatus}
        title={
          selectedBranch?.isActive
            ? 'Deactivate Branch'
            : 'Activate Branch'
        }
        message={
          selectedBranch?.isActive
            ? `Are you sure you want to deactivate "${selectedBranch?.name}"?`
            : `Are you sure you want to activate "${selectedBranch?.name}"?`
        }
        confirmLabel={
          selectedBranch?.isActive
            ? 'Deactivate'
            : 'Activate'
        }
        danger={selectedBranch?.isActive}
        loading={saving}
      />
    </div>
  );
}