import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  reportTemplatesAdminApi,
  testCatalogsAdminApi
} from '../../api/admin';

import Table from '../../components/Table';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const emptyField = { name: '', type: 'Number', unit: '' };

const emptyForm = {
  name: '',
  description: '',
  version: 1,
  testCatalogId: '',
  fields: [{ ...emptyField }]
};

export default function ReportTemplatesPage() {
  const { data, loading, refetch } = useApi(reportTemplatesAdminApi.getAll);
  const { data: tests } = useApi(testCatalogsAdminApi.getAll);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filterTest, setFilterTest] = useState('');

  const templates = Array.isArray(data) ? data : data?.data || [];

  // =========================
  // FIX: TEST NAME MAP
  // =========================
  const testMap = useMemo(() => {
    const map = {};
    tests?.forEach(t => {
      map[t.id] = t.name;
    });
    return map;
  }, [tests]);

  // =========================
  // FILTER
  // =========================
  const filtered = filterTest
    ? templates.filter(t => String(t.testCatalogId) === filterTest)
    : templates;

  // =========================
  // FORM HANDLERS
  // =========================
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description || '',
      version: t.version,
      testCatalogId: String(t.testCatalogId || ''),
      fields: t.fields?.length ? t.fields : [{ ...emptyField }],
    });
    setModal(true);
  };

  const setF = (k, v) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const setField = (i, k, v) =>
    setForm(prev => {
      const f = [...prev.fields];
      f[i] = { ...f[i], [k]: v };
      return { ...prev, fields: f };
    });

  const addField = () =>
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, { ...emptyField }]
    }));

  const removeField = (i) =>
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, idx) => idx !== i)
    }));

  // =========================
  // SAVE
  // =========================
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        version: Number(form.version),
        testCatalogId: Number(form.testCatalogId),
      };

      if (editing) {
        await reportTemplatesAdminApi.update(editing.id, payload);
        toast.success('Template updated!');
      } else {
        await reportTemplatesAdminApi.create(payload);
        toast.success('Template created!');
      }

      setModal(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async () => {
    setSaving(true);

    try {
      await reportTemplatesAdminApi.remove(confirmDel.id);
      toast.success('Template removed.');
      setConfirmDel(null);
      refetch();
    } catch {
      toast.error('Failed.');
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // TABLE COLUMNS (FIXED)
  // =========================
  const cols = [
    {
      key: 'name',
      label: 'Template Name',
      render: v => <span className="td-bold">{v}</span>,
    },

    // 🔥 FIXED TEST NAME
    {
      key: 'testCatalogId',
      label: 'Test',
      render: v => testMap[v] || '—',
    },

    {
      key: 'version',
      label: 'Version',
      render: v => `v${v}`,
    },

    {
      key: 'fields',
      label: 'Fields',
      render: (_, row) => row.fields?.length ?? 0,
    },

    {
      key: 'createdAt',
      label: 'Created',
      render: v => <span className="td-muted">{formatDate(v)}</span>,
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
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmDel(row)}
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>

      <PageHeader
        title="Report Templates"
        subtitle="Define report structures and fields for each test"
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            + New Template
          </button>
        }
      />

      {/* FILTER */}
      <div className="filters-row">
        <select
          className="filter-select"
          value={filterTest}
          onChange={e => setFilterTest(e.target.value)}
        >
          <option value="">All Tests</option>
          {tests?.map(t => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="card">
        <Table
          columns={cols}
          data={filtered}
          loading={loading}
          emptyMessage="No templates found."
        />
      </div>

      {/* MODAL */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Template' : 'New Template'}
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
              {saving ? <span className="spinner" /> : editing ? 'Save' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">

            <div className="form-group form-full">
              <label>Template Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setF('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group form-full">
              <label>Description</label>
              <textarea
                className="form-textarea"
                value={form.description}
                onChange={e => setF('description', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Test *</label>
              <select
                className="form-select"
                value={form.testCatalogId}
                onChange={e => setF('testCatalogId', e.target.value)}
                required
              >
                <option value="">Select test…</option>
                {tests?.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Version</label>
              <input
                className="form-input"
                type="number"
                min={1}
                value={form.version}
                onChange={e => setF('version', e.target.value)}
              />
            </div>

          </div>

          <div className="divider" />

          <div className="section-title">Fields</div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addField}
          >
            + Add Field
          </button>

          {form.fields.map((field, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                gap: 8,
                marginTop: 10,
                alignItems: 'center'
              }}
            >
              <input
                className="form-input"
                placeholder="Field name"
                value={field.name}
                onChange={e => setField(i, 'name', e.target.value)}
              />

              <select
                className="form-select"
                value={field.type}
                onChange={e => setField(i, 'type', e.target.value)}
              >
                <option>Number</option>
                <option>Text</option>
                <option>Boolean</option>
              </select>

              <input
                className="form-input"
                placeholder="Unit"
                value={field.unit}
                onChange={e => setField(i, 'unit', e.target.value)}
              />

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeField(i)}
                disabled={form.fields.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
        </form>
      </Modal>

      {/* DELETE */}
      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Remove Template"
        message={`Remove "${confirmDel?.name}"? This cannot be undone.`}
        confirmLabel="Remove"
        danger
        loading={saving}
      />

    </div>
  );
}