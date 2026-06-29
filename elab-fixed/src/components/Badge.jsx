import React from 'react';
import { statusBadgeClass } from '../utils/helpers';

export default function Badge({ status, label, className }) {
  const cls = className || statusBadgeClass(status || label);
  return <span className={`badge ${cls}`}>{label || status}</span>;
}
