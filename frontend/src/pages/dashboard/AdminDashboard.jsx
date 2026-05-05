import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, UserCheck, Shield, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import './Dashboard.css';

export default function AdminDashboard() {
  const [branches, setBranches] = useState([]);
  const [heads, setHeads] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, hRes, mRes] = await Promise.all([
          api.get('/branches'),
          api.get('/branches/heads'),
          api.get('/branches/managers'),
        ]);
        setBranches(bRes.data);
        setHeads(hRes.data);
        setManagers(mRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const branchCols = [
    { key: 'branch_id', label: 'ID', width: '60px' },
    { key: 'branch_name', label: 'Branch Name' },
    { key: 'location', label: 'Location' },
    { key: 'ifsc_code', label: 'IFSC Code' },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading dashboard...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/branches/new')}>
          <Building2 size={16} /> New Branch
        </button>
      </div>

      <div className="stats-grid">
        <StatCard icon={Building2} label="Total Branches" value={branches.length} color="var(--primary)" />
        <StatCard icon={Shield} label="Branch Heads" value={heads.length} color="var(--accent)" />
        <StatCard icon={UserCheck} label="Managers" value={managers.length} color="var(--secondary)" />
        <StatCard icon={TrendingUp} label="Active System" value="Online" color="var(--success)" />
      </div>

      <div className="dashboard-section">
        <h3>Branches</h3>
        <DataTable columns={branchCols} data={branches} onRowClick={(r) => navigate(`/branches/${r.branch_id}`)} />
      </div>
    </div>
  );
}
