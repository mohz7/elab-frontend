import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { testCatalogsAdminApi } from '../../api/admin';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

const empty = {
  name: '',
  description: '',
  category: '',
  sampleType: '',
  turnaroundHours: 24,
  isActive: true,
};

export default function TestCatalogsPage() {
  const { data, loading, refetch } = useApi(testCatalogsAdminApi.getAll);

  // ✅ local table state
  const [tests, setTests] = useState([]);

  React.useEffect(() => {
    if (data) {
      setTests(data);
    }
  }, [data]);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmToggle, setConfirmToggle] = useState(null);

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
  const openEdit = (t) => {
    setEditing(t);

    setForm({
      name: t.name,
      description: t.description,
      category: t.category,
      sampleType: t.sampleType,
      turnaroundHours: t.turnaroundHours,
      isActive: t.isActive,
    });

    setModal(true);
  };

  const set = (k, v) =>
    setForm((p) => ({
      ...p,
      [k]: v,
    }));

  // ─────────────────────────────────────────────────────────────
  // Create / Update
  // ─────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      if (editing) {
        await testCatalogsAdminApi.update(editing.id, {
          ...form,
          turnaroundHours: Number(form.turnaroundHours),
        });

        toast.success('Test updated!');
      } else {
        await testCatalogsAdminApi.create({
          ...form,
          turnaroundHours: Number(form.turnaroundHours),
        });

        toast.success('Test created!');
      }

      // ✅ refresh data
      await refetch();

      setModal(false);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Toggle Active / Inactive
  // ─────────────────────────────────────────────────────────────
  const handleToggle = async () => {
    setSaving(true);

    try {
      // deactivate
      if (confirmToggle.isActive) {
        await testCatalogsAdminApi.deactivate(confirmToggle.id);

        toast.success(
          `"${confirmToggle.name}" has been deactivated.`
        );
      }

      // activate
      else {
        await testCatalogsAdminApi.activate(confirmToggle.id);

        toast.success(
          `"${confirmToggle.name}" has been activated.`
        );
      }

      // ✅ INSTANT UI UPDATE
      setTests((prev) =>
        prev.map((item) =>
          item.id === confirmToggle.id
            ? {
                ...item,
                isActive: !item.isActive,
              }
            : item
        )
      );

      setConfirmToggle(null);

      // optional backend refresh
      await refetch();

    } catch (err) {
      const errorCode = err.response?.data?.errorCode || '';
      const status = err.response?.status;

      if (
        errorCode === 'Already active' ||
        errorCode === 'Already inactive'
      ) {
        toast('Already up to date — refreshing.', {
          icon: 'ℹ️',
        });

        await refetch();

        setConfirmToggle(null);

      } else if (status === 403) {
        toast.error(
          'Cannot deactivate — this test is used in existing bookings.'
        );

      } else {
        toast.error(
          err.response?.data?.message || 'Failed.'
        );
      }

    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Search Filter
  // ─────────────────────────────────────────────────────────────
  const filtered =
    tests?.filter(
      (t) =>
        t.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        t.category
          ?.toLowerCase()
          .includes(search.toLowerCase())
    ) || [];

  // ─────────────────────────────────────────────────────────────
  // Table Columns
  // ─────────────────────────────────────────────────────────────
  const cols = [
    {
      key: 'name',
      label: 'Test Name',
      render: (v) => (
        <span className="td-bold">{v}</span>
      ),
    },

    {
      key: 'category',
      label: 'Category',
      render: (v) => (
        <Badge
          status={v}
          className="badge-blue"
        />
      ),
    },

    {
      key: 'sampleType',
      label: 'Sample Type',
    },

    {
      key: 'turnaroundHours',
      label: 'Turnaround',
      render: (v) => `${v}h`,
    },

    {
      key: 'isActive',
      label: 'Status',
      render: (v) => (
        <Badge
          status={v ? 'Active' : 'Inactive'}
        />
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
            className={`btn btn-sm ${
              row.isActive
                ? 'btn-danger'
                : 'btn-primary'
            }`}
            onClick={() =>
              setConfirmToggle(row)
            }
          >
            {row.isActive
              ? 'Deactivate'
              : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Test Catalog"
        subtitle="Manage available laboratory tests"
        actions={
          <button
            className="btn btn-primary"
            onClick={openCreate}
          >
            + Add Test
          </button>
        }
      />

      {/* Search */}
      <div className="filters-row">
        <div className="search-wrap">
          <span className="search-icon">
            🔍
          </span>

          <input
            placeholder="Search tests…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={cols}
          data={filtered}
          loading={loading}
          emptyMessage="No tests found."
        />
      </div>

      {/* ───────────────────────────── */}
      {/* Create / Edit Modal */}
      {/* ───────────────────────────── */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={
          editing
            ? 'Edit Test'
            : 'Add Test'
        }
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() =>
                setModal(false)
              }
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
                'Save'
              ) : (
                'Create'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">

            <div className="form-group form-full">
              <label className="form-label">
                Test Name *
              </label>

              <input
                className="form-input"
                value={form.name}
                onChange={(e) =>
                  set(
                    'name',
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">
                Description
              </label>

              <textarea
                className="form-textarea"
                value={form.description}
                onChange={(e) =>
                  set(
                    'description',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Category *
              </label>

              <input
                className="form-input"
                placeholder="e.g. Hematology"
                value={form.category}
                onChange={(e) =>
                  set(
                    'category',
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Sample Type *
              </label>

              <input
                className="form-input"
                placeholder="e.g. Blood"
                value={form.sampleType}
                onChange={(e) =>
                  set(
                    'sampleType',
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Turnaround (hours) *
              </label>

              <input
                className="form-input"
                type="number"
                min={1}
                value={form.turnaroundHours}
                onChange={(e) =>
                  set(
                    'turnaroundHours',
                    e.target.value
                  )
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
                    e.target.value ===
                      'true'
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

      {/* ───────────────────────────── */}
      {/* Confirm Toggle */}
      {/* ───────────────────────────── */}
      <ConfirmDialog
        open={!!confirmToggle}
        onClose={() =>
          setConfirmToggle(null)
        }
        onConfirm={handleToggle}
        title={
          confirmToggle?.isActive
            ? 'Deactivate Test'
            : 'Activate Test'
        }
        message={
          confirmToggle?.isActive
            ? `Deactivate "${confirmToggle?.name}"? It will no longer be available for booking.`
            : `Activate "${confirmToggle?.name}"? It will become available for booking.`
        }
        confirmLabel={
          confirmToggle?.isActive
            ? 'Deactivate'
            : 'Activate'
        }
        danger={confirmToggle?.isActive}
        loading={saving}
      />
    </div>
  );
}