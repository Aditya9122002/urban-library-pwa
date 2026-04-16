import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MemberHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/books');
  }, []);

  return (
    <div style={styles.container}>
      <p style={styles.loadingText}>Loading...</p>
    </div>
  );
};

export default MemberHome;

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1C2B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#FFFFFF', fontSize: 16, margin: 0 },
};