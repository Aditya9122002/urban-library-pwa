import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const BorrowedList = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowed();
  }, []);

  const fetchBorrowed = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('borrow_records')
        .select('*, books(*), members(*)')
        .eq('status', 'borrowed')
        .order('borrow_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      window.alert('Failed to load borrowed books');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (record) => {
    const confirmed = window.confirm(
      `Book: ${record.books?.title}\nFlat: ${record.members?.flat_number}\nMember: ${record.members?.member_name}\n\nConfirm return?`
    );
    if (!confirmed) return;
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error: updateRecord } = await supabase
        .from('borrow_records')
        .update({
          status: 'returned',
          return_date: today,
          is_overdue: false,
        })
        .eq('id', record.id);

      if (updateRecord) throw updateRecord;

      const { error: updateBook } = await supabase
        .from('books')
        .update({ is_available: true })
        .eq('id', record.book_id);

      if (updateBook) throw updateBook;

      window.alert('Book marked as returned!');
      fetchBorrowed();
    } catch (err) {
      window.alert('Failed to mark as returned');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const isOverdue = (dueDateStr) => {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr);
    const today = new Date();
    return due < today;
  };

  const renderCard = (item) => {
    const overdue = isOverdue(item.due_date);
    return (
      <li key={item.id} style={{ ...styles.card, ...(overdue ? styles.cardOverdue : {}) }}>
        <div style={styles.cardHeader}>
          <p style={styles.bookTitle}>
            {item.books?.title || '—'}
          </p>
          {overdue && (
            <div style={styles.overdueBadge}>
              <p style={styles.overdueBadgeText}>OVERDUE</p>
            </div>
          )}
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
          <p style={styles.infoLabel}>Borrowed</p>
          <p style={styles.infoValue}>{formatDate(item.borrow_date)}</p>
        </div>
        <div style={styles.infoRow}>
          <p style={styles.infoLabel}>Due Date</p>
          <p style={{ ...styles.infoValue, ...(overdue ? styles.overdueText : {}) }}>
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
        <button type="button" onClick={() => navigation.goBack()} style={styles.backButton}>
          <p style={styles.backText}>←</p>
        </button>
        <div>
          <p style={styles.headerTitle}>Borrowed Books</p>
          <p style={styles.headerSubtitle}>{records.length} books currently borrowed</p>
        </div>
      </div>

      {loading ? (
        <p style={styles.loadingText}>Loading...</p>
      ) : records.length === 0 ? (
        <div style={styles.emptyWrap}>
          <p style={styles.emptyEmoji}>📭</p>
          <p style={styles.emptyText}>No books currently borrowed</p>
        </div>
      ) : (
        <ul style={styles.listContent}>
          {records.map(renderCard)}
        </ul>
      )}
    </div>
  );
};

export default BorrowedList;

const styles = {
  container: { flex: 1, backgroundColor: '#F0F0F5' },
  header: {
    backgroundColor: '#1C2B3A',
    paddingTop: 50,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12, border: 'none', background: 'transparent', cursor: 'pointer',
  },
  backText: { color: '#FFFFFF', fontSize: 22, margin: 0 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', margin: 0 },
  headerSubtitle: { color: '#B0B8C0', fontSize: 12, marginTop: 2, marginBottom: 0 },
  listContent: { padding: 16, paddingBottom: 40, listStyle: 'none', margin: 0 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardOverdue: { borderLeft: '4px solid #C84040' },
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
  emptyWrap: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 16, marginTop: 0 },
  emptyText: { fontSize: 16, color: '#555555', margin: 0 },
  loadingText: { marginTop: 40, textAlign: 'center', color: '#1C2B3A', fontSize: 16 },
};