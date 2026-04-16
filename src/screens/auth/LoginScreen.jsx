import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const convertToEmail = (flatNumber) => {
  const cleaned = flatNumber.toLowerCase().replace(/-/g, '').replace(/\s/g, '');
  return `${cleaned}@urbanlibrary.com`;
};

const checkDueDateAlerts = async (memberId) => {
  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    const todayStr = today.toISOString().split('T')[0];
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];
    const { data, error } = await supabase.from('borrow_records').select('*, books(*)').eq('member_id', memberId).eq('status', 'borrowed');
    if (error || !data || data.length === 0) return;
    const overdueBooks = data.filter((r) => r.due_date && r.due_date < todayStr);
    const dueSoonBooks = data.filter((r) => r.due_date && r.due_date >= todayStr && r.due_date <= threeDaysStr);
    if (overdueBooks.length > 0) {
      const bookList = overdueBooks.map((r) => `• ${r.books?.title || 'Unknown'}`).join('\n');
      window.alert(`⚠️ Overdue Books!\n\nYou have ${overdueBooks.length} overdue book(s):\n\n${bookList}\n\nPlease return them as soon as possible!`);
    } else if (dueSoonBooks.length > 0) {
      const bookList = dueSoonBooks.map((r) => `• ${r.books?.title || 'Unknown'} (Due: ${r.due_date})`).join('\n');
      window.alert(`📅 Books Due Soon!\n\nYou have ${dueSoonBooks.length} book(s) due within 3 days:\n\n${bookList}\n\nPlease return them on time!`);
    }
  } catch (err) { console.log('Alert check error:', err); }
};

const LoginScreen = () => {
  const navigate = useNavigate();
  const [flatNumber, setFlatNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!flatNumber || !password) { setError('Please enter flat number and password'); return; }
    try {
      setLoading(true);
      setError('');
      const email = convertToEmail(flatNumber);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.user) { setError('Invalid flat number or password'); return; }
      const { data: member, error: memberError } = await supabase.from('members').select('*').eq('auth_user_id', data.user.id).single();
      if (memberError || !member) { setError('Invalid flat number or password'); return; }
      if (member.role === 'admin') { navigate('/admin'); }
      else if (member.role === 'member') { await checkDueDateAlerts(member.id); navigate('/books'); }
      else { setError('Invalid flat number or password'); }
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <p style={styles.title}>Urban Library</p>
        <p style={styles.subtitle}>Society Library Management</p>
      </div>
      <div style={styles.form}>
        <input style={styles.input} placeholder="Enter Flat Number e.g. A-204" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} />
        <input style={styles.input} placeholder="Enter Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="button" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }} onClick={handleLogin} disabled={loading}>
          <p style={styles.buttonText}>{loading ? 'Loading...' : 'Login'}</p>
        </button>
        {error ? <p style={styles.errorText}>{error}</p> : null}
        <button type="button" style={styles.registerLink} onClick={() => navigate('/register')}>
          <p style={styles.registerLinkText}>New member? <span style={styles.registerLinkBold}>Register here</span></p>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1C2B3A', paddingLeft: 24, paddingRight: 24, paddingTop: 80 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '700', color: '#2D7A4F', margin: 0 },
  subtitle: { marginTop: 8, fontSize: 16, color: '#FFFFFF', marginBottom: 0 },
  form: { marginTop: 20 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: '12px 16px', fontSize: 16, marginBottom: 16, border: 'none', width: '100%', boxSizing: 'border-box' },
  button: { backgroundColor: '#2D7A4F', borderRadius: 8, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8, border: 'none', cursor: 'pointer', width: '100%' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', margin: 0 },
  errorText: { marginTop: 12, color: '#FF4D4F', fontSize: 14, textAlign: 'center', marginBottom: 0 },
  registerLink: { marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' },
  registerLinkText: { color: '#B0B8C0', fontSize: 14, margin: 0 },
  registerLinkBold: { color: '#2D7A4F', fontWeight: '700' },
};