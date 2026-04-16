import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setMember(null); return; }
        const { data, error } = await supabase
          .from('members').select('*').eq('auth_user_id', user.id).single();
        if (!error) setMember(data);
        else setMember(null);
      } catch (e) {
        setMember(null);
      } finally {
        setLoading(false);
      }
    };
    loadMember();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.container}><p style={{color:'#fff'}}>Loading...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <p style={styles.headerTitle}>Profile</p>
        <p style={styles.headerSubtitle}>Your account</p>
      </div>
      <div style={styles.content}>
        {member && (
          <>
            <div style={styles.row}>
              <p style={styles.label}>Flat</p>
              <p style={styles.value}>{member.flat_number ?? '—'}</p>
            </div>
            <div style={styles.row}>
              <p style={styles.label}>Name</p>
              <p style={styles.value}>{member.member_name ?? member.name ?? '—'}</p>
            </div>
          </>
        )}
      </div>
      <div style={styles.footer}>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1C2B3A', paddingTop: 50 },
  header: { padding: '0 16px 24px' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', margin: 0 },
  headerSubtitle: { marginTop: 4, fontSize: 14, color: '#B0B8C0', margin: 0 },
  content: { padding: '0 16px' },
  row: { marginBottom: 16 },
  label: { fontSize: 12, color: '#888888', marginBottom: 4, marginTop: 0 },
  value: { fontSize: 16, color: '#FFFFFF', fontWeight: '500', margin: 0 },
  footer: { padding: '16px', paddingBottom: 100 },
  logoutButton: { backgroundColor: '#C84040', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, fontWeight: '600', border: 'none', cursor: 'pointer', width: '100%' },
};