import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import './Transactions.css';

export default function CreditForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ to_account: '', amount: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); setResult(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.to_account || !form.amount) { setError('Account and amount are required.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/transactions/credit', {
        to_account: Number(form.to_account), amount: Number(form.amount), remarks: form.remarks
      });
      setResult(res.data);
      setForm({ to_account: '', amount: '', remarks: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Deposit failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Deposit Cash (Credit)</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/transactions')}><ArrowLeft size={16} /> Back</button>
      </div>
      {result && (
        <div className="success-card glass-card">
          <CheckCircle size={40} color="var(--success)" />
          <h3>Deposit Successful!</h3>
          <p>Reference: <strong>{result.reference_no}</strong></p>
        </div>
      )}
      <div className="form-card glass-card">
        {error && <div className="form-alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <FormInput label="Account ID" name="to_account" type="number" value={form.to_account} onChange={handleChange} required />
          <FormInput label="Amount (₹)" name="amount" type="number" value={form.amount} onChange={handleChange} required />
          <FormInput label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Optional remarks" />
          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={loading}><Save size={16} /> {loading ? 'Processing...' : 'Deposit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
