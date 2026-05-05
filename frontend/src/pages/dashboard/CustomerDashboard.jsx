import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeftRight, Landmark, Send, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './Dashboard.css';

export default function CustomerDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, tRes, lRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/transactions'),
          api.get('/loans'),
        ]);
        setAccounts(aRes.data);
        setTransactions(tRes.data);
        setLoans(lRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const recentTx = transactions.slice(0, 6);

  const accountCols = [
    { key: 'account_number', label: 'Account No' },
    { key: 'account_type', label: 'Type', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.account_type}</span> },
    { key: 'balance', label: 'Balance', render: (r) => <strong style={{ color: 'var(--success)' }}>{formatCurrency(r.balance)}</strong> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const txCols = [
    { key: 'tx_type', label: 'Type', render: (r) => <span className={`tx-type ${r.tx_type}`}>{r.tx_type}</span> },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'tx_time', label: 'Time', render: (r) => formatDateTime(r.tx_time) },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading dashboard...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Banking</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/transactions/transfer')}>
            <Send size={16} /> Transfer
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/transactions/debit')}>
            <CreditCard size={16} /> Withdraw
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={Wallet} label="Total Balance" value={formatCurrency(totalBalance)} color="var(--success)" />
        <StatCard icon={CreditCard} label="Accounts" value={accounts.length} color="var(--primary)" />
        <StatCard icon={ArrowLeftRight} label="Transactions" value={transactions.length} color="var(--secondary)" />
        <StatCard icon={Landmark} label="Active Loans" value={loans.filter(l => l.status === 'active').length} color="var(--accent)" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>My Accounts</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/accounts')}>View All</button>
          </div>
          <DataTable columns={accountCols} data={accounts} onRowClick={(r) => navigate(`/accounts/${r.account_id}`)} />
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/transactions')}>View All</button>
          </div>
          <DataTable columns={txCols} data={recentTx} emptyMessage="No transactions yet." />
        </div>
      </div>
    </div>
  );
}
