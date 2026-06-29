import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

export default function Topbar({ title, subtitle, actions, onNotifClick, unreadCount = 0, onMenuClick }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          title="Open menu"
          aria-label="Open navigation"
        >
          ☰
        </button>
        <div>
          <div className="page-title">{title}</div>
          {subtitle && <div className="page-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="topbar-right">
        {actions}
        <button className="icon-btn" onClick={onNotifClick} title="Notifications">
          🔔
          {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
          {getInitials(user?.fullName || user?.email)}
        </div>
      </div>
    </header>
  );
}
