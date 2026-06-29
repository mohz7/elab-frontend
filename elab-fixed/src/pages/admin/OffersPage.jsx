import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { offersAdminApi, branchesAdminApi, testCatalogsAdminApi } from '../../api/admin';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const empty = { title: '', discountPercent: '', startDate: '', endDate: '', isActive: true, testCatalogId: '', branchId: '' };

export default function OffersPage() {
  const { data, loading, refetch } = useApi(offersAdminApi.getAll);
  const { data: branches } = useApi(branchesAdminApi.getAll);
  const { data: tests } = useApi(testCatalogsAdminApi.getAll);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (o) => {
    setEditing(o);
    setForm({
      title: o.title,
      discountPercent: o.discountPercent,
      startDate: o.startDate?.slice(0, 10) || '',
      endDate: o.endDate?.slice(0, 10) || '',
      isActive: o.isActive,
      testCatalogId: String(o.testCatalogId || ''),
      branchId: String(o.branchId || ''),
    });
    setModal(true);
  };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        ...form,
        discountPercent: Number(form.discountPercent),
        testCatalogId: Number(form.testCatalogId),
        branchId: Number(form.branchId),
      };
      if (editing) await offersAdminApi.update(editing.id, payload);
      else await offersAdminApi.create(payload);
      toast.success(editing ? 'Offer updated!' : 'Offer created!');
      setModal(false);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleToggle = async () => {
    setSaving(true);
    try {
      if (confirmToggle.isActive) await offersAdminApi.deactivate(confirmToggle.id);
      else await offersAdminApi.activate(confirmToggle.id);
      toast.success(`Offer ${confirmToggle.isActive ? 'deactivated' : 'activated'}!`);
      setConfirmToggle(null); refetch();
    } catch { toast.error('Failed.'); } finally { setSaving(false); }
  };

  const cols = [
    { key: 'title', label: 'Offer Title', render: v => <span className="td-bold">{v}</span> },
    { key: 'discountPercent', label: 'Discount', render: v => <span style={{ color: 'var(--green-500)', fontWeight: 600 }}>{v}% OFF</span> },
    { key: 'testCatalogId', label: 'Test', render: v => tests?.find(t => t.id == v)?.name || '—' },
    { key: 'branchId', label: 'Branch', render: v => branches?.find(b => b.id == v)?.name || '—' },
    { key: 'startDate', label: 'Start', render: v => formatDate(v) },
    { key: 'endDate', label: 'End', render: v => formatDate(v) },
    { key: 'isActive', label: 'Status', render: v => <Badge status={v ? 'Active' : 'Inactive'} /> },
    { key: 'id', label: 'Actions', render: (_, row) => (
      <div className="action-menu">
        <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)}>Edit</button>
        <button className={`btn btn-sm ${row.isActive ? 'btn-danger' : 'btn-primary'}`} onClick={() => setConfirmToggle(row)}>
          {row.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Offers & Discounts" subtitle="Manage promotional offers for laboratory tests"
        actions={<button className="btn btn-primary" onClick={openCreate}>+ New Offer</button>} />
      <div className="card">
        <Table columns={cols} data={data} loading={loading} emptyMessage="No offers found." />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Offer' : 'New Offer'} size="lg"
        footer={
          <><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : (editing ? 'Save' : 'Create')}
          </button></>
        }>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-full"><label className="form-label">Offer Title *</label>
              <input className="form-input" placeholder="e.g. Summer Blood Panel Discount" value={form.title} onChange={e => set('title', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Discount % *</label>
              <input className="form-input" type="number" min={1} max={100} step={0.01} value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-select" value={form.isActive} onChange={e => set('isActive', e.target.value === 'true')}>
                <option value="true">Active</option><option value="false">Inactive</option>
              </select></div>
            <div className="form-group"><label className="form-label">Test *</label>
              <select className="form-select" value={form.testCatalogId} onChange={e => set('testCatalogId', e.target.value)} required>
                <option value="">Select test…</option>
                {tests?.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Branch *</label>
              <select className="form-select" value={form.branchId} onChange={e => set('branchId', e.target.value)} required>
                <option value="">Select branch…</option>
                {branches?.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Start Date *</label>
              <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">End Date *</label>
              <input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required /></div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmToggle} onClose={() => setConfirmToggle(null)} onConfirm={handleToggle}
        title={confirmToggle?.isActive ? 'Deactivate Offer' : 'Activate Offer'}
        message={`${confirmToggle?.isActive ? 'Deactivate' : 'Activate'} offer "${confirmToggle?.title}"?`}
        confirmLabel={confirmToggle?.isActive ? 'Deactivate' : 'Activate'} danger={confirmToggle?.isActive} loading={saving} />
    </div>
  );
}