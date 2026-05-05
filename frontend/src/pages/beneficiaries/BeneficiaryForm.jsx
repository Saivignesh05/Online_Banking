import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import './Beneficiaries.css';

export default function BeneficiaryForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ beneficiary_account: '', beneficiary_name: '', bank_name: '', ifsc_code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.beneficiary_account || !form.beneficiary_name) { setError('Account number and name are required.'); return; }
    setLoading(true);
    try {
      await api.post('/beneficiaries', form);
      navigate('/beneficiaries');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add beneficiary.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add Beneficiary</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/beneficiaries')}><ArrowLeft size={16} /> Back</button>
      </div>
      <div className="form-card glass-card">
        {error && <div className="form-alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormInput label="Beneficiary Name" name="beneficiary_name" value={form.beneficiary_name} onChange={handleChange} required />
            <FormInput label="Account Number" name="beneficiary_account" value={form.beneficiary_account} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <FormInput label="Bank Name" name="bank_name" value={form.bank_name} onChange={handleChange} />
            <FormInput label="IFSC Code" name="ifsc_code" value={form.ifsc_code} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}><Save size={16} /> {loading ? 'Adding...' : 'Add Beneficiary'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
