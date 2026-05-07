import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeftRight, UserCircle, PlusCircle } from 'lucide-react';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './Dashboard.css';

export default function EmployeeDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, tRes, cRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/transactions'),
          api.get('/customers'),
        ]);
        setAccounts(aRes.data);
        setTransactions(tRes.data);
        setCustomers(cRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const recentTx = transactions.slice(0, 8);
  const txCols = [
    { key: 'tx_id', label: 'ID', width: '60px' },
    { key: 'tx_type', label: 'Type', render: (r) => <span className={`tx-type ${r.tx_type}`}>{r.tx_type}</span> },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'tx_time', label: 'Time', render: (r) => formatDateTime(r.tx_time) },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading dashboard...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Employee Dashboard</h1>
          {user?.employee && <p style={{ color: 'var(--text-muted)' }}>Branch: {user.employee.branch_name} ({user.employee.location})</p>}
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/accounts/new')}>
            <PlusCircle size={16} /> Open Account
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/transactions/credit')}>
            <Wallet size={16} /> Deposit
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={Wallet} label="Total Accounts" value={accounts.length} color="var(--primary)" />
        <StatCard icon={ArrowLeftRight} label="Transactions" value={transactions.length} color="var(--secondary)" />
        <StatCard icon={UserCircle} label="Customers" value={customers.length} color="var(--success)" />
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/transactions')}>View All</button>
        </div>
        <DataTable columns={txCols} data={recentTx} emptyMessage="No transactions yet." />
      </div>
    </div>
  );
}
