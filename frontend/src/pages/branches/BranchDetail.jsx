import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, MapPin, Phone, ArrowLeft, Edit } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import './Branches.css';

export default function BranchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, eRes] = await Promise.all([
          api.get(`/branches/${id}`),
          api.get(`/branches/${id}/employees`).catch(() => ({ data: [] })),
        ]);
        setBranch(bRes.data);
        setEmployees(eRes.data);
      } catch { navigate('/branches'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, navigate]);

  const empCols = [
    { key: 'employee_id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (loading || !branch) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Building2 size={24} /> {branch.branch_name}</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/branches')}><ArrowLeft size={16} /> Back</button>
          <button className="btn btn-primary" onClick={() => navigate(`/branches/${id}/edit`)}><Edit size={16} /> Edit</button>
        </div>
      </div>

      <div className="detail-card glass-card">
        <div className="detail-grid">
          <div className="detail-item"><MapPin size={16} /><div><span className="detail-label">Location</span><span className="detail-value">{branch.location}</span></div></div>
          <div className="detail-item"><Phone size={16} /><div><span className="detail-label">Contact</span><span className="detail-value">{branch.contact_number || '—'}</span></div></div>
          <div className="detail-item"><Building2 size={16} /><div><span className="detail-label">IFSC Code</span><span className="detail-value">{branch.ifsc_code || '—'}</span></div></div>
          <div className="detail-item"><Users size={16} /><div><span className="detail-label">Employees</span><span className="detail-value">{employees.length}</span></div></div>
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: 24 }}>
        <h3>Branch Employees</h3>
        <DataTable columns={empCols} data={employees} emptyMessage="No employees in this branch." />
      </div>
    </div>
  );
}
