import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ flat_number: '', member_name: '', phone: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.flat_number.trim()) { window.alert('Please enter your flat number'); return; }
    if (!form.member_name.trim()) { window.alert('Please enter your name'); return; }
    if (!form.password.trim()) { window.alert('Please enter a password'); return; }
    if (form.password !== form.confirm_password) { window.alert('Passwords do not match'); return; }
    if (form.password.length < 6) { window.alert('Password must be at least 6 characters'); return; }
    try {
      setLoading(true);
      const { data: existing } = await supabase.from('members').select('id').eq('flat_number', form.flat_number.toUpperCase()).single();
      if (existing) { window.alert('This flat number is already registered. Please contact the library admin if you forgot your password.'); return; }
      const flatClean = form.flat_number.toLowerCase().replace(/-/g, '').replace(/\s/g, '');
      const email = `${flatClean}@urbanlibrary.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: form.password });
      if (authError) throw authError;
      const { error: memberError } = await supabase.from('members').insert({ flat_number: form.flat_number.toUpperCase(), member_name: form.member_name.trim(), phone: form.phone.trim(), role: 'member', is_active: true, auth_user_id: authData.user?.id });
      if (memberError) throw memberError;
      window.alert(`✅ Registration Successful!\n\nWelcome to Urban Library!\n\nFlat: ${form.flat_number.toUpperCase()}\n\nYou can now login with your flat number and password.`);
      navigate('/login');
    } catch (err) {
      window.alert(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.title}>Urban Library</p>
          <p style={styles.subtitle}>Create Your Account</p>
        </div>
        <div style={styles.form}>
          {[
            { label: 'Flat Number *', key: 'flat_number', placeholder: 'e.g. A-204', type: 'text' },
            { label: 'Your Name *', key: 'member_name', placeholder: 'Enter your full name', type: 'text' },
            { label: 'Phone Number', key: 'phone', placeholder: 'Enter your phone number', type: 'text' },
            { label: 'Password *', key: 'password', placeholder: 'Minimum 6 characters', type: 'password' },
            { label: 'Confirm Password *', key: 'confirm_password', placeholder: 'Re-enter your password', type: 'password' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <p style={styles.label}>{label}</p>
              <input type={type} style={styles.input} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <button type="button" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }} onClick={handleRegister} disabled={loading}>
            <p style={styles.buttonText}>{loading ? 'Loading...' : 'Create Account'}</p>
          </button>
          <button type="button" style={styles.loginLink} onClick={() => navigate('/login')}>
            <p style={styles.loginLinkText}>Already have an account? <span style={styles.loginLinkBold}>Login here</span></p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1C2B3A' },
  content: { paddingLeft: 24, paddingRight: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '700', color: '#2D7A4F', margin: 0 },
  subtitle: { marginTop: 8, fontSize: 16, color: '#FFFFFF', marginBottom: 0 },
  form: { marginTop: 8 },
  label: { fontSize: 13, color: '#B0B8C0', marginBottom: 6, fontWeight: '600', marginTop: 0 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: '12px 16px', fontSize: 15, marginBottom: 16, color: '#1C2B3A', width: '100%', boxSizing: 'border-box', border: 'none' },
  button: { backgroundColor: '#2D7A4F', borderRadius: 8, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8, border: 'none', cursor: 'pointer', width: '100%' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', margin: 0 },
  loginLink: { marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' },
  loginLinkText: { color: '#B0B8C0', fontSize: 14, margin: 0 },
  loginLinkBold: { color: '#2D7A4F', fontWeight: '700' },
};