export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const statusBadgeClass = (status) => {
  const map = {
    Pending: 'badge-amber',
    Confirmed: 'badge-blue',
    Cancelled: 'badge-red',
    Completed: 'badge-green',
    Paid: 'badge-green',
    Unpaid: 'badge-amber',
    Refunded: 'badge-gray',
    Approved: 'badge-green',
    Rejected: 'badge-red',
    Uploaded: 'badge-blue',
    Reviewed: 'badge-teal',
    Active: 'badge-green',
    Inactive: 'badge-gray',
    Normal: 'badge-green',
    High: 'badge-red',
    Low: 'badge-blue',
  };
  return map[status] || 'badge-gray';
};

export const genderLabel = (g) => {
  if (g === 1 || g === 'Male') return 'Male';
  if (g === 2 || g === 'Female') return 'Female';
  return g || '—';
};

export const jobTitleLabel = (j) => {
  if (j === 1 || j === 'Administrator') return 'Administrator';
  if (j === 2 || j === 'LabManager') return 'Lab Manager';
  return j || '—';
};

export const truncate = (str, max = 40) => {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '…' : str;
};
