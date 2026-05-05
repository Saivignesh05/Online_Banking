import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import './Accounts.css';

export default function AccountForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_id: '', branch_id: '', account_number: '', account_type: 'savings', balance: '' });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/branches').then(r => setBranches(r.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.branch_id || !form.account_number || !form.account_type) {
      setError('All fields are required.'); return;
    }
    setLoading(true);
    try {
      await api.post('/accounts', { ...form, customer_id: Number(form.customer_id), branch_id: Number(form.branch_id), balance: Number(form.balance) || 0 });
      navigate('/accounts');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Open New Account</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/accounts')}><ArrowLeft size={16} /> Back</button>
      </div>
      <div className="form-card glass-card">
        {error && <div className="form-alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormInput label="Customer ID" name="customer_id" type="number" value={form.customer_id} onChange={handleChange} required />
            <FormSelect label="Branch" name="branch_id" value={form.branch_id} onChange={handleChange} placeholder="Select branch" required
              options={branches.map(b => ({ value: b.branch_id, label: `${b.branch_name} — ${b.location}` }))} />
          </div>
          <div className="form-row">
            <FormInput label="Account Number" name="account_number" value={form.account_number} onChange={handleChange} required />
            <FormSelect label="Account Type" name="account_type" value={form.account_type} onChange={handleChange}
              options={[{ value: 'savings', label: 'Savings' }, { value: 'current', label: 'Current' }, { value: 'fixed', label: 'Fixed Deposit' }]} />
          </div>
          <FormInput label="Initial Balance" name="balance" type="number" value={form.balance} onChange={handleChange} placeholder="0.00" />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}><Save size={16} /> {loading ? 'Creating...' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
