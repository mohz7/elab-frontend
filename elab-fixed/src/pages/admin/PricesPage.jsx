import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import {
  pricesAdminApi,
  branchesAdminApi,
  testCatalogsAdminApi
} from '../../api/admin';

import Table from '../../components/Table';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const empty = {
  basePrice: '',
  currency: 'USD',
  effectiveFrom: '',
  effectiveTo: '',
  testCatalogId: '',
  branchId: ''
};

export default function PricesPage() {
  const { data, loading, refetch } = useApi(pricesAdminApi.getAll);
  const { data: branches } = useApi(branchesAdminApi.getAll);
  const { data: tests } = useApi(testCatalogsAdminApi.getAll);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const prices = Array.isArray(data) ? data : data?.data || [];

  // =========================
  // OPTIMIZED MAPS (IMPORTANT FIX)
  // =========================
  const testMap = useMemo(() => {
    const map = {};
    tests?.forEach(t => {
      map[t.id] = t.name;
    });
    return map;
  }, [tests]);

  const branchMap = useMemo(() => {
    const map = {};
    branches?.forEach(b => {
      map[b.id] = b.name;
    });
    return map;
  }, [branches]);

  // =========================
  // FORM HANDLERS
  // =========================
  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      basePrice: p.basePrice,
      currency: p.currency || 'USD',
      effectiveFrom: p.effectiveFrom?.slice(0, 10) || '',
      effectiveTo: p.effectiveTo?.slice(0, 10) || '',
      testCatalogId: String(p.testCatalogId || ''),
      branchId: String(p.branchId || ''),
    });
    setModal(true);
  };

  const set = (k, v) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        testCatalogId: Number(form.testCatalogId),
        branchId: Number(form.branchId),
      };

      if (editing) {
        await pricesAdminApi.update(editing.id, payload);
        toast.success('Price updated!');
      } else {
        await pricesAdminApi.create(payload);
        toast.success('Price created!');
      }

      setModal(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);

    try {
      await pricesAdminApi.remove(confirmDel.id);
      toast.success('Price removed.');
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
      key: 'testCatalogId',
      label: 'Test',
      render: v => (
        <span className="td-bold">
          {testMap[v] || '—'}
        </span>
      ),
    },
    {
      key: 'branchId',
      label: 'Branch',
      render: v => branchMap[v] || '—',
    },
    {
      key: 'basePrice',
      label: 'Price',
      render: (v, row) => (
        <span style={{ fontWeight: 600, color: 'var(--teal-600)' }}>
          {formatCurrency(v, row.currency)}
        </span>
      ),
    },
    {
      key: 'effectiveFrom',
      label: 'From',
      render: v => formatDate(v),
    },
    {
      key: 'effectiveTo',
      label: 'To',
      render: v => formatDate(v),
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
        title="Test Prices"
        subtitle="Set pricing for tests per branch"
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Price
          </button>
        }
      />

      <div className="card">
        <Table
          columns={cols}
          data={prices}
          loading={loading}
          emptyMessage="No prices configured yet."
        />
      </div>

      {/* ================= MODAL ================= */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Price' : 'New Price'}
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
              <label>Test *</label>
              <select
                className="form-select"
                value={form.testCatalogId}
                onChange={e => set('testCatalogId', e.target.value)}
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
              <label>Branch *</label>
              <select
                className="form-select"
                value={form.branchId}
                onChange={e => set('branchId', e.target.value)}
                required
              >
                <option value="">Select branch…</option>
                {branches?.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Base Price *</label>
              <input
                className="form-input"
                type="number"
                min={0}
                step={0.01}
                value={form.basePrice}
                onChange={e => set('basePrice', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select
                className="form-select"
                value={form.currency}
                onChange={e => set('currency', e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ILS">ILS</option>
                <option value="JOD">JOD</option>
              </select>
            </div>

            <div className="form-group">
              <label>Effective From *</label>
              <input
                className="form-input"
                type="date"
                value={form.effectiveFrom}
                onChange={e => set('effectiveFrom', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Effective To *</label>
              <input
                className="form-input"
                type="date"
                value={form.effectiveTo}
                onChange={e => set('effectiveTo', e.target.value)}
                required
              />
            </div>

          </div>
        </form>
      </Modal>

      {/* ================= DELETE ================= */}
      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Remove Price"
        message={`Remove price for "${confirmDel?.testName || 'this item'}"?`}
        confirmLabel="Remove"
        danger
        loading={saving}
      />

    </div>
  );
}