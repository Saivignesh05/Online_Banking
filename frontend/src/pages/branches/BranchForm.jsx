import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import './Branches.css';

export default function BranchForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ branch_name: '', location: '', contact_number: '', ifsc_code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/branches/${id}`).then(r => setForm(r.data)).catch(() => navigate('/branches'));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.branch_name || !form.location) { setError('Branch name and location are required.'); return; }
    setLoading(true);
    try {
      if (isEdit) { await api.put(`/branches/${id}`, form); }
      else { await api.post('/branches', form); }
      navigate('/branches');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save branch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Branch' : 'New Branch'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/branches')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="form-card glass-card">
        {error && <div className="form-alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormInput label="Branch Name" name="branch_name" value={form.branch_name} onChange={handleChange} required />
            <FormInput label="Location" name="location" value={form.location} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <FormInput label="Contact Number" name="contact_number" value={form.contact_number || ''} onChange={handleChange} />
            <FormInput label="IFSC Code" name="ifsc_code" value={form.ifsc_code || ''} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
