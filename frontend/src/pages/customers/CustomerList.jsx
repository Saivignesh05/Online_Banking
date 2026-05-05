import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import './Customers.css';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customers').then(r => setCustomers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'customer_id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Name', render: (r) => r.name || '—' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    { key: 'cibil_score', label: 'CIBIL', render: (r) => r.cibil_score || '—' },
    { key: 'kyc_verified', label: 'KYC', render: (r) => (
      <StatusBadge status={r.kyc_verified ? 'active' : 'pending'} />
    )},
    { key: 'created_at', label: 'Joined', render: (r) => formatDate(r.created_at) },
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><UserCircle size={24} /> Customers</h1>
      </div>
      <DataTable columns={columns} data={customers} emptyMessage="No customers found." />
    </div>
  );
}
