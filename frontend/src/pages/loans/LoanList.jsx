import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus, X, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import FormInput from '../../components/forms/FormInput';
import './Loans.css';

export default function LoanList() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Manager Modal state
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [optionsForm, setOptionsForm] = useState([{ interestRate: '', tenureMonths: '' }]);
  const [submitting, setSubmitting] = useState(false);

  // Customer Modal state
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchLoans = () => {
    api.get('/loans').then(r => setLoans(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleManagerApproveClick = (id) => {
    setSelectedLoanId(id);
    setOptionsForm([{ interestRate: '', tenureMonths: '' }]);
    setManagerModalOpen(true);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...optionsForm];
    newOptions[index][field] = value;
    setOptionsForm(newOptions);
  };

  const addOptionField = () => {
    setOptionsForm([...optionsForm, { interestRate: '', tenureMonths: '' }]);
  };

  const removeOptionField = (index) => {
    const newOptions = [...optionsForm];
    newOptions.splice(index, 1);
    setOptionsForm(newOptions);
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    for (const opt of optionsForm) {
      if (!opt.interestRate || !opt.tenureMonths) {
        alert('All interest rates and tenures are required.'); return;
      }
    }
    setSubmitting(true);
    try {
      await api.put(`/loans/${selectedLoanId}/provide-options`, {
        options: optionsForm.map(o => ({
          interestRate: Number(o.interestRate),
          tenureMonths: Number(o.tenureMonths)
        }))
      });
      setManagerModalOpen(false);
      fetchLoans();
    } catch (err) { alert(err.response?.data?.error || 'Failed to provide options.'); }
    finally { setSubmitting(false); }
  };

  const handleReviewClick = async (id) => {
    setSelectedLoanId(id);
    try {
      const res = await api.get(`/loans/${id}/options`);
      setCustomerOptions(res.data);
      setCustomerModalOpen(true);
    } catch (err) { alert('Failed to fetch options.'); }
  };

  const handleConfirmOption = async (optionId) => {
    if (!window.confirm('Are you sure you want to accept this loan option?')) return;
    try {
      await api.put(`/loans/${selectedLoanId}/confirm-option`, { option_id: optionId });
      setCustomerModalOpen(false);
      fetchLoans();
    } catch (err) { alert(err.response?.data?.error || 'Failed to confirm option.'); }
  };

  const handleDecline = async (id) => {
    if (!window.confirm('Are you sure you want to decline this loan?')) return;
    try {
      await api.put(`/loans/${id}/reject`);
      setCustomerModalOpen(false);
      fetchLoans();
    } catch (err) { alert(err.response?.data?.error || 'Failed to decline.'); }
  };

  const columns = [
    { key: 'loan_id', label: 'ID', width: '60px' },
    { key: 'loan_type', label: 'Type', render: (r) => <span style={{textTransform:'capitalize'}}>{r.loan_type}</span> },
    { key: 'repayment_type', label: 'Repayment', render: (r) => <span style={{textTransform:'capitalize'}}>{r.repayment_type || 'EMI'}</span> },
    { key: 'loan_amount', label: 'Amount', render: (r) => formatCurrency(r.loan_amount) },
    { key: 'interest_rate', label: 'Rate', render: (r) => r.interest_rate ? `${r.interest_rate}%` : '-' },
    { key: 'tenure_months', label: 'Tenure', render: (r) => r.tenure_months ? `${r.tenure_months} months` : '-' },
    { key: 'start_date', label: 'Start', render: (r) => r.start_date ? formatDate(r.start_date) : '-' },
    { key: 'end_date', label: 'End', render: (r) => {
        if (!r.start_date || !r.tenure_months) return '-';
        const date = new Date(r.start_date);
        date.setMonth(date.getMonth() + r.tenure_months);
        return formatDate(date.toISOString());
      }
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', width: '150px', render: (r) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        {user?.role_id <= 3 && r.status === 'pending' && (
          <>
            <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleManagerApproveClick(r.loan_id); }}>Provide Options</button>
            <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDecline(r.loan_id); }}>Decline</button>
          </>
        )}
        {user?.role_id === 4 && r.status === 'awaiting' && (
          <>
            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleReviewClick(r.loan_id); }}>Review Options</button>
            <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleDecline(r.loan_id); }}>Decline</button>
          </>
        )}
        {user?.role_id === 4 && r.status === 'active' && (
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/loans/${r.loan_id}`); }}>
            {r.repayment_type === 'direct' ? 'Pay Loan' : 'Pay EMI'}
          </button>
        )}
      </div>
    )},
  ];

  if (loading) return <div className="page-container"><p className="loading-text">Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Landmark size={24} /> Loans</h1>
        {user?.role_id === 4 && (
          <button className="btn btn-primary" onClick={() => navigate('/loans/apply')}><Plus size={16} /> Apply for Loan</button>
        )}
      </div>
      <DataTable columns={columns} data={loans} onRowClick={(r) => navigate(`/loans/${r.loan_id}`)} emptyMessage="No loans found." />

      {/* Manager Provide Options Modal */}
      {managerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '500px', margin: 'auto', padding: '24px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Provide Loan Options</h3>
              <button className="btn-icon" onClick={() => setManagerModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleManagerSubmit}>
              {optionsForm.map((opt, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px', background: 'var(--surface-color)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <FormInput 
                      label="Interest Rate (%)" 
                      name={`interestRate_${index}`}
                      type="number" 
                      value={opt.interestRate} 
                      onChange={(e) => handleOptionChange(index, 'interestRate', e.target.value)} 
                      required 
                      placeholder="e.g. 8.5"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <FormInput 
                      label="Tenure (months)" 
                      name={`tenureMonths_${index}`}
                      type="number" 
                      value={opt.tenureMonths} 
                      onChange={(e) => handleOptionChange(index, 'tenureMonths', e.target.value)} 
                      required 
                      placeholder="e.g. 60"
                    />
                  </div>
                  {optionsForm.length > 1 && (
                    <button type="button" className="btn-icon" onClick={() => removeOptionField(index)} style={{ marginTop: '28px', color: 'var(--danger-color)' }}>
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              
              <button type="button" className="btn btn-secondary btn-sm" onClick={addOptionField}>
                <Plus size={16} /> Add Another Option
              </button>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setManagerModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Options to Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Review Options Modal */}
      {customerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '500px', margin: 'auto', padding: '24px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Review Loan Options</h3>
              <button className="btn-icon" onClick={() => setCustomerModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            
            <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>The bank has offered the following options for your loan. Please select one or decline the loan entirely.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {customerOptions.map(opt => (
                <div key={opt.option_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong>{opt.interest_rate}%</strong> for <strong>{opt.tenure_months} months</strong>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => handleConfirmOption(opt.option_id)}>
                    Accept This
                  </button>
                </div>
              ))}
              {customerOptions.length === 0 && <p>No options found.</p>}
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCustomerModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDecline(selectedLoanId)}>Decline Loan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
