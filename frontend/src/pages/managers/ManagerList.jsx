import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function ManagerList() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/managers').then(r => setManagers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'manager_id', label: 'ID', width: '60px' },
    { key: 'username', label: 'Username' },
    { key: 'department', label: 'Department' },
    { key: 'appointed_date', label: 'Appointed', render: (r) => formatDate(r.appointed_date) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><ShieldCheck size={24} /> Managers</h1>
        <button className="btn btn-primary" onClick={() => navigate('/managers/new')}><Plus size={16} /> Add Manager</button>
      </div>
      <DataTable columns={columns} data={managers} emptyMessage="No managers found." />
    </div>
  );
}
