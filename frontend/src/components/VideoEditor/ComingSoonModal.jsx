import React from 'react';
import { X, Rocket, Sparkles } from 'lucide-react';

export default function ComingSoonModal({ isOpen, onClose, featureName }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.iconWrapper}>
          <Rocket size={32} color="#6366f1" />
        </div>
        
        <h2 style={styles.title}>Coming Soon</h2>
        
        <p style={styles.description}>
          Manual controls for <span style={styles.highlight}>{featureName}</span> are currently in development.
        </p>

        <div style={styles.aiBox}>
          <Sparkles size={16} color="#fbbf24" style={{marginRight: '8px'}} />
          <p style={styles.aiText}>
            <strong>Tip:</strong> You can ask the AI to do this for you!<br/>
            <em>"Add text to the top"</em> or <em>"Apply a cinematic filter"</em>
          </p>
        </div>

        <button onClick={onClose} style={styles.button}>
          Got it
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '16px',
    padding: '32px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '12px',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  description: {
    color: '#a1a1aa',
    fontSize: '15px',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  highlight: {
    color: '#6366f1',
    fontWeight: '600',
  },
  aiBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'start',
    textAlign: 'left',
  },
  aiText: {
    color: '#fbbf24',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  button: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '12px 0',
    width: '100%',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  }
};