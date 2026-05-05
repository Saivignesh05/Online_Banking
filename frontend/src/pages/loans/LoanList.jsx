import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus } from 'lucide-react';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Loans.css';

export default function LoanList() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchLoans = () => {
    api.get('/loans').then(r => setLoans(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/loans/${id}/approve`);
      fetchLoans();
    } catch (err) { alert(err.response?.data?.error || 'Failed to approve.'); }
  };

  const columns = [
    { key: 'loan_id', label: 'ID', width: '60px' },
    { key: 'loan_type', label: 'Type', render: (r) => <span style={{textTransform:'capitalize'}}>{r.loan_type}</span> },
    { key: 'loan_amount', label: 'Amount', render: (r) => formatCurrency(r.loan_amount) },
    { key: 'interest_rate', label: 'Rate', render: (r) => `${r.interest_rate}%` },
    { key: 'tenure_months', label: 'Tenure', render: (r) => `${r.tenure_months} months` },
    { key: 'start_date', label: 'Start', render: (r) => formatDate(r.start_date) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(user?.role_id <= 3 ? [{ key: 'actions', label: '', width: '100px', render: (r) =>
      r.status === 'pending' ? (
        <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleApprove(r.loan_id); }}>Approve</button>
      ) : null
    }] : []),
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Landmark size={24} /> Loans</h1>
        {user?.role_id === 4 && (
          <button className="btn btn-primary" onClick={() => navigate('/loans/apply')}><Plus size={16} /> Apply for Loan</button>
        )}
      </div>
      <DataTable columns={columns} data={loans} onRowClick={(r) => navigate(`/loans/${r.loan_id}`)} emptyMessage="No loans found." />
    </div>
  );
}
