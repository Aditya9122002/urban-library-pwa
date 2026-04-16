import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const BookDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { book } = location.state || {};
  const [loading, setLoading] = useState(false);

  if (!book) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            <p style={styles.backText}>←</p>
          </button>
          <p style={styles.headerTitle}>Book Details</p>
        </div>
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No book data provided.</p>
        </div>
      </div>
    );
  }

  const {
    id: bookId,
    title,
    author,
    genre,
    age_group: ageGroup,
    language,
    binding,
    is_available: isAvailable,
  } = book;

  const handleBorrow = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.alert('You must be logged in to borrow a book.');
        return;
      }

      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, flat_number, member_name')
        .eq('auth_user_id', user.id)
        .single();

      if (memberError || !member) {
        window.alert('Member profile not found. Please try again.');
        return;
      }

      const now = new Date();
      const borrowDate = now;
      const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      const borrowDateStr = borrowDate.toLocaleString();
      const dueDateStr = dueDate.toLocaleString();

      const confirmed = window.confirm(
        `Book: ${title}\nFlat: ${member.flat_number ?? '—'}\nMember: ${member.member_name ?? '—'}\nBorrow Date: ${borrowDateStr}\nDue Date: ${dueDateStr}\n\nAre you sure?`
      );
      if (!confirmed) return;
      setLoading(true);
      try {
        const { error: insertError } = await supabase
          .from('borrow_records')
          .insert({
            book_id: bookId,
            member_id: member.id,
            borrow_date: borrowDate.toISOString().split('T')[0],
            borrow_time: now.toISOString(),
            due_date: dueDate.toISOString().split('T')[0],
            status: 'borrowed',
            is_overdue: false,
          });

        if (insertError) {
          window.alert(insertError.message || 'Failed to create borrow record.');
          return;
        }

        const { error: updateError } = await supabase
          .from('books')
          .update({ is_available: false })
          .eq('id', bookId);

        if (updateError) {
          window.alert(updateError.message || 'Failed to update book availability.');
          return;
        }

        window.alert(`Book borrowed successfully! Due date: ${dueDateStr}`);
        navigation.navigate('BookCatalogue');
      } catch (err) {
        window.alert(err?.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    } catch (err) {
      window.alert(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          <p style={styles.backText}>←</p>
        </button>
        <p style={styles.headerTitle}>Book Details</p>
      </div>

      <div style={styles.topSection}>
        <p style={styles.topEmoji}>📚</p>
      </div>

      <div style={styles.detailsSection}>
        <p style={styles.title}>{title}</p>
        <p style={styles.author}>{author}</p>

        <div style={styles.divider} />

        <div style={styles.infoRow}>
          <p style={styles.infoLabel}>Genre</p>
          <p style={{ ...styles.infoValue, ...styles.genreValue }}>{genre}</p>
        </div>
        <div style={styles.infoRow}>
          <p style={styles.infoLabel}>Age Group</p>
          <p style={{ ...styles.infoValue, ...styles.ageValue }}>{ageGroup}</p>
        </div>
        <div style={styles.infoRow}>
          <p style={styles.infoLabel}>Language</p>
          <p style={styles.infoValue}>{language}</p>
        </div>
        <div style={styles.infoRow}>
          <p style={styles.infoLabel}>Binding</p>
          <p style={styles.infoValue}>{binding}</p>
        </div>

        <div
          style={{
            ...styles.availabilityBadge,
            ...(isAvailable
              ? styles.availabilityBadgeAvailable
              : styles.availabilityBadgeBorrowed),
          }}
        >
          <p
            style={{
              ...styles.availabilityText,
              ...(isAvailable
                ? styles.availabilityTextAvailable
                : styles.availabilityTextBorrowed),
            }}
          >
            {isAvailable ? '✓ Available to Borrow' : '✗ Currently Borrowed'}
          </p>
        </div>
      </div>

      <div style={styles.footer}>
        {isAvailable ? (
          <button
            type="button"
            style={{ ...styles.borrowButton, ...(loading ? styles.borrowButtonDisabled : {}) }}
            onClick={handleBorrow}
            disabled={loading}
          >
            {loading ? (
              <p style={styles.borrowButtonText}>Loading...</p>
            ) : (
              <p style={styles.borrowButtonText}>Borrow This Book</p>
            )}
          </button>
        ) : (
          <div style={{ ...styles.borrowButton, ...styles.borrowButtonDisabled }}>
            <p style={styles.borrowButtonText}>Not Available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F0F0F5',
  },
  header: {
    backgroundColor: '#1C2B3A',
    paddingTop: 16,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 20,
    margin: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    margin: 0,
  },
  topSection: {
    height: 220,
    backgroundColor: '#E8F5EE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topEmoji: {
    fontSize: 80,
    margin: 0,
  },
  detailsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C2B3A',
    margin: 0,
  },
  author: {
    fontSize: 16,
    color: '#555555',
    marginTop: 6,
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 16,
    marginBottom: 16,
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777777',
    margin: 0,
  },
  infoValue: {
    fontSize: 14,
    color: '#222222',
    margin: 0,
  },
  genreValue: {
    color: '#C8873A',
  },
  ageValue: {
    color: '#2E5FA3',
  },
  availabilityBadge: {
    marginTop: 16,
    padding: '10px 18px',
    borderRadius: 25,
    display: 'inline-block',
  },
  availabilityBadgeAvailable: {
    backgroundColor: '#E8F5EE',
  },
  availabilityBadgeBorrowed: {
    backgroundColor: '#FCE8E8',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    margin: 0,
  },
  availabilityTextAvailable: {
    color: '#2D7A4F',
  },
  availabilityTextBorrowed: {
    color: '#C84040',
  },
  footer: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#F0F0F5',
  },
  borrowButton: {
    backgroundColor: '#2D7A4F',
    borderRadius: 12,
    padding: '16px 0',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  borrowButtonDisabled: {
    backgroundColor: '#B0B0B8',
  },
  borrowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    margin: 0,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#555555',
    fontSize: 16,
    margin: 0,
  },
};

