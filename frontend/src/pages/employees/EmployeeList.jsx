import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Employees.css';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/employees').then(r => setEmployees(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.map(e => e.employee_id === id ? { ...e, status: 'inactive' } : e));
        alert('Employee deleted successfully.');
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete employee.');
      }
    }
  };

  const columns = [
    { key: 'employee_id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    { key: 'salary', label: 'Salary', render: (r) => r.salary ? formatCurrency(r.salary) : '—' },
    { key: 'hire_date', label: 'Hired', render: (r) => formatDate(r.hire_date) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', width: '150px', render: (r) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/employees/${r.employee_id}/edit`); }}>Edit</button>
        <button className="btn btn-ghost btn-sm" style={{color: 'var(--danger)'}} onClick={(e) => { e.stopPropagation(); handleDelete(r.employee_id); }}>Delete</button>
      </div>
    )},
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Users size={24} /> Employees</h1>
        <button className="btn btn-primary" onClick={() => navigate('/employees/new')}><Plus size={16} /> Add Employee</button>
      </div>
      <DataTable columns={columns} data={employees} emptyMessage="No employees found." />
    </div>
  );
}
