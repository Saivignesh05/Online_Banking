import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import api from '../../api/axios';
import FormInput from '../../components/forms/FormInput';
import useAuth from '../../hooks/useAuth';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ phone: '', email: '' });
  
  const canEdit = user?.role_id === 3 || user?.role_id === 4;

  useEffect(() => {
    setLoading(true);
    api.get('/auth/me')
      .then(res => {
        const data = res.data;
        setProfile(data);
        
        let phone = '';
        let email = '';
        if (data.customer) {
          phone = data.customer?.phone || '';
          email = data.customer?.email || '';
        } else if (data.employee) {
          phone = data.employee?.phone || '';
          email = data.employee?.email || '';
        }
        setFormData({ phone, email });
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/auth/me', formData);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p className="loading-text">Loading Profile...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><User size={24} /> My Profile</h1>
      </div>

      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Username</label>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{profile?.username}</div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Role</label>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{profile?.role_name}</div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          {canEdit ? (
            <>
              <h3 style={{ marginBottom: '16px' }}>Contact Information</h3>
              <div style={{ marginBottom: '20px' }}>
                <FormInput 
                  label="Phone Number" 
                  name="phone" 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <FormInput 
                  label="Email Address" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '24px' }}>
              Profile updates are not supported for your role.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
