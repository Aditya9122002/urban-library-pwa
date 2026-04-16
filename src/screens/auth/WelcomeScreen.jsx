import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 20);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.circle1} />
      <div style={styles.circle2} />
      <div style={styles.circle3} />
      <div style={{ ...styles.content, ...(isVisible ? styles.contentVisible : styles.contentHidden) }}>
        <div style={styles.logoContainer}><p style={styles.logoEmoji}>📚</p></div>
        <p style={styles.appName}>Urban Library</p>
        <p style={styles.tagline}>Your Society's Digital Library</p>
        <div style={styles.divider} />
        <p style={styles.welcomeMessage}>Welcome to a smarter way to<br />discover, borrow and enjoy<br />books from our society library.</p>
        <div style={styles.featuresContainer}>
          {[['🔍','Browse 700+ books instantly'],['✅','Borrow with one tap'],['📅','Track due dates easily'],['🏠','Made for our society']].map(([icon, text]) => (
            <div key={text} style={styles.featureRow}>
              <p style={styles.featureIcon}>{icon}</p>
              <p style={styles.featureText}>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...styles.bottomContainer, ...(isVisible ? styles.bottomVisible : styles.bottomHidden) }}>
        <button type="button" style={styles.loginButton} onClick={() => navigate('/login')}>
          <p style={styles.loginButtonText}>Login to Your Account</p>
        </button>
        <button type="button" style={styles.registerButton} onClick={() => navigate('/register')}>
          <p style={styles.registerButtonText}>New Member? Register Here</p>
        </button>
        <p style={styles.footerText}>Urban Library — Society Library Management</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1C2B3A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 40, paddingLeft: 24, paddingRight: 24, position: 'relative', overflow: 'hidden' },
  circle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#2D7A4F', opacity: 0.08, top: -80, right: -80 },
  circle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#2E5FA3', opacity: 0.08, bottom: 100, left: -60 },
  circle3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#C8873A', opacity: 0.06, top: 200, right: -40 },
  content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'opacity 900ms ease, transform 900ms ease' },
  contentHidden: { opacity: 0, transform: 'translateY(50px) scale(0.8)' },
  contentVisible: { opacity: 1, transform: 'translateY(0) scale(1)' },
  logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2D7A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 10px rgba(45,122,79,0.4)' },
  logoEmoji: { fontSize: 50, margin: 0 },
  appName: { fontSize: 34, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1, marginBottom: 6, marginTop: 0 },
  tagline: { fontSize: 14, color: '#2D7A4F', fontWeight: '600', letterSpacing: 0.5, marginBottom: 20, marginTop: 0 },
  divider: { width: 60, height: 3, backgroundColor: '#C8873A', borderRadius: 2, marginBottom: 20 },
  welcomeMessage: { fontSize: 15, color: '#B0B8C0', textAlign: 'center', lineHeight: '24px', marginBottom: 28, marginTop: 0 },
  featuresContainer: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  featureRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20, width: 30, margin: 0 },
  featureText: { fontSize: 14, color: '#FFFFFF', fontWeight: '500', margin: 0 },
  bottomContainer: { display: 'flex', flexDirection: 'column', gap: 12, transition: 'opacity 1000ms ease' },
  bottomHidden: { opacity: 0 },
  bottomVisible: { opacity: 1 },
  loginButton: { backgroundColor: '#2D7A4F', borderRadius: 12, padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', width: '100%' },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', margin: 0 },
  registerButton: { backgroundColor: 'transparent', borderRadius: 12, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #2D7A4F', cursor: 'pointer', width: '100%' },
  registerButtonText: { color: '#2D7A4F', fontSize: 15, fontWeight: '600', margin: 0 },
  footerText: { color: '#555555', fontSize: 11, textAlign: 'center', marginTop: 4, marginBottom: 0 },
};