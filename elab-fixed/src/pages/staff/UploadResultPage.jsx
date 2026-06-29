import React, { useState } from 'react';
import {
  resultsStaffApi,
  reportTemplatesStaffApi,
  bookingsStaffApi,
} from '../../api/staff';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

export default function UploadResultPage() {
  // ✅ FIXED: use getWithoutResult instead of getAll
  const { data: allBookings }  = useApi(bookingsStaffApi.getWithoutResult);
  const { data: allTemplates } = useApi(reportTemplatesStaffApi.getAll);
  const { data: allResults }   = useApi(resultsStaffApi.getAll);

  const [selectedBooking, setSelectedBooking]   = useState(null);
  const [loadingBooking, setLoadingBooking]     = useState(false);
  const [selectedItem, setSelectedItem]         = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate]   = useState(false);
  const [form, setForm]                         = useState({ resultDate: '', fileUrl: '' });
  const [rows, setRows]                         = useState([{ key: '', value: '', unit: '', type: '' }]);
  const [saving, setSaving]                     = useState(false);
  // ✅ Track uploaded booking item IDs locally so the list updates instantly after upload
  const [uploadedItemIds, setUploadedItemIds]   = useState([]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ✅ FIXED: no manual status filter needed — endpoint already excludes uploaded bookings
  const bookings = allBookings || [];

  // Build a Set of already-uploaded bookingItemIds from the results list + local state
  const uploadedSet = new Set([
    ...uploadedItemIds,
    ...(allResults || []).map(r => String(r.bookingItemId)),
  ]);

  // Filter templates by test name keyword match
  const filteredTemplates = selectedItem
    ? (allTemplates || []).filter(t => {
        const testWord = selectedItem.testName?.toLowerCase().split(' ')[0];
        return (
          t.testName?.toLowerCase().includes(testWord) ||
          t.name?.toLowerCase().includes(testWord)
        );
      })
    : [];

  // =========================
  // STEP 1 — SELECT BOOKING
  // =========================
  const handleBookingSelect = async (bookingId) => {
    setSelectedBooking(null);
    setSelectedItem(null);
    setSelectedTemplate(null);
    setRows([{ key: '', value: '', unit: '', type: '' }]);
    setForm({ resultDate: '', fileUrl: '' });

    if (!bookingId) return;

    setLoadingBooking(true);
    try {
      const res = await bookingsStaffApi.getById(bookingId);
      const booking = res?.data?.data ?? res?.data;
      setSelectedBooking(booking);
    } catch {
      toast.error('Failed to load booking details.');
    } finally {
      setLoadingBooking(false);
    }
  };

  // =========================
  // STEP 2 — SELECT BOOKING ITEM
  // =========================
  const handleItemSelect = (itemId) => {
    const item = selectedBooking?.bookingItems?.find(
      i => String(i.id) === String(itemId)
    );
    setSelectedItem(item || null);
    setSelectedTemplate(null);
    setRows([{ key: '', value: '', unit: '', type: '' }]);
  };

  // =========================
  // STEP 3 — SELECT TEMPLATE
  // =========================
  const handleTemplateSelect = async (id) => {
    setSelectedTemplate(null);
    setRows([{ key: '', value: '', unit: '', type: '' }]);

    if (!id) return;

    setLoadingTemplate(true);
    try {
      const res = await reportTemplatesStaffApi.getById(id);
      const tmpl = res?.data?.data ?? res?.data;
      setSelectedTemplate(tmpl);

      if (tmpl?.fieldsSchema?.length > 0) {
        setRows(tmpl.fieldsSchema.map(f => ({
          key: f.name, value: '', unit: f.unit, type: f.type,
        })));
      } else {
        setRows([{ key: '', value: '', unit: '', type: '' }]);
      }
    } catch {
      toast.error('Failed to load template fields.');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const updateRow = (i, field, val) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const addRow    = () => setRows(prev => [...prev, { key: '', value: '', unit: '', type: '' }]);
  const removeRow = (i) => setRows(prev => prev.filter((_, idx) => idx !== i));

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      toast.error('Please select a booking item.');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select a report template.');
      return;
    }

    if (!form.resultDate) {
      toast.error('Please select a result date.');
      return;
    }

    const filledRows = rows.filter(r => r.key.trim() !== '');
    if (filledRows.length === 0) {
      toast.error('Please enter at least one result value.');
      return;
    }

    const resultData = {};
    filledRows.forEach(r => {
      const num = parseFloat(r.value);
      resultData[r.key.trim()] = isNaN(num) ? r.value : num;
    });

    setSaving(true);
    try {
      await resultsStaffApi.upload({
        bookingItemId:    Number(selectedItem.id),
        reportTemplateId: Number(selectedTemplate.id),
        resultDate:       new Date(form.resultDate).toISOString(),
        resultData,
        fileUrl:          form.fileUrl || undefined,
      });
      toast.success('Result uploaded successfully!');
      // ✅ Mark this item as uploaded instantly so it disappears from the dropdown
      setUploadedItemIds(prev => [...prev, String(selectedItem.id)]);
      handleClear();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CLEAR
  // =========================
  const handleClear = () => {
    setSelectedBooking(null);
    setSelectedItem(null);
    setSelectedTemplate(null);
    setForm({ resultDate: '', fileUrl: '' });
    setRows([{ key: '', value: '', unit: '', type: '' }]);
  };

  return (
    <div>
      <PageHeader
        title="Upload Result"
        subtitle="Submit laboratory test results for a booking"
      />

      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              {/* ── STEP 1: BOOKING ── */}
              <div className="form-group form-full">
                <label className="form-label">Booking *</label>
                <select
                  className="form-select"
                  value={selectedBooking?.id || ''}
                  onChange={e => handleBookingSelect(e.target.value)}
                  required
                >
                  <option value="">Select booking…</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      #{b.id} — {b.branch} — {b.bookingDate} — {b.patientProfileId}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── LOADING BOOKING ── */}
              {loadingBooking && (
                <div className="form-group form-full">
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', background: '#f8fafc',
                    borderRadius: 8, color: '#64748b', fontSize: 13,
                  }}>
                    <span className="spinner" />
                    Loading booking items…
                  </div>
                </div>
              )}

              {/* ── STEP 2: BOOKING ITEM ── */}
              {selectedBooking && !loadingBooking && (
                <div className="form-group form-full">
                  <label className="form-label">Test (Booking Item) *</label>
                  {(() => {
                    // ✅ Filter out items that already have a result uploaded
                    const pendingItems = (selectedBooking.bookingItems || []).filter(
                      item => !uploadedSet.has(String(item.id))
                    );

                    if (pendingItems.length === 0) {
                      return (
                        <div style={{
                          padding: '10px 14px', background: '#f0fdf4',
                          border: '1px solid #86efac', borderRadius: 8,
                          fontSize: 13, color: '#166534',
                        }}>
                          ✅ All tests in this booking already have results uploaded.
                        </div>
                      );
                    }

                    return (
                      <select
                        className="form-select"
                        value={selectedItem?.id || ''}
                        onChange={e => handleItemSelect(e.target.value)}
                        required
                      >
                        <option value="">Select test…</option>
                        {pendingItems.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.testName} — {item.finalPrice} ILS
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              )}

              {/* ── STEP 3: REPORT TEMPLATE ── */}
              {selectedItem && (
                <div className="form-group form-full">
                  <label className="form-label">Report Template *</label>
                  {filteredTemplates.length > 0 ? (
                    <>
                      <select
                        className="form-select"
                        value={selectedTemplate?.id || ''}
                        onChange={e => handleTemplateSelect(e.target.value)}
                        required
                      >
                        <option value="">Select template…</option>
                        {filteredTemplates.map(t => (
                          <option key={t.id} value={String(t.id)}>
                            {t.name} — {t.testName}
                          </option>
                        ))}
                      </select>
                      <span className="form-hint">
                        Showing templates matching "{selectedItem.testName}"
                      </span>
                    </>
                  ) : (
                    <>
                      <select
                        className="form-select"
                        value={selectedTemplate?.id || ''}
                        onChange={e => handleTemplateSelect(e.target.value)}
                        required
                      >
                        <option value="">Select template…</option>
                        {(allTemplates || []).map(t => (
                          <option key={t.id} value={String(t.id)}>
                            {t.name} — {t.testName}
                          </option>
                        ))}
                      </select>
                      <span className="form-hint" style={{ color: '#f59e0b' }}>
                        ⚠ No templates matched "{selectedItem.testName}" — showing all.
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* ── LOADING TEMPLATE ── */}
              {loadingTemplate && (
                <div className="form-group form-full">
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', background: '#f8fafc',
                    borderRadius: 8, color: '#64748b', fontSize: 13,
                  }}>
                    <span className="spinner" />
                    Loading template fields…
                  </div>
                </div>
              )}

              {/* ── TEMPLATE BADGE ── */}
              {selectedTemplate && !loadingTemplate && (
                <div className="form-group form-full">
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', background: '#f0fdfa',
                    border: '1.5px solid #0d9488', borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 16 }}>🧪</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0d9488' }}>
                        {selectedTemplate.name}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {selectedTemplate.description} — {selectedTemplate.fieldsSchema?.length} fields
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── RESULT DATE + FILE URL ── */}
              {selectedTemplate && !loadingTemplate && (
                <>
                  <div className="form-group">
                    <label className="form-label">Result Date *</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={form.resultDate}
                      onChange={e => set('resultDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">File URL (optional)</label>
                    <input
                      className="form-input"
                      type="url"
                      placeholder="https://…"
                      value={form.fileUrl}
                      onChange={e => set('fileUrl', e.target.value)}
                    />
                  </div>
                </>
              )}

            </div>

            {/* ── RESULT VALUES ── */}
            {selectedTemplate && !loadingTemplate && (
              <>
                <div className="divider" />
                <div className="section-title" style={{ marginBottom: 12 }}>
                  Result Values
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rows.map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        className="form-input"
                        placeholder="Parameter name"
                        value={row.key}
                        readOnly
                        style={{
                          flex: 2, background: '#f8fafc',
                          color: '#475569', cursor: 'default',
                        }}
                      />
                      <input
                        className="form-input"
                        placeholder="Value"
                        value={row.value}
                        onChange={e => updateRow(i, 'value', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      {row.unit && (
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: '#64748b',
                          background: '#f1f5f9', padding: '4px 10px',
                          borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {row.unit}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── ACTIONS ── */}
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={
                  saving          ||
                  loadingTemplate ||
                  loadingBooking  ||
                  !selectedItem   ||
                  !selectedTemplate
                }
              >
                {saving ? <span className="spinner" /> : '📤 Upload Result'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
