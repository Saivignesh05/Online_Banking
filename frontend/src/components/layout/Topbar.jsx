import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getRoleName } from '../../utils/formatters';
import './Topbar.css';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        <div className="topbar-user-dropdown" style={{ position: 'relative' }}>
          <div 
            className="topbar-user" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <div className="topbar-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="topbar-user-info">
              <span className="topbar-username">{user?.username}</span>
              <span className="topbar-role">{getRoleName(user?.role_id)}</span>
            </div>
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu glass-card" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              padding: '8px 0',
              minWidth: '180px',
              zIndex: 100
            }}>
              <button 
                className="btn btn-ghost" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px' }}
                onClick={() => {
                  navigate('/profile');
                  setDropdownOpen(false);
                }}
              >
                <User size={16} style={{ marginRight: '8px' }}/>
                Update Profile
              </button>
              <button 
                className="btn btn-ghost" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px', color: 'var(--danger-color)' }}
                onClick={handleLogout}
              >
                <LogOut size={16} style={{ marginRight: '8px' }}/>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
