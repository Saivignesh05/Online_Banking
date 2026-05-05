import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, color = 'var(--primary)', trend }) {
  return (
    <div className="stat-card glass-card">
      <div className="stat-icon-wrap" style={{ background: `${color}18`, color }}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {trend && <span className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>{trend > 0 ? '+' : ''}{trend}%</span>}
      </div>
    </div>
  );
}
