import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import { formatDateTime } from '../../utils/formatters';
import './Logs.css';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/logs/audit').then(r => setLogs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'audit_id', label: 'ID', width: '60px' },
    { key: 'username', label: 'User' },
    { key: 'user_role', label: 'Role', render: (r) => <span style={{textTransform:'capitalize'}}>{r.user_role || '—'}</span> },
    { key: 'action', label: 'Action', render: (r) => <span style={{textTransform:'uppercase',fontWeight:600,fontSize:'0.8rem'}}>{r.action}</span> },
    { key: 'table_name', label: 'Table' },
    { key: 'record_id', label: 'Record ID', render: (r) => r.record_id || '—' },
    { key: 'old_value', label: 'Old Value', render: (r) => r.old_value || '—' },
    { key: 'new_value', label: 'New Value', render: (r) => r.new_value || '—' },
    { key: 'action_time', label: 'Time', render: (r) => formatDateTime(r.action_time) },
    { key: 'ip_address', label: 'IP', render: (r) => r.ip_address || '—' },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><ShieldCheck size={24} /> Audit Logs</h1>
      </div>
      <DataTable columns={columns} data={logs} emptyMessage="No audit logs found." />
    </div>
  );
}
