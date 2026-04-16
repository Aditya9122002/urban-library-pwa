import { useNavigate, useLocation } from 'react-router-dom';

const memberTabs = [
  { label: 'Books', icon: '📚', path: '/books' },
  { label: 'My Books', icon: '📖', path: '/mybooks' },
  { label: 'Profile', icon: '👤', path: '/profile' },
];

const adminTabs = [
  { label: 'Home', icon: '🏠', path: '/admin' },
  { label: 'Books', icon: '📚', path: '/admin/books' },
  { label: 'Members', icon: '👥', path: '/admin/members' },
  { label: 'Borrowed', icon: '📖', path: '/admin/borrowed' },
  { label: 'Overdue', icon: '⚠️', path: '/admin/overdue' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const tabs = isAdmin ? adminTabs : memberTabs;

  return (
    <div style={styles.container}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{ ...styles.tab, ...(isActive ? styles.tabActive : {}) }}
          >
            <span style={styles.icon}>{tab.icon}</span>
            <span style={{ ...styles.label, ...(isActive ? styles.labelActive : {}) }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1C2B3A',
    display: 'flex', flexDirection: 'row',
    borderTop: '1px solid #2E3F50',
    zIndex: 1000,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  tab: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '10px 0', background: 'transparent',
    border: 'none', cursor: 'pointer', gap: 4,
  },
  tabActive: { borderTop: '2px solid #2D7A4F' },
  icon: { fontSize: 20 },
  label: { fontSize: 11, color: '#B0B8C0' },
  labelActive: { color: '#2D7A4F', fontWeight: '700' },
};