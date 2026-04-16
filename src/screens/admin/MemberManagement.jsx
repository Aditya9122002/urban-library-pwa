import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const MemberManagement = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    flat_number: '',
    member_name: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('flat_number');
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      window.alert('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((m) =>
    m.flat_number?.toLowerCase().includes(search.toLowerCase()) ||
    m.member_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = async () => {
    if (!form.flat_number.trim()) {
      window.alert('Flat number is required');
      return;
    }
    if (!form.password.trim()) {
      window.alert('Password is required');
      return;
    }
    try {
      const flatClean = form.flat_number
        .toLowerCase()
        .replace(/-/g, '')
        .replace(/\s/g, '');
      const email = `${flatClean}@urbanlibrary.com`;

      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email,
          password: form.password,
        });

      if (authError) throw authError;

      const { error: memberError } = await supabase
        .from('members')
        .insert({
          flat_number: form.flat_number.toUpperCase(),
          member_name: form.member_name,
          phone: form.phone,
          role: 'member',
          is_active: true,
          auth_user_id: authData.user?.id,
        });

      if (memberError) throw memberError;

      window.alert(`Member ${form.flat_number} added successfully!\nPassword: ${form.password}`);
      setModalVisible(false);
      setForm({ flat_number: '', member_name: '', phone: '', password: '' });
      fetchMembers();
    } catch (err) {
      window.alert(err.message || 'Failed to add member');
    }
  };

  const handleToggleActive = async (member) => {
    const newStatus = !member.is_active;
    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} flat ${member.flat_number}?`
    );
    if (!confirmed) return;
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: newStatus })
        .eq('id', member.id);
      if (error) throw error;
      fetchMembers();
    } catch (err) {
      window.alert('Failed to update member');
    }
  };

  const renderMember = (item) => (
    <li key={item.id} style={styles.card}>
      <div style={styles.cardLeft}>
        <div style={styles.avatarCircle}>
          <p style={styles.avatarText}>
            {item.flat_number?.charAt(0) || '?'}
          </p>
        </div>
      </div>
      <div style={styles.cardContent}>
        <p style={styles.flatNumber}>{item.flat_number}</p>
        <p style={styles.memberName}>
          {item.member_name || 'No name set'}
        </p>
        {item.phone ? (
          <p style={styles.phone}>📞 {item.phone}</p>
        ) : null}
        <div
          style={{
            ...styles.badge,
            ...(item.is_active ? styles.badgeActive : styles.badgeInactive),
          }}
        >
          <p
            style={{
              ...styles.badgeText,
              ...(item.is_active ? styles.badgeTextActive : styles.badgeTextInactive),
            }}
          >
            {item.is_active ? '✓ Active' : '✗ Inactive'}
          </p>
        </div>
      </div>
      <button
        type="button"
        style={{
          ...styles.toggleButton,
          ...(item.is_active ? styles.toggleDeactivate : styles.toggleActivate),
        }}
        onClick={() => handleToggleActive(item)}
      >
        <p style={styles.toggleButtonText}>
          {item.is_active ? 'Deactivate' : 'Activate'}
        </p>
      </button>
    </li>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          type="button"
          onClick={() => navigation.goBack()}
          style={styles.backButton}
        >
          <p style={styles.backText}>←</p>
        </button>
        <div style={{ flex: 1 }}>
          <p style={styles.headerTitle}>Member Management</p>
          <p style={styles.headerSubtitle}>
            {members.length} total members
          </p>
        </div>
        <button
          type="button"
          style={styles.addButton}
          onClick={() => setModalVisible(true)}
        >
          <p style={styles.addButtonText}>+ Add</p>
        </button>
      </div>

      <div style={styles.searchWrapper}>
        <input
          style={styles.searchInput}
          placeholder="Search by flat number or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={styles.loadingText}>Loading...</p>
      ) : (
        <ul style={styles.listContent}>
          {filteredMembers.length === 0 ? (
            <li style={styles.emptyWrap}>
              <p style={styles.emptyText}>No members found</p>
            </li>
          ) : (
            filteredMembers.map(renderMember)
          )}
        </ul>
      )}

      {modalVisible ? (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div>
              <p style={styles.modalTitle}>Add New Member</p>

              {[
                { key: 'flat_number', label: 'Flat Number * (e.g. A-204)' },
                { key: 'member_name', label: 'Member Name' },
                { key: 'phone', label: 'Phone Number' },
                { key: 'password', label: 'Password *' },
              ].map(({ key, label }) => (
                <div key={key} style={styles.inputGroup}>
                  <p style={styles.inputLabel}>{label}</p>
                  <input
                    style={styles.input}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={`Enter ${label}`}
                    type={key === 'password' ? 'password' : 'text'}
                  />
                </div>
              ))}

              <div style={styles.modalButtons}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setModalVisible(false);
                    setForm({
                      flat_number: '',
                      member_name: '',
                      phone: '',
                      password: '',
                    });
                  }}
                >
                  <p style={styles.cancelButtonText}>Cancel</p>
                </button>
                <button
                  type="button"
                  style={styles.saveButton}
                  onClick={handleAddMember}
                >
                  <p style={styles.saveButtonText}>Add Member</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MemberManagement;

const styles = {
  container: { flex: 1, backgroundColor: '#F0F0F5' },
  header: {
    backgroundColor: '#1C2B3A',
    paddingTop: 50,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 12 },
  backText: { color: '#FFFFFF', fontSize: 22, margin: 0 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#B0B8C0', fontSize: 12, marginTop: 2 },
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
  cardLeft: { marginRight: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF0FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E5FA3',
    margin: 0,
  },
  cardContent: { flex: 1 },
  flatNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C2B3A',
    marginBottom: 2,
    marginTop: 0,
  },
  memberName: { fontSize: 13, color: '#555555', marginBottom: 2, marginTop: 0 },
  phone: { fontSize: 11, color: '#888888', marginBottom: 6, marginTop: 0 },
  badge: {
    borderRadius: 8,
    padding: '3px 8px',
    display: 'inline-block',
  },
  badgeActive: { backgroundColor: '#E8F5EE' },
  badgeInactive: { backgroundColor: '#FCE8E8' },
  badgeText: { fontSize: 10, fontWeight: '600', margin: 0 },
  badgeTextActive: { color: '#2D7A4F' },
  badgeTextInactive: { color: '#C84040' },
  toggleButton: {
    borderRadius: 8,
    padding: '8px 10px',
    marginLeft: 8,
    border: 'none',
    cursor: 'pointer',
  },
  toggleDeactivate: { backgroundColor: '#FCE8E8' },
  toggleActivate: { backgroundColor: '#E8F5EE' },
  toggleButtonText: { fontSize: 11, fontWeight: '600', color: '#1C2B3A', margin: 0 },
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
  },
  inputGroup: { marginBottom: 12 },
  inputLabel: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 4,
    fontWeight: '600',
    marginTop: 0,
  },
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