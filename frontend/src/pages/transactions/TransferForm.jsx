import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import './Transactions.css';

export default function TransferForm() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ from_account: '', to_account: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/accounts').then(r => setAccounts(r.data)).catch(console.error);
  }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); setResult(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from_account || !form.to_account || !form.amount) { setError('All fields are required.'); return; }
    if (form.from_account === form.to_account) { setError('Cannot transfer to the same account.'); return; }
    if (Number(form.amount) <= 0) { setError('Amount must be positive.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/transactions/transfer', {
        from_account: Number(form.from_account),
        to_account: Number(form.to_account),
        amount: Number(form.amount),
      });
      setResult(res.data);
      setForm({ from_account: '', to_account: '', amount: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Send size={24} /> Transfer Money</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/transactions')}><ArrowLeft size={16} /> Back</button>
      </div>

      {result && (
        <div className="success-card glass-card">
          <CheckCircle size={40} color="var(--success)" />
          <h3>Transfer Successful!</h3>
          <p>Reference: <strong>{result.transaction?.reference_no}</strong></p>
          <p>Amount: <strong>₹{Number(result.transaction?.amount).toLocaleString('en-IN')}</strong></p>
        </div>
      )}

      <div className="form-card glass-card">
        {error && <div className="form-alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <FormSelect label="From Account" name="from_account" value={form.from_account} onChange={handleChange} placeholder="Select source account" required
            options={accounts.map(a => ({ value: a.account_id, label: `${a.account_number} — ₹${Number(a.balance).toLocaleString('en-IN')}` }))} />
          <FormInput label="To Account (Account ID)" name="to_account" type="number" value={form.to_account} onChange={handleChange} required placeholder="Enter destination account ID" />
          <FormInput label="Amount (₹)" name="amount" type="number" value={form.amount} onChange={handleChange} required placeholder="0.00" />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}><Send size={16} /> {loading ? 'Transferring...' : 'Transfer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
