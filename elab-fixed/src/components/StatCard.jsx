import React from 'react';

export default function StatCard({ icon, label, value, color = 'teal', trend }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrap ${color}`}>{icon}</div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className={`stat-trend ${trend.direction}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.text}
        </div>
      )}
    </div>
  );
}
