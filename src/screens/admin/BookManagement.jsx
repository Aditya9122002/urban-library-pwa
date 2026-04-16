import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const BookManagement = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState({
    title: '', author: '', genre: '',
    age_group: '', language: '', binding: '',
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');
      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      window.alert('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditBook(null);
    setForm({ title: '', author: '', genre: '', age_group: '', language: '', binding: '' });
    setModalVisible(true);
  };

  const openEditModal = (book) => {
    setEditBook(book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      age_group: book.age_group || '',
      language: book.language || '',
      binding: book.binding || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      window.alert('Book title is required');
      return;
    }
    try {
      if (editBook) {
        const { error } = await supabase
          .from('books')
          .update({ ...form })
          .eq('id', editBook.id);
        if (error) throw error;
        window.alert('Book updated successfully!');
      } else {
        const { error } = await supabase
          .from('books')
          .insert({ ...form, is_available: true, total_copies: 1 });
        if (error) throw error;
        window.alert('Book added successfully!');
      }
      setModalVisible(false);
      fetchBooks();
    } catch (err) {
      window.alert(err.message || 'Failed to save book');
    }
  };

  const handleDelete = (book) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${book.title}"?`);
    if (!confirmed) return;
    (async () => {
      try {
        const { error } = await supabase
          .from('books')
          .delete()
          .eq('id', book.id);
        if (error) throw error;
        window.alert('Book deleted successfully!');
        fetchBooks();
      } catch (err) {
        window.alert('Failed to delete book');
      }
    })();
  };

  const renderBook = (item) => (
    <li key={item.id} style={styles.card}>
      <div style={styles.cardLeft}>
        <p style={styles.bookTitle}>{item.title}</p>
        <p style={styles.bookAuthor}>{item.author}</p>
        <p style={styles.bookGenre}>{item.genre}</p>
        <div
          style={{
            ...styles.badge,
            ...(item.is_available ? styles.badgeAvailable : styles.badgeBorrowed),
          }}
        >
          <p
            style={{
              ...styles.badgeText,
              ...(item.is_available ? styles.badgeTextAvailable : styles.badgeTextBorrowed),
            }}
          >
            {item.is_available ? '✓ Available' : '✗ Borrowed'}
          </p>
        </div>
      </div>
      <div style={styles.cardActions}>
        <button
          type="button"
          style={styles.editButton}
          onClick={() => openEditModal(item)}
        >
          <p style={styles.editButtonText}>✏️ Edit</p>
        </button>
        <button
          type="button"
          style={styles.deleteButton}
          onClick={() => handleDelete(item)}
        >
          <p style={styles.deleteButtonText}>🗑️ Del</p>
        </button>
      </div>
    </li>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button type="button" onClick={() => navigate(-1)} style={styles.backButton}>
          <p style={styles.backText}>←</p>
        </button>
        <div style={{ flex: 1 }}>
          <p style={styles.headerTitle}>Book Management</p>
          <p style={styles.headerSubtitle}>{books.length} total books</p>
        </div>
        <button type="button" style={styles.addButton} onClick={openAddModal}>
          <p style={styles.addButtonText}>+ Add</p>
        </button>
      </div>

      <div style={styles.searchWrapper}>
        <input
          style={styles.searchInput}
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={styles.loadingText}>Loading...</p>
      ) : (
        <ul style={styles.listContent}>
          {filteredBooks.length === 0 ? (
            <li style={styles.emptyWrap}>
              <p style={styles.emptyText}>No books found</p>
            </li>
          ) : (
            filteredBooks.map(renderBook)
          )}
        </ul>
      )}

      {modalVisible ? (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div>
              <p style={styles.modalTitle}>
                {editBook ? 'Edit Book' : 'Add New Book'}
              </p>

              {[
                { key: 'title', label: 'Book Title *' },
                { key: 'author', label: 'Author' },
                { key: 'genre', label: 'Genre' },
                { key: 'age_group', label: 'Age Group' },
                { key: 'language', label: 'Language' },
                { key: 'binding', label: 'Binding' },
              ].map(({ key, label }) => (
                <div key={key} style={styles.inputGroup}>
                  <p style={styles.inputLabel}>{label}</p>
                  <input
                    style={styles.input}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={`Enter ${label}`}
                  />
                </div>
              ))}

              <div style={styles.modalButtons}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setModalVisible(false)}
                >
                  <p style={styles.cancelButtonText}>Cancel</p>
                </button>
                <button
                  type="button"
                  style={styles.saveButton}
                  onClick={handleSave}
                >
                  <p style={styles.saveButtonText}>
                    {editBook ? 'Update' : 'Add Book'}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BookManagement;

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
  backButton: { marginRight: 12, border: 'none', background: 'transparent', cursor: 'pointer' },
  backText: { color: '#FFFFFF', fontSize: 22, margin: 0 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', margin: 0 },
  headerSubtitle: { color: '#B0B8C0', fontSize: 12, marginTop: 2, marginBottom: 0 },
  addButton: {
    backgroundColor: '#2D7A4F',
    borderRadius: 8,
    padding: '8px 14px',
    border: 'none',
    cursor: 'pointer',
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, margin: 0 },
  searchWrapper: { padding: 16, paddingBottom: 8 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    border: '1px solid #E0E0E0',
    width: '100%',
    boxSizing: 'border-box',
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 40,
    listStyle: 'none',
    margin: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLeft: { flex: 1 },
  bookTitle: { fontSize: 14, fontWeight: '700', color: '#1C2B3A', marginBottom: 3, marginTop: 0 },
  bookAuthor: { fontSize: 12, color: '#888888', marginBottom: 3, marginTop: 0 },
  bookGenre: { fontSize: 11, color: '#C8873A', marginBottom: 6, marginTop: 0 },
  badge: { borderRadius: 8, padding: '3px 8px', display: 'inline-block' },
  badgeAvailable: { backgroundColor: '#E8F5EE' },
  badgeBorrowed: { backgroundColor: '#FCE8E8' },
  badgeText: { fontSize: 10, fontWeight: '600', margin: 0 },
  badgeTextAvailable: { color: '#2D7A4F' },
  badgeTextBorrowed: { color: '#C84040' },
  cardActions: { display: 'flex', gap: 8 },
  editButton: {
    backgroundColor: '#EAF0FB',
    borderRadius: 8,
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  editButtonText: { color: '#2E5FA3', fontSize: 12, fontWeight: '600', margin: 0 },
  deleteButton: {
    backgroundColor: '#FCE8E8',
    borderRadius: 8,
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  deleteButtonText: { color: '#C84040', fontSize: 12, fontWeight: '600', margin: 0 },
  emptyWrap: { display: 'flex', alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#555555', margin: 0 },
  loadingText: { marginTop: 40, textAlign: 'center', color: '#1C2B3A', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2B3A',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 0,
  },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, color: '#555555', marginBottom: 4, fontWeight: '600', marginTop: 0 },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1C2B3A',
    border: '1px solid #E0E0E0',
    width: '100%',
    boxSizing: 'border-box',
  },
  modalButtons: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F5',
    borderRadius: 10,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    marginRight: 6,
    border: 'none',
    cursor: 'pointer',
  },
  cancelButtonText: { color: '#555555', fontWeight: '600', fontSize: 15, margin: 0 },
  saveButton: {
    flex: 1,
    backgroundColor: '#2D7A4F',
    borderRadius: 10,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    marginLeft: 6,
    border: 'none',
    cursor: 'pointer',
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, margin: 0 },
};