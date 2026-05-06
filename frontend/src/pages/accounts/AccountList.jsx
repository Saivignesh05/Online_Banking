import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, Check, X } from 'lucide-react';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import FormSelect from '../../components/forms/FormSelect';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Accounts.css';

export default function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [requestForm, setRequestForm] = useState({ branch_id: '', account_type: 'savings' });
  const [processing, setProcessing] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchAccounts = () => {
    setLoading(true);
    api.get('/accounts')
      .then(r => setAccounts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
    if (user?.role_id === 4) {
      api.get('/branches').then(r => setBranches(r.data)).catch(console.error);
    }
  }, [user]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.branch_id || !requestForm.account_type) return;
    setProcessing(true);
    try {
      await api.post('/accounts/request', {
        branch_id: Number(requestForm.branch_id),
        account_type: requestForm.account_type
      });
      alert('Account request submitted successfully. Please wait for approval.');
      setRequestModal(false);
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to request account.');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this account?')) return;
    try {
      await api.put(`/accounts/${id}/approve`);
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve account.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this account request?')) return;
    try {
      await api.put(`/accounts/${id}/reject`);
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject account.');
    }
  };

  const columns = [
    { key: 'account_id', label: 'ID', width: '60px' },
    { key: 'account_number', label: 'Account Number' },
    { key: 'account_type', label: 'Type', render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.account_type}</span> },
    { key: 'balance', label: 'Balance', render: (r) => <strong style={{ color: 'var(--success)' }}>{formatCurrency(r.balance)}</strong> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'opened_date', label: 'Opened', render: (r) => formatDate(r.opened_date) },
  ];

  // If user is employee/manager, show action buttons for pending accounts
  if (user?.role_id <= 3) {
    columns.push({
      key: 'actions', label: '', width: '180px', render: (r) => (
        r.status === 'pending' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleApprove(r.account_id); }}>
              <Check size={14} /> Approve
            </button>
            <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleReject(r.account_id); }}>
              <X size={14} /> Reject
            </button>
          </div>
        ) : null
      )
    });
  }

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Wallet size={24} /> Accounts</h1>
        {user?.role_id <= 3 && (
          <button className="btn btn-primary" onClick={() => navigate('/accounts/new')}><Plus size={16} /> Admin Create Account</button>
        )}
        {user?.role_id === 4 && (
          <button className="btn btn-primary" onClick={() => setRequestModal(true)}><Plus size={16} /> Request New Account</button>
        )}
      </div>
      <DataTable columns={columns} data={accounts} onRowClick={(r) => navigate(`/accounts/${r.account_id}`)} emptyMessage="No accounts found." />

      {/* Request Account Modal for Customers */}
      {user?.role_id === 4 && (
        <Modal isOpen={requestModal} onClose={() => !processing && setRequestModal(false)} title="Request New Account">
          <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Select a branch and account type to request a new account. Your request will be reviewed by an employee.
            </p>
            <FormSelect 
              label="Branch" 
              name="branch_id" 
              value={requestForm.branch_id} 
              onChange={(e) => setRequestForm({...requestForm, branch_id: e.target.value})} 
              required
              placeholder="Select branch"
              options={branches.map(b => ({ value: b.branch_id, label: `${b.branch_name} — ${b.location}` }))}
            />
            <FormSelect 
              label="Account Type" 
              name="account_type" 
              value={requestForm.account_type} 
              onChange={(e) => setRequestForm({...requestForm, account_type: e.target.value})} 
              required
              options={[
                { value: 'savings', label: 'Savings Account' },
                { value: 'current', label: 'Current Account' },
                { value: 'fixed', label: 'Fixed Deposit' }
              ]}
            />
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setRequestModal(false)} disabled={processing}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={processing}>
                {processing ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
