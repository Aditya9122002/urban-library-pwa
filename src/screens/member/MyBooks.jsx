import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const formatDueDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatBorrowDateTime = (dateStr, timeStr) => {
  if (timeStr) return new Date(timeStr).toLocaleString();
  if (dateStr) return new Date(dateStr).toLocaleString();
  return '—';
};

const getDaysRemaining = (dueDateStr) => {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  due.setHours(23, 59, 59, 999);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (24 * 60 * 60 * 1000));
};

const MyBooks = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchBorrowed(); }, []);

  const fetchBorrowed = async () => {
    try {
      setLoading(true);
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Please log in to see your books.'); setRecords([]); return; }

      const { data: member, error: memberError } = await supabase
        .from('members').select('*').eq('auth_user_id', user.id).single();
      if (memberError || !member) { setError('Member profile not found.'); setRecords([]); return; }

      const { data: borrowData, error: borrowError } = await supabase
        .from('borrow_records').select('*, books(*)')
        .eq('member_id', member.id).eq('status', 'borrowed')
        .order('borrow_date', { ascending: false });

      if (borrowError) { setError(borrowError.message || 'Failed to load.'); setRecords([]); return; }
      setRecords(borrowData || []);
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (record) => {
    if (!window.confirm(`Return "${record.books?.title}"?`)) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error: recordError } = await supabase
        .from('borrow_records')
        .update({ status: 'returned', return_date: today, is_overdue: false })
        .eq('id', record.id);
      if (recordError) throw recordError;

      const { error: bookError } = await supabase
        .from('books').update({ is_available: true }).eq('id', record.book_id);
      if (bookError) throw bookError;

      alert('Book returned successfully! ✅');
      fetchBorrowed();
    } catch (err) {
      alert('Failed to return book. Please try again.');
    }
  };

  const renderCard = (item) => {
    const book = item.books;
    const days = getDaysRemaining(item.due_date);
    let daysColor = '#2D7A4F';
    let daysText = '';
    if (days === null) { daysText = '—'; }
    else if (days < 0) { daysColor = '#C84040'; daysText = 'OVERDUE'; }
    else if (days <= 3) { daysColor = '#C8873A'; daysText = days === 1 ? '1 day left' : `${days} days left`; }
    else { daysText = `${days} days left`; }

    return (
      <div key={item.id} style={styles.card}>
        <div style={styles.cardIconWrap}>
          <div style={styles.cardIconCircle}>
            <span style={styles.cardIcon}>📚</span>
          </div>
        </div>
        <div style={styles.cardContent}>
          <p style={styles.cardTitle}>{book?.title ?? 'Unknown'}</p>
          <p style={styles.cardAuthor}>{book?.author ?? '—'}</p>
          <p style={styles.cardBorrowed}>Borrowed on: {formatBorrowDateTime(item.borrow_date, item.borrow_time)}</p>
          <p style={styles.cardDue}>Due: {formatDueDate(item.due_date)}</p>
          <p style={{ ...styles.daysRemaining, color: daysColor }}>{daysText}</p>
          <button style={styles.returnButton} onClick={() => handleReturn(item)}>
            ↩ Return This Book
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <p style={styles.headerTitle}>My Borrowed Books</p>
        <p style={styles.headerSubtitle}>Your currently borrowed books</p>
      </div>

      {loading ? (
        <div style={styles.loaderWrap}><p>Loading...</p></div>
      ) : error ? (
        <div style={styles.errorWrap}><p style={styles.errorText}>{error}</p></div>
      ) : records.length === 0 ? (
        <div style={styles.emptyWrap}>
          <p style={styles.emptyEmoji}>📭</p>
          <p style={styles.emptyTitle}>No books borrowed yet</p>
          <p style={styles.emptySubtitle}>Visit the catalogue to borrow books</p>
          <button style={styles.browseButton} onClick={() => navigate('/books')}>
            Browse Books
          </button>
        </div>
      ) : (
        <div style={styles.listContent}>
          {records.map(renderCard)}
        </div>
      )}
    </div>
  );
};

export default MyBooks;

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F0F0F5' },
  header: { backgroundColor: '#1C2B3A', paddingTop: 50, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', margin: 0 },
  headerSubtitle: { marginTop: 4, fontSize: 13, color: '#B0B8C0', margin: 0 },
  loaderWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorWrap: { padding: 16 },
  errorText: { color: '#C84040', fontSize: 14, textAlign: 'center' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: { display: 'flex', flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' },
  cardIconWrap: { marginRight: 12 },
  cardIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1C2B3A', marginBottom: 4, marginTop: 0 },
  cardAuthor: { fontSize: 12, color: '#888888', marginBottom: 6, marginTop: 0 },
  cardBorrowed: { fontSize: 11, color: '#888888', marginBottom: 2, marginTop: 0 },
  cardDue: { fontSize: 12, color: '#C8873A', marginBottom: 4, marginTop: 0 },
  daysRemaining: { fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 0 },
  returnButton: { backgroundColor: '#2E5FA3', borderRadius: 10, padding: 10, color: '#FFFFFF', fontSize: 13, fontWeight: '600', border: 'none', cursor: 'pointer', width: '100%' },
  emptyWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1C2B3A', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#555555', marginBottom: 24, textAlign: 'center' },
  browseButton: { backgroundColor: '#2D7A4F', borderRadius: 12, padding: '14px 24px', color: '#FFFFFF', fontSize: 16, fontWeight: '600', border: 'none', cursor: 'pointer' },
};