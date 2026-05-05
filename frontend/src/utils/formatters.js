/**
 * Format a number as Indian Rupee currency
 */
export const formatCurrency = (amount) => {
  if (amount == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

/**
 * Format a date string to locale date
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a timestamp to locale date + time
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get role display name from role_id
 */
export const getRoleName = (roleId) => {
  const roles = {
    1: 'Branch Head',
    2: 'Manager',
    3: 'Employee',
    4: 'Account Holder',
  };
  return roles[roleId] || 'Unknown';
};

/**
 * Get role badge color class
 */
export const getRoleColor = (roleId) => {
  const colors = {
    1: '#f59e0b',
    2: '#8b5cf6',
    3: '#3b82f6',
    4: '#10b981',
  };
  return colors[roleId] || '#64748b';
};

/**
 * Truncate text to a max length
 */
export const truncate = (str, max = 30) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
