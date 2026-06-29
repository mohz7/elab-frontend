import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { bookingsPatientApi } from '../../api/patient';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/helpers';

export default function MyBookingsPage({ onNavigate }) {

  const { data: bookings, loading } = useApi(bookingsPatientApi.getMyBookings);

  const [viewing, setViewing] = useState(null);

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const cols = [
    {
      key: 'id',
      label: 'ID',
      render: v => <span className="td-mono">#{v}</span>,
    },
    {
      key: 'bookingDate',
      label: 'Date',
      render: v => formatDate(v),
    },
    {
      key: 'bookingTime',
      label: 'Time',
      render: v => v ?? '—',
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: v => <span style={{ fontWeight: 600 }}>{formatCurrency(v)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: v => <Badge status={v} />,
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: v => <Badge status={v} />,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-menu">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setViewing(row)}
          >
            Details
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Bookings"
        subtitle="All your laboratory appointments"
        actions={
          <button className="btn btn-primary" onClick={() => onNavigate('book')}>
            + New Booking
          </button>
        }
      />

      <div className="card">
        <Table
          columns={cols}
          data={safeBookings}
          loading={loading}
          emptyMessage="No bookings yet. Book your first lab test!"
        />
      </div>

      {/* DETAIL MODAL */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`Booking #${viewing?.id}`}
        subtitle={`Created ${formatDateTime(viewing?.createdAt)}`}
        size="lg"
      >
        {viewing && (
          <div>
            <div className="info-grid">

              <div>
                <div className="info-row">
                  <div className="info-row-key">Date</div>
                  <div className="info-row-val">{formatDate(viewing.bookingDate)}</div>
                </div>
              </div>

              <div>
                <div className="info-row">
                  <div className="info-row-key">Time</div>
                  <div className="info-row-val">{viewing.bookingTime ?? '—'}</div>
                </div>
              </div>

              <div>
                <div className="info-row">
                  <div className="info-row-key">Status</div>
                  <div className="info-row-val">
                    <Badge status={viewing.status} />
                  </div>
                </div>
              </div>

              <div>
                <div className="info-row">
                  <div className="info-row-key">Payment</div>
                  <div className="info-row-val">
                    <Badge status={viewing.paymentStatus} />
                  </div>
                </div>
              </div>

              <div>
                <div className="info-row">
                  <div className="info-row-key">Total Amount</div>
                  <div className="info-row-val" style={{ fontWeight: 700, color: 'var(--teal-600)' }}>
                    {formatCurrency(viewing.totalAmount)}
                  </div>
                </div>
              </div>

              <div>
                <div className="info-row">
                  <div className="info-row-key">Created</div>
                  <div className="info-row-val">{formatDateTime(viewing.createdAt)}</div>
                </div>
              </div>

            </div>

            {viewing.notes && (
              <div className="info-row" style={{ marginTop: 8 }}>
                <div className="info-row-key">Notes</div>
                <div className="info-row-val">{viewing.notes}</div>
              </div>
            )}

            {Array.isArray(viewing.bookingItems) && viewing.bookingItems.length > 0 && (
              <>
                <div className="divider" />
                <div className="section-title">Booked Tests</div>
                <table>
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Unit Price</th>
                      <th>Final Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewing.bookingItems.map((item, i) => (
                      <tr key={item.id ?? i}>
                        <td className="td-bold">
                          {item.testCatalog?.name ?? `Test #${item.testCatalogId}`}
                        </td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
                          {formatCurrency(item.finalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}