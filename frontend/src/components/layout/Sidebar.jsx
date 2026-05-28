import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, UserCircle, Wallet,
  ArrowLeftRight, Heart, Landmark, FileText, ShieldCheck,
  ChevronRight
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, maxRole: 4 },
  { to: '/branches', label: 'Branches', icon: Building2, maxRole: 1 },
  { to: '/managers', label: 'Managers', icon: ShieldCheck, maxRole: 1 },
  { to: '/employees', label: 'Employees', icon: Users, maxRole: 2 },
  { to: '/applications', label: 'Applications', icon: FileText, maxRole: 3 },
  { to: '/customers', label: 'Customers', icon: UserCircle, maxRole: 3 },
  { to: '/accounts', label: 'Accounts', icon: Wallet, maxRole: 4 },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, maxRole: 4 },
  { to: '/beneficiaries', label: 'Beneficiaries', icon: Heart, exactRoles: [4] },
  { to: '/loans', label: 'Loans', icon: Landmark, maxRole: 4 },
  { to: '/logs/login', label: 'Login Logs', icon: FileText, maxRole: 2 },
  { to: '/logs/audit', label: 'Audit Logs', icon: ShieldCheck, maxRole: 1 },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (item.exactRoles) return item.exactRoles.includes(user?.role_id);
    return user?.role_id <= item.maxRole;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Landmark size={20} color="white" />
        </div>
        <span className="brand-name">Assk Bank</span>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="nav-arrow" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="user-avatar-sm">{user?.username?.charAt(0).toUpperCase()}</div>
          <div className="user-info-sm">
            <span className="user-name-sm">{user?.username}</span>
            <span className="user-role-sm">{user?.role_name}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
