import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import './Loans.css';

export default function LoanApplyForm() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', loan_type: 'home', loan_amount: '', repayment_type: 'emi' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/accounts').then(r => setAccounts(r.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.account_id || !form.loan_type || !form.loan_amount) {
      setError('All fields are required.'); return;
    }
    setLoading(true);
    try {
      await api.post('/loans', {
        account_id: Number(form.account_id),
        loan_type: form.loan_type,
        loan_amount: Number(form.loan_amount),
        repayment_type: form.repayment_type
      });
      navigate('/loans');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply for loan.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Apply for Loan</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/loans')}><ArrowLeft size={16} /> Back</button>
      </div>
      <div className="form-card glass-card">
        {error && <div className="form-alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormSelect label="Account" name="account_id" value={form.account_id} onChange={handleChange} placeholder="Select account" required
              options={accounts.map(a => ({ value: a.account_id, label: `${a.account_number} (${a.account_type})` }))} />
            <FormSelect label="Loan Type" name="loan_type" value={form.loan_type} onChange={handleChange}
              options={[{ value: 'home', label: 'Home Loan' }, { value: 'car', label: 'Car Loan' }, { value: 'edu', label: 'Education Loan' }, { value: 'personal', label: 'Personal Loan' }]} />
          </div>
          <div className="form-row">
            <FormInput label="Loan Amount (₹)" name="loan_amount" type="number" value={form.loan_amount} onChange={handleChange} required />
            <FormSelect label="Repayment Type" name="repayment_type" value={form.repayment_type} onChange={handleChange}
              options={[{ value: 'emi', label: 'EMI (Monthly Installments)' }, { value: 'direct', label: 'Direct (Lump Sum at End)' }]} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}><Save size={16} /> {loading ? 'Submitting...' : 'Apply'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
