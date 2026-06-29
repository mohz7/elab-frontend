import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const adminLinks = [
  {
    section: 'Overview',
    items: [{ icon: '📊', label: 'Dashboard', page: 'dashboard' }],
  },

  {
    section: 'Management',
    items: [
      { icon: '📅', label: 'Bookings', page: 'bookings' },
      { icon: '🧪', label: 'Test Catalogs', page: 'test-catalogs' },
      { icon: '📋', label: 'Templates', page: 'report-templates' },
      { icon: '📐', label: 'Ranges', page: 'reference-ranges' },
      { icon: '💰', label: 'Prices', page: 'prices' },
      { icon: '🎁', label: 'Offers', page: 'offers' },
    ],
  },

  {
    section: 'Users',
    items: [
      { icon: '🏥', label: 'Branches', page: 'branches' },
      { icon: '👨‍⚕️', label: 'Staff', page: 'staff' },
      { icon: '🧑‍🤝‍🧑', label: 'Patients', page: 'patients' },
      { icon: '📁', label: 'Records', page: 'patient-records' },
    ],
  },

  {
    section: 'Results',
    items: [{ icon: '🔬', label: 'Results', page: 'results' }],
  },
];

const staffLinks = [
  {
    section: 'Overview',
    items: [{ icon: '📊', label: 'Dashboard', page: 'dashboard' }],
  },

  {
    section: 'Laboratory',
    items: [
      { icon: '⏳', label: 'Pending Results', page: 'pending-results' },
      { icon: '🧪', label: 'All Results', page: 'all-results' },
      { icon: '📤', label: 'Upload Result', page: 'upload-result' },
      { icon: '📅', label: 'Bookings', page: 'bookings' },
      { icon: '🛒', label: 'Patient Cart', page: 'cart-for-patient' },
    ],
  },

  {
    section: 'Patients',
    items: [
      { icon: '🧑‍🤝‍🧑', label: 'Profiles', page: 'patient-profiles' },
    ],
  },

  {
    section: 'Communication',
    items: [
      { icon: '💬', label: 'Chats', page: 'chats' },
      { icon: '🔔', label: 'Notifications', page: 'notifications' },
    ],
  },

  {
    section: 'Account',
    items: [{ icon: '👤', label: 'Profile', page: 'profile' }],
  },
];

const patientLinks = [
  {
    section: 'Overview',
    items: [{ icon: '🏠', label: 'Dashboard', page: 'dashboard' }],
  },

  {
    section: 'Services',
    items: [
      { icon: '🧪', label: 'Tests', page: 'tests' },
      { icon: '🎁', label: 'Offers', page: 'offers' },
      { icon: '🛒', label: 'Cart', page: 'cart' },
      { icon: '📅', label: 'Book Appointment', page: 'book' },
    ],
  },

  {
    section: 'Health',
    items: [
      { icon: '📋', label: 'Bookings', page: 'bookings' },
      { icon: '🔬', label: 'Results', page: 'results' },
      { icon: '🤖', label: 'AI Analysis', page: 'ai-chat' },
    ],
  },

  {
    section: 'Support',
    items: [
      { icon: '💬', label: 'Chats', page: 'chats' },
      { icon: '🔔', label: 'Notifications', page: 'notifications' },
      { icon: '👤', label: 'Profile', page: 'profile' },
    ],
  },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  unreadCount = 0,
  mobileOpen = false,
  onMobileClose,
}) {
  const { user, role, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  // Close sidebar on mobile when navigating
  const handleNavigate = (page) => {
    onNavigate(page);
    if (onMobileClose) onMobileClose();
  };

  const links =
    role === 'Admin'
      ? adminLinks
      : role === 'Staff'
      ? staffLinks
      : patientLinks;

  const roleLabel =
    role === 'Admin'
      ? 'Admin Panel'
      : role === 'Staff'
      ? 'Staff Portal'
      : 'Patient Portal';

  return (
    <>
      <style>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: #111827;
          color: white;
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease, transform 0.3s ease;
          border-right: 1px solid #1f2937;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 300;
          overflow: hidden;
        }
        .sidebar.collapsed { width: 90px; }

        /* Mobile: slide in/out */
        .sidebar-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 299;
          backdrop-filter: blur(2px);
        }
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: 280px !important;
            z-index: 400;
          }
          .sidebar.mobile-open { transform: translateX(0); }
          .sidebar-backdrop.visible { display: block; }
          .collapse-btn { display: none !important; }
        }

        .sidebar-top {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .logo-wrapper { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .logo-icon {
          width: 45px; height: 45px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(135deg, #2563eb, #06b6d4);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .logo-text { font-size: 24px; font-weight: 700; white-space: nowrap; }
        .logo-text span { color: #38bdf8; }

        .collapse-btn {
          background: #1f2937; border: none; color: white; padding: 8px;
          border-radius: 10px; cursor: pointer; transition: 0.2s; flex-shrink: 0;
        }
        .collapse-btn:hover { background: #374151; }

        .role-badge {
          margin: 0 20px 20px; background: rgba(59,130,246,0.15);
          color: #93c5fd; padding: 10px; border-radius: 12px;
          font-size: 14px; text-align: center; flex-shrink: 0;
        }

        .sidebar-nav { flex: 1; overflow-y: auto; padding: 0 14px; }
        .sidebar-nav::-webkit-scrollbar { width: 5px; }
        .sidebar-nav::-webkit-scrollbar-thumb { background: #374151; border-radius: 20px; }

        .nav-group { margin-bottom: 24px; }
        .nav-group-title {
          font-size: 12px; text-transform: uppercase; color: #9ca3af;
          margin-bottom: 10px; padding-left: 10px; letter-spacing: 1px;
        }
        .nav-item {
          width: 100%; border: none; background: transparent; color: #d1d5db;
          display: flex; align-items: center; gap: 14px; padding: 14px;
          border-radius: 14px; cursor: pointer; transition: 0.2s;
          margin-bottom: 6px; font-size: 15px;
        }
        .nav-item:hover { background: #1f2937; color: white; transform: translateX(3px); }
        .nav-item.active {
          background: linear-gradient(135deg, #2563eb, #06b6d4);
          color: white; box-shadow: 0 4px 15px rgba(37,99,235,0.25);
        }
        .nav-item-icon { font-size: 20px; min-width: 24px; text-align: center; flex-shrink: 0; }
        .nav-item-label { font-weight: 500; white-space: nowrap; }
        .notification-badge {
          margin-left: auto; background: #ef4444; color: white; font-size: 12px;
          min-width: 22px; height: 22px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center; font-weight: bold;
        }

        .sidebar-footer { padding: 18px; border-top: 1px solid #1f2937; flex-shrink: 0; }
        .user-card {
          display: flex; align-items: center; gap: 12px;
          background: #1f2937; padding: 12px; border-radius: 16px;
        }
        .avatar {
          width: 45px; height: 45px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; color: white;
        }
        .user-details { flex: 1; overflow: hidden; min-width: 0; }
        .user-name { font-size: 14px; font-weight: 600; }
        .user-email { font-size: 12px; color: #9ca3af; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .logout-button {
          border: none; background: #ef4444; color: white; width: 40px;
          height: 40px; border-radius: 12px; cursor: pointer; transition: 0.2s;
          font-size: 16px; flex-shrink: 0;
        }
        .logout-button:hover { transform: scale(1.05); background: #dc2626; }
      `}</style>

      {/* Mobile backdrop */}
      <div className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`} onClick={onMobileClose} />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* TOP */}
        <div className="sidebar-top">
          <div className="logo-wrapper">
            <div className="logo-icon">🧬</div>
            {!collapsed && <div className="logo-text">e<span>Lab</span></div>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '➡️' : '⬅️'}
          </button>
        </div>

        {/* ROLE */}
        {!collapsed && <div className="role-badge">{roleLabel}</div>}

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {links.map((section) => (
            <div className="nav-group" key={section.section}>
              {!collapsed && <div className="nav-group-title">{section.section}</div>}
              {section.items.map((item) => (
                <button
                  key={item.page}
                  className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.page)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {!collapsed && <span className="nav-item-label">{item.label}</span>}
                  {item.page === 'notifications' && unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{getInitials(user?.fullName || user?.email || 'U')}</div>
            {!collapsed && (
              <div className="user-details">
                <div className="user-name">{user?.fullName || 'User'}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            )}
            <button className="logout-button" onClick={logout} title="Logout">⏻</button>
          </div>
        </div>
      </aside>
    </>
  );
}