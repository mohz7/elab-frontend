import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  referenceRangesAdminApi,
  reportTemplatesAdminApi
} from '../../api/admin';

import Table from '../../components/Table';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';

const empty = {
  fieldName: '',
  ageMin: 0,
  ageMax: 120,
  gender: 'Any',
  valueMin: '',
  valueMax: '',
  units: '',
  notes: '',
  reportTemplateId: ''
};

export default function ReferenceRangesPage() {
  const [templateFilter, setTemplateFilter] = useState('');

  const { data, loading, refetch } = useApi(
    () => referenceRangesAdminApi.getAll(templateFilter || undefined),
    [templateFilter]
  );

  const { data: templates } = useApi(reportTemplatesAdminApi.getAll);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const ranges = Array.isArray(data) ? data : data?.data || [];

  // =========================
  // FIX: TEMPLATE MAPPING
  // =========================
  const templateMap = useMemo(() => {
    const map = {};
    templates?.forEach(t => {
      map[t.id] = t.name;
    });
    return map;
  }, [templates]);

  // =========================
  // FORM HANDLERS
  // =========================
  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      fieldName: r.fieldName,
      ageMin: r.ageMin,
      ageMax: r.ageMax,
      gender: r.gender,
      valueMin: r.valueMin,
      valueMax: r.valueMax,
      units: r.units || '',
      notes: r.notes || '',
      reportTemplateId: String(r.reportTemplateId || ''),
    });
    setModal(true);
  };

  const set = (k, v) =>
    setForm(prev => ({ ...prev, [k]: v }));

  // =========================
  // SAVE
  // =========================
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        ageMin: Number(form.ageMin),
        ageMax: Number(form.ageMax),
        valueMin: Number(form.valueMin),
        valueMax: Number(form.valueMax),
        reportTemplateId: Number(form.reportTemplateId),
      };

      if (editing) {
        await referenceRangesAdminApi.update(editing.id, payload);
        toast.success('Range updated!');
      } else {
        await referenceRangesAdminApi.create(payload);
        toast.success('Range created!');
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
      await referenceRangesAdminApi.remove(confirmDel.id);
      toast.success('Removed.');
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
      key: 'fieldName',
      label: 'Field Name',
      render: v => <span className="td-bold">{v}</span>,
    },
    {
      key: 'gender',
      label: 'Gender',
    },
    {
      key: 'ageMin',
      label: 'Age Range',
      render: (v, row) => `${v} – ${row.ageMax} yrs`,
    },
    {
      key: 'valueMin',
      label: 'Normal Range',
      render: (v, row) => (
        <span className="td-mono">
          {v} – {row.valueMax} {row.units}
        </span>
      ),
    },

    // 🔥 FIXED TEMPLATE NAME
    {
      key: 'reportTemplateId',
      label: 'Template',
      render: v => templateMap[v] || '—',
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
        title="Reference Ranges"
        subtitle="Normal value ranges for each test field"
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Range
          </button>
        }
      />

      {/* FILTER */}
      <div className="filters-row">
        <select
          className="filter-select"
          value={templateFilter}
          onChange={e => setTemplateFilter(e.target.value)}
        >
          <option value="">All Templates</option>

          {templates?.map(t => (
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
          data={ranges}
          loading={loading}
          emptyMessage="No reference ranges found."
        />
      </div>

      {/* MODAL */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Reference Range' : 'Add Reference Range'}
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

            <div className="form-group">
              <label>Field Name *</label>
              <input
                className="form-input"
                value={form.fieldName}
                onChange={e => set('fieldName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Template *</label>
              <select
                className="form-select"
                value={form.reportTemplateId}
                onChange={e => set('reportTemplateId', e.target.value)}
                required
              >
                <option value="">Select…</option>
                {templates?.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                className="form-select"
                value={form.gender}
                onChange={e => set('gender', e.target.value)}
              >
                <option value="Any">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Units</label>
              <input
                className="form-input"
                value={form.units}
                onChange={e => set('units', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Min Age</label>
              <input
                type="number"
                className="form-input"
                value={form.ageMin}
                onChange={e => set('ageMin', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Max Age</label>
              <input
                type="number"
                className="form-input"
                value={form.ageMax}
                onChange={e => set('ageMax', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Min Value *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={form.valueMin}
                onChange={e => set('valueMin', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Max Value *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={form.valueMax}
                onChange={e => set('valueMax', e.target.value)}
                required
              />
            </div>

            <div className="form-group form-full">
              <label>Notes</label>
              <input
                className="form-input"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>

          </div>
        </form>
      </Modal>

      {/* DELETE */}
      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Remove Range"
        message={`Remove reference range for "${confirmDel?.fieldName}"?`}
        confirmLabel="Remove"
        danger
        loading={saving}
      />

    </div>
  );
}