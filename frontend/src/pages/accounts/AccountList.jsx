import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus } from 'lucide-react';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Accounts.css';

export default function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/accounts').then(r => setAccounts(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'account_id', label: 'ID', width: '60px' },
    { key: 'account_number', label: 'Account Number' },
    { key: 'account_type', label: 'Type', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.account_type}</span> },
    { key: 'balance', label: 'Balance', render: (r) => <strong style={{ color: 'var(--success)' }}>{formatCurrency(r.balance)}</strong> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'opened_date', label: 'Opened', render: (r) => formatDate(r.opened_date) },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Wallet size={24} /> Accounts</h1>
        {user?.role_id <= 3 && (
          <button className="btn btn-primary" onClick={() => navigate('/accounts/new')}><Plus size={16} /> Open Account</button>
        )}
      </div>
      <DataTable columns={columns} data={accounts} onRowClick={(r) => navigate(`/accounts/${r.account_id}`)} emptyMessage="No accounts found." />
    </div>
  );
}
