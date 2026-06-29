import React from 'react';
import { useApi } from '../../hooks/useApi';
import { notificationsApi } from '../../api/patient';
import PageHeader from '../../components/PageHeader';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  Result: '🔬',
  Booking: '📅',
  Payment: '💳',
};

function getIcon(type) {
  return TYPE_ICONS[type] ?? '🔔';
}

export default function NotificationsPage() {
  const { data, loading, refetch } = useApi(notificationsApi.getAll);

  const notifications = Array.isArray(data)
    ? data
    : data?.data ?? [];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleMarkAll = async () => {
    if (!unreadCount) return;
    try {
      await notificationsApi.markAllRead();
      refetch();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkOne = async (n) => {
    if (n.isRead) return;
    try {
      await notificationsApi.markAsRead(n.id);
      refetch();
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();

    // Give the user a chance to undo before committing the delete
    const toastId = toast(
      (t) => (
        <span>
          Notification deleted.{' '}
          <button
            style={{ fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => {
              toast.dismiss(t.id);
              refetch(); // restore optimistic state
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 4000 }
    );

    try {
      await notificationsApi.delete(id);
      refetch();
    } catch {
      toast.dismiss(toastId);
      toast.error('Failed to delete notification');
    }
  };

  // ─── Derived subtitle ─────────────────────────────────────────────────────

  const subtitle = loading
    ? 'Loading…'
    : `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>

      {/* HEADER */}
      <PageHeader
        title="Notifications"
        subtitle={subtitle}
        actions={
          <button
            className="btn btn-outline btn-sm"
            onClick={handleMarkAll}
            disabled={!unreadCount || loading}
          >
            ✓ Mark all as read
          </button>
        }
      />

      {/* CONTENT */}
      <div className="card">

        {/* LOADING */}
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <span className="spinner-lg spinner" />
          </div>

        ) : notifications.length === 0 ? (
          /* EMPTY STATE */
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No notifications</h3>
            <p>
              You're all caught up! Notifications about your bookings,
              results, and payments will appear here.
            </p>
          </div>

        ) : (
          /* LIST */
          notifications.map(n => {
            // Determine the body text only when it's distinct from the title
            const title   = n.title ?? n.message;
            const bodyText = n.body && n.body !== n.title && n.body !== n.message
              ? n.body
              : null;

            return (
              <div
                key={n.id}
                onClick={() => handleMarkOne(n)}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '16px 22px',
                  borderBottom: '1px solid var(--gray-100)',
                  background: n.isRead ? 'transparent' : 'rgba(0,201,167,0.05)',
                  // Only show pointer cursor when the click will do something
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >

                {/* ICON */}
                <div style={{ fontSize: 22, width: 36, textAlign: 'center' }}>
                  {getIcon(n.type)}
                </div>

                {/* CONTENT */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: n.isRead ? 400 : 600,
                      fontSize: 14,
                      color: 'var(--gray-800)',
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </div>

                  {bodyText && (
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--gray-500)',
                        marginBottom: 4,
                      }}
                    >
                      {bodyText}
                    </div>
                  )}

                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    {formatDateTime(n.createdAt)}
                  </div>
                </div>

                {/* ACTIONS */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  {!n.isRead && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--teal-500)',
                        marginTop: 6,
                      }}
                    />
                  )}

                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: 'var(--gray-400)', fontSize: 14 }}
                    onClick={(e) => handleDelete(e, n.id)}
                    aria-label="Delete notification"
                  >
                    ✕
                  </button>
                </div>

              </div>
            );
          })
        )}

      </div>
    </div>
  );
}