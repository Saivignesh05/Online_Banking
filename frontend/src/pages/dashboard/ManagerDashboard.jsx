import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCircle, Landmark, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import './Dashboard.css';

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, cRes, lRes] = await Promise.all([
          api.get('/employees'),
          api.get('/customers'),
          api.get('/loans'),
        ]);
        setEmployees(eRes.data);
        setCustomers(cRes.data);
        setLoans(lRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingLoans = loans.filter(l => l.status === 'pending');

  const loanCols = [
    { key: 'loan_id', label: 'ID', width: '60px' },
    { key: 'loan_type', label: 'Type' },
    { key: 'loan_amount', label: 'Amount', render: (r) => `₹${Number(r.loan_amount).toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading dashboard...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Manager Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatCard icon={Users} label="Employees" value={employees.length} color="var(--primary)" />
        <StatCard icon={UserCircle} label="Customers" value={customers.length} color="var(--success)" />
        <StatCard icon={Landmark} label="Total Loans" value={loans.length} color="var(--secondary)" />
        <StatCard icon={ClipboardList} label="Pending Loans" value={pendingLoans.length} color="var(--accent)" />
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3>Pending Loan Approvals</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/loans')}>View All</button>
        </div>
        <DataTable columns={loanCols} data={pendingLoans.slice(0, 10)} onRowClick={(r) => navigate(`/loans/${r.loan_id}`)} emptyMessage="No pending loans." />
      </div>
    </div>
  );
}
