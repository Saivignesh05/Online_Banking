import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Phone, AlertCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import './Auth.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    role_id: '4', name: '', dob: '', gender: '',
    phone: '', email: '', address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Username and password are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = { ...form, role_id: Number(form.role_id) };
      delete data.confirmPassword;
      await register(data);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isCustomer = form.role_id === '4';

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
            <span className="brand-name gradient-text">NexusBank</span>
          </div>
          <h1>Create Account</h1>
          <p>Join NexusBank today</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <FormInput label="Username" name="username" value={form.username} onChange={handleChange} icon={User} required />
            <FormSelect
              label="Role"
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              options={[
                { value: '4', label: 'Account Holder' },
                { value: '3', label: 'Employee' },
                { value: '2', label: 'Manager' },
                { value: '1', label: 'Branch Head' },
              ]}
            />
          </div>
          <div className="form-row">
            <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} icon={Lock} required />
            <FormInput label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} icon={Lock} required />
          </div>

          {isCustomer && (
            <>
              <div className="form-row">
                <FormInput label="Full Name" name="name" value={form.name} onChange={handleChange} />
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
            </>
          )}

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <span className="btn-loader" /> : <UserPlus size={18} />}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
