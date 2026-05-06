import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import './Logs.css';

export default function LoginLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/logs/login').then(r => setLogs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'login_id', label: 'ID', width: '60px' },
    { key: 'username', label: 'Username' },
    { key: 'user_type', label: 'User Type', render: (r) => <span style={{textTransform:'capitalize'}}>{r.user_type || '—'}</span> },
    { key: 'login_time', label: 'Login Time', render: (r) => formatDateTime(r.login_time) },
    { key: 'logout_time', label: 'Logout Time', render: (r) => formatDateTime(r.logout_time) },
    { key: 'ip_address', label: 'IP Address', render: (r) => r.ip_address || '—' },
    { key: 'device', label: 'Device', render: (r) => r.device || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FileText size={24} /> Login Logs</h1>
      </div>
      <DataTable columns={columns} data={logs} emptyMessage="No login logs found." />
    </div>
  );
}
