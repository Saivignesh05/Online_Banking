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
    user_id: '', name: '', branch_id: '', manager_id: '',
    phone: '', email: '', hire_date: '', salary: ''
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/branches').then(r => setBranches(r.data)).catch(console.error);
    if (isEdit) {
      api.get(`/employees/${id}`).then(r => setForm(r.data)).catch(() => navigate('/employees'));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.branch_id) { setError('Name and branch are required.'); return; }
    if (!isEdit && !form.user_id) { setError('User ID is required for new employees.'); return; }
    setLoading(true);
    try {
      const data = { ...form, branch_id: Number(form.branch_id), user_id: Number(form.user_id), salary: form.salary ? Number(form.salary) : null };
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
            <FormInput label="User ID (from user_login)" name="user_id" type="number" value={form.user_id} onChange={handleChange} required />
          )}
          <div className="form-row">
            <FormInput label="Full Name" name="name" value={form.name || ''} onChange={handleChange} required />
            <FormSelect label="Branch" name="branch_id" value={form.branch_id} onChange={handleChange} placeholder="Select branch" required
              options={branches.map(b => ({ value: b.branch_id, label: `${b.branch_name} — ${b.location}` }))} />
          </div>
          <div className="form-row">
            <FormInput label="Email" name="email" type="email" value={form.email || ''} onChange={handleChange} />
            <FormInput label="Phone" name="phone" value={form.phone || ''} onChange={handleChange} />
          </div>
          <div className="form-row">
            <FormInput label="Hire Date" name="hire_date" type="date" value={form.hire_date ? form.hire_date.substring(0,10) : ''} onChange={handleChange} />
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
