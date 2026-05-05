import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';

export default function ManagerForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', password: '', department: '', appointed_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.department) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/managers', form);
      navigate('/managers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save manager.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>New Manager</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/managers')}><ArrowLeft size={16} /> Back</button>
      </div>
      <div className="form-card glass-card">
        {error && <div className="form-alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormInput label="Username" name="username" value={form.username} onChange={handleChange} required />
            <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <FormInput label="Department" name="department" value={form.department} onChange={handleChange} required />
            <FormInput label="Appointment Date" name="appointed_date" type="date" value={form.appointed_date} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}><Save size={16} /> {loading ? 'Creating...' : 'Create Manager'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
