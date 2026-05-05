import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, Phone } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import './Branches.css';

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/branches').then(r => setBranches(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'branch_id', label: 'ID', width: '60px' },
    { key: 'branch_name', label: 'Branch Name', render: (r) => (
      <div className="cell-with-icon"><Building2 size={15} /><span>{r.branch_name}</span></div>
    )},
    { key: 'location', label: 'Location', render: (r) => (
      <div className="cell-with-icon"><MapPin size={14} /><span>{r.location}</span></div>
    )},
    { key: 'contact_number', label: 'Contact', render: (r) => r.contact_number || '—' },
    { key: 'ifsc_code', label: 'IFSC Code' },
    { key: 'actions', label: '', width: '80px', render: (r) => (
      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/branches/${r.branch_id}/edit`); }}>Edit</button>
    )}
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading branches...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Building2 size={24} /> Branches</h1>
        <button className="btn btn-primary" onClick={() => navigate('/branches/new')}>
          <Plus size={16} /> Add Branch
        </button>
      </div>
      <DataTable columns={columns} data={branches} onRowClick={(r) => navigate(`/branches/${r.branch_id}`)} emptyMessage="No branches found." />
    </div>
  );
}
