import './StatusBadge.css';

const statusConfig = {
  active:    { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  success:   { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  paid:      { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  pending:   { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  inactive:  { bg: 'rgba(239, 68, 68, 0.15)',  color: '#ef4444' },
  failed:    { bg: 'rgba(239, 68, 68, 0.15)',  color: '#ef4444' },
  rejected:  { bg: 'rgba(239, 68, 68, 0.15)',  color: '#ef4444' },
  locked:    { bg: 'rgba(239, 68, 68, 0.15)',  color: '#ef4444' },
  overdue:   { bg: 'rgba(239, 68, 68, 0.15)',  color: '#ef4444' },
  closed:    { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' },
};

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase();
  const config = statusConfig[key] || { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' };

  return (
    <span
      className="status-badge"
      style={{ background: config.bg, color: config.color }}
    >
      {status || 'N/A'}
    </span>
  );
}
