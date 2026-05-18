import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Send, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './Transactions.css';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/transactions').then(r => setTransactions(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'tx_id', label: 'ID', width: '60px' },
    { key: 'tx_type', label: 'Type', render: (r) => <span className={`tx-type ${r.tx_type}`}>{r.tx_type}</span> },
    { key: 'from_account', label: 'From', render: (r) => r.from_account_number || 'Bank' },
    { key: 'to_account', label: 'To', render: (r) => r.to_account_number || 'Bank' },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'reference_no', label: 'Reference', render: (r) => r.reference_no || '—' },
    { key: 'remarks', label: 'Remarks', render: (r) => r.remarks || '—' },
    { key: 'tx_time', label: 'Time', render: (r) => formatDateTime(r.tx_time) },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><ArrowLeftRight size={24} /> Transactions</h1>
        <div className="header-actions">
          {user?.role_id === 4 && (
            <>
              <button className="btn btn-primary" onClick={() => navigate('/transactions/transfer')}><Send size={16} /> Transfer</button>
              <button className="btn btn-secondary" onClick={() => navigate('/transactions/debit')}><CreditCard size={16} /> Withdraw</button>
            </>
          )}
          {user?.role_id <= 3 && (
            <button className="btn btn-success" onClick={() => navigate('/transactions/credit')}><CreditCard size={16} /> Deposit</button>
          )}
        </div>
      </div>
      
      <div className="filters-container" style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <input 
          type="text" 
          placeholder="Search by Account Number..." 
          className="form-input" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      </div>

      <DataTable columns={columns} data={transactions.filter(t => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (t.from_account_number && String(t.from_account_number).toLowerCase().includes(lowerTerm)) ||
               (t.to_account_number && String(t.to_account_number).toLowerCase().includes(lowerTerm)) ||
               (t.reference_no && String(t.reference_no).toLowerCase().includes(lowerTerm));
      })} emptyMessage="No transactions found." />
    </div>
  );
}
