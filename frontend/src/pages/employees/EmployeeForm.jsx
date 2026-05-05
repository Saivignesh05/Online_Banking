import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import './Employees.css';

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', password: '', name: '', 
    phone: '', email: '', hire_date: '', salary: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/employees/${id}`).then(r => setForm(r.data)).catch(() => navigate('/employees'));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Name is required.'); return; }
    if (!isEdit && (!form.username || !form.password)) { 
      setError('Username and password are required for new employees.'); 
      return; 
    }
    setLoading(true);
    try {
      const data = { ...form, salary: form.salary ? Number(form.salary) : null };
      if (isEdit) { await api.put(`/employees/${id}`, data); }
      else { await api.post('/employees', data); }
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save employee.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Employee' : 'New Employee'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/employees')}><ArrowLeft size={16} /> Back</button>
      </div>
      <div className="form-card glass-card">
        {error && <div className="form-alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <div className="form-row">
              <FormInput label="Username" name="username" value={form.username} onChange={handleChange} required />
              <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
          )}
          <div className="form-row">
            <FormInput label="Full Name" name="name" value={form.name || ''} onChange={handleChange} required />
            <FormInput label="Email" name="email" type="email" value={form.email || ''} onChange={handleChange} />
          </div>
          <div className="form-row">
            <FormInput label="Phone" name="phone" value={form.phone || ''} onChange={handleChange} />
            <FormInput label="Hire Date" name="hire_date" type="date" value={form.hire_date ? form.hire_date.substring(0,10) : ''} onChange={handleChange} />
          </div>
          <div className="form-row">
            <FormInput label="Salary" name="salary" type="number" value={form.salary || ''} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}><Save size={16} /> {loading ? 'Saving...' : 'Save Employee'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
