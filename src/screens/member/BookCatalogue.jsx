import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const BookCatalogue = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError('');

        const { data, error: fetchError } = await supabase
          .from('books')
          .select('*')
          .order('title');

        if (fetchError) {
          setError('Failed to load books');
          return;
        }

        setBooks(data || []);
      } finally {
        setLoading(false);
      }
    };

    const fetchGenres = async () => {
      const { data } = await supabase.from('books').select('genre');

      if (data) {
        const uniqueGenres = [
          'All',
          ...new Set(data.map((b) => b.genre).filter(Boolean)),
        ];
        setGenres(uniqueGenres);
      }
    };

    fetchBooks();
    fetchGenres();
  }, []);

  useEffect(() => {
    let data = [...books];

    if (activeFilter !== 'All') {
      data = data.filter(
        (book) => book.genre && book.genre === activeFilter
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter((book) => {
        const title = book.title || '';
        const author = book.author || '';
        return (
          title.toLowerCase().includes(query) ||
          author.toLowerCase().includes(query)
        );
      });
    }

    setFilteredBooks(data);
  }, [books, search, activeFilter]);

  const renderBook = (item) => {
    const available = item.is_available;

    return (
      <li key={item.id}>
        <button
          type="button"
          style={styles.card}
          onClick={() => navigate(`/books/${item.id}`, { state: { book: item } })}
        >
          <div style={styles.cardTop}>
            <p style={styles.cardTopIcon}>📚</p>
          </div>
          <div style={styles.cardBottom}>
            <p style={styles.bookTitle}>{item.title}</p>
            <p style={styles.bookAuthor}>{item.author}</p>
            <p style={styles.bookGenre}>{item.genre}</p>
            <div style={styles.badgeRow}>
              <div
                style={{
                  ...styles.badge,
                  ...(available ? styles.badgeAvailable : styles.badgeBorrowed),
                }}
              >
                <p
                  style={{
                    ...styles.badgeText,
                    ...(available ? styles.badgeTextAvailable : styles.badgeTextBorrowed),
                  }}
                >
                  {available ? '✓ Available' : '✗ Borrowed'}
                </p>
              </div>
            </div>
          </div>
        </button>
      </li>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <p style={styles.headerTitle}>Urban Library</p>
        <p style={styles.headerSubtitle}>
          📚 {books.length} Books Available
        </p>
      </div>

      <div style={styles.searchWrapper}>
        <div style={styles.searchContainer}>
          <input
            style={styles.searchInput}
            placeholder="Search by title or author"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.filtersWrapper}>
        <div style={styles.filtersScroll}>
          <div style={styles.filtersContent}>
            {genres.map((filter) => {
              const isActive = filter === activeFilter;
              return (
                <button
                  key={filter}
                  type="button"
                  style={{
                    ...styles.chip,
                    ...(isActive ? styles.chipActive : {}),
                  }}
                  onClick={() => setActiveFilter(filter)}
                >
                  <p
                    style={{
                      ...styles.chipText,
                      ...(isActive ? styles.chipTextActive : {}),
                    }}
                  >
                    {filter}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p style={styles.resultsText}>
        Showing {filteredBooks.length} books
      </p>

      {loading ? (
        <div style={styles.loaderContainer}>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      ) : (
        <ul style={styles.listContent}>
          {filteredBooks.length === 0 ? (
            <li style={styles.emptyContainer}>
              <p style={styles.emptyText}>No books found.</p>
            </li>
          ) : (
            filteredBooks.map(renderBook)
          )}
        </ul>
      )}

      {error ? <p style={styles.errorText}>{error}</p> : null}
    </div>
  );
};

export default BookCatalogue;

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F0F0F5',
  },
  header: {
    backgroundColor: '#1C2B3A',
    paddingTop: 50,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    margin: 0,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#2D7A4F',
    marginBottom: 0,
  },
  searchWrapper: {
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 12,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  searchInput: {
    fontSize: 14,
    width: '100%',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
  },
  filtersWrapper: {
    marginTop: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },
  filtersScroll: {
    overflowX: 'auto',
  },
  filtersContent: {
    paddingTop: 4,
    paddingBottom: 4,
    display: 'flex',
    gap: 8,
    minWidth: 'max-content',
  },
  chip: {
    padding: '8px 16px',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    border: '1px solid #1C2B3A',
    cursor: 'pointer',
  },
  chipActive: {
    backgroundColor: '#2D7A4F',
    border: '1px solid #2D7A4F',
  },
  chipText: {
    color: '#1C2B3A',
    fontSize: 14,
    margin: 0,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultsText: {
    marginTop: 8,
    marginLeft: 20,
    fontSize: 13,
    color: '#555555',
    marginBottom: 0,
  },
  loaderContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#1C2B3A',
    fontSize: 16,
  },
  listContent: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 100,
    paddingTop: 12,
    listStyle: 'none',
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    height: 220,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    border: 'none',
    padding: 0,
    textAlign: 'left',
    cursor: 'pointer',
  },
  cardTop: {
    height: 110,
    backgroundColor: '#E8F5EE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopIcon: {
    fontSize: 50,
    margin: 0,
  },
  cardBottom: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  bookTitle: {
    color: '#1C2B3A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 0,
  },
  bookAuthor: {
    color: '#7A8A9A',
    fontSize: 11,
    marginBottom: 4,
    marginTop: 0,
  },
  bookGenre: {
    color: '#C8873A',
    fontSize: 10,
    marginBottom: 8,
    marginTop: 0,
  },
  badgeRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 'auto',
  },
  badge: {
    borderRadius: 10,
    padding: '3px 8px',
  },
  badgeAvailable: {
    backgroundColor: '#E8F5EE',
  },
  badgeBorrowed: {
    backgroundColor: '#FCE8E8',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    margin: 0,
  },
  badgeTextAvailable: {
    color: '#2D7A4F',
  },
  badgeTextBorrowed: {
    color: '#C84040',
  },
  emptyContainer: {
    marginTop: 40,
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#E0E6ED',
    fontSize: 14,
    margin: 0,
  },
  errorText: {
    color: '#FF4D4F',
    textAlign: 'center',
    marginBottom: 8,
  },
};
