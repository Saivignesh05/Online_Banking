import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getRoleName } from '../../utils/formatters';
import './Topbar.css';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-greeting">
          Welcome back, <span className="gradient-text">{user?.username}</span>
        </h2>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={19} />
        </button>

        <div className="topbar-divider" />

        <div className="topbar-user">
          <div className="topbar-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          <div className="topbar-user-info">
            <span className="topbar-username">{user?.username}</span>
            <span className="topbar-role">{getRoleName(user?.role_id)}</span>
          </div>
        </div>

        <button className="btn btn-ghost topbar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
