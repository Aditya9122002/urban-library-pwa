import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalBooks: 0, borrowed: 0, overdue: 0, members: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { count: totalBooks } = await supabase.from('books').select('*', { count: 'exact', head: true });
      const { count: borrowed } = await supabase.from('borrow_records').select('*', { count: 'exact', head: true }).eq('status', 'borrowed');
      const today = new Date().toISOString().split('T')[0];
      const { count: overdue } = await supabase.from('borrow_records').select('*', { count: 'exact', head: true }).eq('status', 'borrowed').lt('due_date', today);
      const { count: members } = await supabase.from('members').select('*', { count: 'exact', head: true });
      setStats({ totalBooks: totalBooks || 0, borrowed: borrowed || 0, overdue: overdue || 0, members: members || 0 });
    } catch (err) { window.alert('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };

  const statCards = [
    { label: 'Total Books', value: stats.totalBooks, emoji: '📚', color: '#2E5FA3' },
    { label: 'Borrowed', value: stats.borrowed, emoji: '📖', color: '#C8873A' },
    { label: 'Overdue', value: stats.overdue, emoji: '⚠️', color: '#C84040' },
    { label: 'Members', value: stats.members, emoji: '👥', color: '#2D7A4F' },
  ];

  const menuItems = [
    { label: 'Borrowed Books List', emoji: '📋', path: '/admin/borrowed' },
    { label: 'Overdue List', emoji: '⚠️', path: '/admin/overdue' },
    { label: 'Book Management', emoji: '📚', path: '/admin/books' },
    { label: 'Member Management', emoji: '👥', path: '/admin/members' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.headerTitle}>Admin Dashboard</p>
          <p style={styles.headerSubtitle}>Urban Library Management</p>
        </div>
        {loading ? <p style={styles.loadingText}>Loading...</p> : (
          <>
            <div style={styles.statsGrid}>
              {statCards.map((card) => (
                <div key={card.label} style={{ ...styles.statCard, backgroundColor: card.color }}>
                  <p style={styles.statEmoji}>{card.emoji}</p>
                  <p style={styles.statValue}>{card.value}</p>
                  <p style={styles.statLabel}>{card.label}</p>
                </div>
              ))}
            </div>
            <p style={styles.sectionTitle}>Management</p>
            {menuItems.map((item) => (
              <button key={item.label} type="button" style={styles.menuButton} onClick={() => navigate(item.path)}>
                <p style={styles.menuEmoji}>{item.emoji}</p>
                <p style={styles.menuLabel}>{item.label}</p>
                <p style={styles.menuArrow}>→</p>
              </button>
            ))}
            <button type="button" style={styles.logoutButton} onClick={handleLogout}>
              <p style={styles.logoutText}>Logout</p>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminHome;

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F0F0F5' },
  content: { paddingBottom: 40 },
  header: { backgroundColor: '#1C2B3A', paddingTop: 50, paddingBottom: 20, paddingLeft: 16, paddingRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', margin: 0 },
  headerSubtitle: { fontSize: 13, color: '#2D7A4F', marginTop: 4, marginBottom: 0 },
  statsGrid: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', flexDirection: 'column' },
  statEmoji: { fontSize: 30, marginBottom: 8, marginTop: 0 },
  statValue: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', margin: 0 },
  statLabel: { fontSize: 13, color: '#FFFFFF', marginTop: 4, textAlign: 'center', marginBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C2B3A', marginLeft: 16, marginTop: 8, marginBottom: 8 },
  menuButton: { display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginLeft: 16, marginRight: 16, marginBottom: 10, borderRadius: 12, padding: 16, border: 'none', cursor: 'pointer', width: 'calc(100% - 32px)' },
  menuEmoji: { fontSize: 22, marginRight: 12, marginTop: 0, marginBottom: 0 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1C2B3A', margin: 0 },
  menuArrow: { fontSize: 18, color: '#888888', margin: 0 },
  logoutButton: { backgroundColor: '#C84040', marginLeft: 16, marginRight: 16, marginTop: 16, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', width: 'calc(100% - 32px)' },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', margin: 0 },
  loadingText: { marginTop: 40, textAlign: 'center', color: '#1C2B3A', fontSize: 16 },
};