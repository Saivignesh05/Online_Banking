import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import './Beneficiaries.css';

export default function BeneficiaryList() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = () => {
    api.get('/beneficiaries').then(r => setBeneficiaries(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this beneficiary?')) return;
    try {
      await api.delete(`/beneficiaries/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to remove.'); }
  };

  const columns = [
    { key: 'beneficiary_id', label: 'ID', width: '60px' },
    { key: 'beneficiary_name', label: 'Name' },
    { key: 'beneficiary_account', label: 'Account No' },
    { key: 'bank_name', label: 'Bank', render: (r) => r.bank_name || '—' },
    { key: 'ifsc_code', label: 'IFSC', render: (r) => r.ifsc_code || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'added_date', label: 'Added', render: (r) => formatDate(r.added_date) },
    { key: 'actions', label: '', width: '80px', render: (r) => (
      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(r.beneficiary_id); }} style={{color: 'var(--danger)'}}>
        <Trash2 size={14} />
      </button>
    )},
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Heart size={24} /> Beneficiaries</h1>
        <button className="btn btn-primary" onClick={() => navigate('/beneficiaries/new')}><Plus size={16} /> Add Beneficiary</button>
      </div>
      <DataTable columns={columns} data={beneficiaries} emptyMessage="No beneficiaries added yet." />
    </div>
  );
}
