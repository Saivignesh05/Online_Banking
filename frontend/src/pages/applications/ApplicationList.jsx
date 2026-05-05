import { useState, useEffect } from 'react';
import { FileSignature, Check, X, Building2, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import FormSelect from '../../components/forms/FormSelect';
import { formatDate } from '../../utils/formatters';
import './Applications.css';

export default function ApplicationList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [branches, setBranches] = useState([]);
  
  const [approveForm, setApproveForm] = useState({ branch_id: '', account_type: 'savings' });
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const [appRes, branchRes] = await Promise.all([
        api.get('/applications'),
        api.get('/branches')
      ]);
      setApplications(appRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approveForm.branch_id || !approveForm.account_type) return;
    setProcessing(true);
    try {
      const res = await api.put(`/applications/${selectedApp.application_id}/approve`, {
        branch_id: Number(approveForm.branch_id),
        account_type: approveForm.account_type
      });
      alert(`Approved! Assigned Account Number: ${res.data.account_number}`);
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this application?')) return;
    try {
      await api.put(`/applications/${id}/reject`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject.');
    }
  };

  const columns = [
    { key: 'application_id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Applicant Name' },
    { key: 'pan_card', label: 'PAN Card' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'applied_date', label: 'Applied', render: (r) => formatDate(r.applied_date) },
    { key: 'actions', label: '', width: '150px', render: (r) => (
      r.status === 'pending' ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedApp(r); }}>
            <Check size={14} /> Approve
          </button>
          <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleReject(r.application_id); }}>
            <X size={14} /> Reject
          </button>
        </div>
      ) : null
    )},
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading applications...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FileSignature size={24} /> Account Applications</h1>
      </div>

      <DataTable columns={columns} data={applications} emptyMessage="No applications found." />

      <Modal isOpen={!!selectedApp} onClose={() => !processing && setSelectedApp(null)} title="Approve Application">
        {selectedApp && (
          <form onSubmit={handleApproveSubmit} className="approve-form">
            <div className="app-details-summary">
              <p><strong>Name:</strong> {selectedApp.name}</p>
              <p><strong>PAN:</strong> {selectedApp.pan_card}</p>
            </div>
            
            <p className="app-instructions">Please assign a home branch and initial account type for the new customer.</p>
            
            <FormSelect 
              label="Assign Branch" 
              name="branch_id" 
              value={approveForm.branch_id} 
              onChange={(e) => setApproveForm({...approveForm, branch_id: e.target.value})} 
              required
              placeholder="Select branch"
              options={branches.map(b => ({ value: b.branch_id, label: `${b.branch_name} — ${b.location}` }))}
            />

            <FormSelect 
              label="Account Type" 
              name="account_type" 
              value={approveForm.account_type} 
              onChange={(e) => setApproveForm({...approveForm, account_type: e.target.value})} 
              required
              options={[
                { value: 'savings', label: 'Savings Account' },
                { value: 'current', label: 'Current Account' }
              ]}
            />

            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setSelectedApp(null)} disabled={processing}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={processing}>
                {processing ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
