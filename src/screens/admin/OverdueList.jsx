import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const OverdueList = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverdue();
  }, []);

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('borrow_records')
        .select('*, books(*), members(*)')
        .eq('status', 'borrowed')
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      window.alert('Failed to load overdue books');
    } finally {
      setLoading(false);
    }
  };

  const getDaysOverdue = (dueDateStr) => {
    if (!dueDateStr) return 0;
    const due = new Date(dueDateStr);
    const today = new Date();
    return Math.floor((today - due) / (24 * 60 * 60 * 1000));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const handleReturn = async (record) => {
    const confirmed = window.confirm(
      `Book: ${record.books?.title}\nFlat: ${record.members?.flat_number}\n\nConfirm return?`
    );
    if (!confirmed) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('borrow_records')
        .update({ status: 'returned', return_date: today, is_overdue: false })
        .eq('id', record.id);
      await supabase
        .from('books')
        .update({ is_available: true })
        .eq('id', record.book_id);
      window.alert('Book marked as returned!');
      fetchOverdue();
    } catch (err) {
      window.alert('Failed to mark as returned');
    }
  };

  const renderCard = (item) => {
    const daysOverdue = getDaysOverdue(item.due_date);
    return (
      <li key={item.id} style={styles.card}>
        <div style={styles.cardHeader}>
          <p style={styles.bookTitle}>
            {item.books?.title || '—'}
          </p>
          <div style={styles.overdueBadge}>
            <p style={styles.overdueBadgeText}>{daysOverdue}d overdue</p>
          </div>
        </div>
        <p style={styles.bookAuthor}>{item.books?.author || '—'}</p>
        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <p style={styles.infoLabel}>Flat</p>
          <p style={styles.infoValue}>{item.members?.flat_number || '—'}</p>
        </div>
        <div style={styles.infoRow}>
          <p style={styles.infoLabel}>Member</p>
          <p style={styles.infoValue}>{item.members?.member_name || '—'}</p>
        </div>
        <div style={styles.infoRow}>
          <p style={styles.infoLabel}>Due Date</p>
          <p style={{ ...styles.infoValue, ...styles.overdueText }}>
            {formatDate(item.due_date)}
          </p>
        </div>
        <button
          type="button"
          style={styles.returnButton}
          onClick={() => handleReturn(item)}
        >
          <p style={styles.returnButtonText}>✓ Mark as Returned</p>
        </button>
      </li>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button type="button" onClick={() => navigate(-1)} style={styles.backButton}>
          <p style={styles.backText}>←</p>
        </button>
        <div>
          <p style={styles.headerTitle}>Overdue Books</p>
          <p style={styles.headerSubtitle}>{records.length} books overdue</p>
        </div>
      </div>

      {loading ? (
        <p style={styles.loadingText}>Loading...</p>
      ) : records.length === 0 ? (
        <div style={styles.emptyWrap}>
          <p style={styles.emptyEmoji}>✅</p>
          <p style={styles.emptyText}>No overdue books!</p>
          <p style={styles.emptySubtext}>All books returned on time</p>
        </div>
      ) : (
        <ul style={styles.listContent}>{records.map(renderCard)}</ul>
      )}
    </div>
  );
};

export default OverdueList;

const styles = {
  container: { flex: 1, backgroundColor: '#F0F0F5' },
  header: {
    backgroundColor: '#C84040',
    paddingTop: 50,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 12, border: 'none', background: 'transparent', cursor: 'pointer' },
  backText: { color: '#FFFFFF', fontSize: 22, margin: 0 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', margin: 0 },
  headerSubtitle: { color: '#FFD0D0', fontSize: 12, marginTop: 2, marginBottom: 0 },
  listContent: { padding: 16, paddingBottom: 40, listStyle: 'none', margin: 0 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeft: '4px solid #C84040',
    marginBottom: 12,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1C2B3A',
    marginRight: 8,
    marginTop: 0,
    marginBottom: 0,
  },
  bookAuthor: { fontSize: 13, color: '#888888', marginBottom: 12, marginTop: 0 },
  overdueBadge: {
    backgroundColor: '#FCE8E8',
    borderRadius: 6,
    padding: '3px 8px',
  },
  overdueBadgeText: { color: '#C84040', fontSize: 10, fontWeight: '700', margin: 0 },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginBottom: 12 },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: { fontSize: 13, color: '#888888', margin: 0 },
  infoValue: { fontSize: 13, color: '#1C2B3A', fontWeight: '500', margin: 0 },
  overdueText: { color: '#C84040', fontWeight: '700' },
  returnButton: {
    backgroundColor: '#2D7A4F',
    borderRadius: 10,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    marginTop: 12,
    border: 'none',
    cursor: 'pointer',
  },
  returnButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', margin: 0 },
  emptyWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16, marginTop: 0 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1C2B3A', margin: 0 },
  emptySubtext: { fontSize: 14, color: '#555555', marginTop: 8, marginBottom: 0 },
  loadingText: { marginTop: 40, textAlign: 'center', color: '#1C2B3A', fontSize: 16 },
};