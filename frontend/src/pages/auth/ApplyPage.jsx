import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Phone, AlertCircle, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import './Auth.css';

export default function ApplyPage() {
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    name: '', dob: '', gender: '',
    phone: '', email: '', address: '', pan_card: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.name || !form.pan_card) {
      setError('Username, password, name, and PAN card are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setSuccess('');
    try {
      const data = { ...form };
      delete data.confirmPassword;
      const res = await api.post('/auth/apply', data);

      // Remove auto-login, just show success message and redirect to login
      setSuccess('Application submitted successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Application failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="auth-card glass-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-brand">
            <div className="brand-icon">N</div>
            <span className="brand-name gradient-text">Assk Bank</span>
          </div>
          <h1>Apply for an Account</h1>
          <p>Submit your details to open an account with Assk Bank</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="form-alert success">
            {success} Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <FormInput label="Username (for login)" name="username" value={form.username} onChange={handleChange} icon={User} required />
            <FormInput label="Full Name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} icon={Lock} required />
            <FormInput label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} icon={Lock} required />
          </div>

          <div className="form-row">
            <FormInput label="PAN Card" name="pan_card" value={form.pan_card} onChange={handleChange} icon={CreditCard} required placeholder="ABCDE1234F" />
            <FormInput label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} />
          </div>
          <div className="form-row">
            <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} icon={Mail} />
            <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} icon={Phone} />
          </div>
          <FormSelect
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            placeholder="Select gender"
            options={[
              { value: 'M', label: 'Male' },
              { value: 'F', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading || success}>
            {loading ? <span className="btn-loader" /> : <UserPlus size={18} />}
            <span>{loading ? 'Submitting Application...' : 'Submit Application'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
