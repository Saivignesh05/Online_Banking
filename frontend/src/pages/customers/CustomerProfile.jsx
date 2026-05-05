import { useState, useEffect } from 'react';
import { Save, UserCircle } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import './Customers.css';

export default function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/customers/profile')
      .then(r => { setProfile(r.data); setForm(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.put(`/customers/${profile.customer_id}`, form);
      setProfile(res.data);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-container"><p className="loading-text">Loading profile...</p></div>;
  if (!profile) return <div className="page-container"><p>Profile not found.</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><UserCircle size={24} /> My Profile</h1>
      </div>

      <div className="form-card glass-card">
        {msg.text && <div className={`form-alert ${msg.type}`}>{msg.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <FormInput label="Full Name" name="name" value={form.name || ''} onChange={handleChange} />
            <FormInput label="Date of Birth" name="dob" type="date" value={form.dob ? form.dob.substring(0,10) : ''} onChange={handleChange} />
          </div>
          <div className="form-row">
            <FormInput label="Email" name="email" type="email" value={form.email || ''} onChange={handleChange} />
            <FormInput label="Phone" name="phone" value={form.phone || ''} onChange={handleChange} />
          </div>
          <div className="form-row">
            <FormSelect label="Gender" name="gender" value={form.gender || ''} onChange={handleChange} placeholder="Select"
              options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
            <FormInput label="Address" name="address" value={form.address || ''} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Update Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
