// frontend/src/components/VideoEditor/ExportModal.jsx
import React, { useState } from 'react';
import { X, Download, Check, FileVideo, Film, Smartphone } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, onConfirm, isProcessing }) {
  const [format, setFormat] = useState('mp4');
  const [resolution, setResolution] = useState('1080p');

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Export Video</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Format Selection */}
          <div style={styles.section}>
            <label style={styles.label}>Format</label>
            <div style={styles.grid}>
              <Option 
                icon={<FileVideo size={20}/>} 
                label="MP4" 
                selected={format === 'mp4'} 
                onClick={() => setFormat('mp4')} 
              />
              <Option 
                icon={<Film size={20}/>} 
                label="MOV" 
                selected={format === 'mov'} 
                onClick={() => setFormat('mov')} 
              />
              <Option 
                icon={<Smartphone size={20}/>} 
                label="GIF" 
                selected={format === 'gif'} 
                onClick={() => setFormat('gif')} 
              />
            </div>
          </div>

          {/* Resolution Selection */}
          <div style={styles.section}>
            <label style={styles.label}>Resolution</label>
            <select 
              value={resolution} 
              onChange={(e) => setResolution(e.target.value)}
              style={styles.select}
            >
              <option value="4k">4K Ultra HD (3840x2160)</option>
              <option value="1080p">Full HD (1920x1080)</option>
              <option value="720p">HD (1280x720)</option>
            </select>
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <p>Estimated File Size: <span style={{color: '#fff'}}>~24 MB</span></p>
            <p>Duration: <span style={{color: '#fff'}}>Auto</span></p>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button 
            onClick={() => onConfirm(format, resolution)} 
            disabled={isProcessing}
            style={{
              ...styles.exportBtn,
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? 'wait' : 'pointer'
            }}
          >
            {isProcessing ? 'Downloading...' : (
              <>
                <Download size={18} /> Export Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component for options
const Option = ({ icon, label, selected, onClick }) => (
  <div 
    onClick={onClick} 
    style={{
      ...styles.option,
      borderColor: selected ? '#6366f1' : '#27272a',
      background: selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      color: selected ? '#fff' : '#a1a1aa'
    }}
  >
    {icon}
    <span style={{fontSize: '13px', fontWeight: '500'}}>{label}</span>
    {selected && <div style={styles.check}><Check size={12}/></div>}
  </div>
);

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: '#18181b', width: '90%', maxWidth: '450px',
    borderRadius: '16px', border: '1px solid #27272a',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  header: {
    padding: '20px', borderBottom: '1px solid #27272a',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  title: { color: '#fff', fontSize: '18px', fontWeight: '600', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' },
  body: { padding: '24px' },
  section: { marginBottom: '24px' },
  label: { display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  option: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '16px', border: '1px solid', borderRadius: '8px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
  },
  check: {
    position: 'absolute', top: '6px', right: '6px',
    width: '16px', height: '16px', borderRadius: '50%', background: '#6366f1',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
  },
  select: {
    width: '100%', padding: '12px', background: '#09090b', border: '1px solid #27272a',
    borderRadius: '8px', color: '#fff', outline: 'none'
  },
  summary: {
    padding: '16px', background: '#09090b', borderRadius: '8px',
    display: 'flex', justifyContent: 'space-between', color: '#71717a', fontSize: '13px'
  },
  footer: {
    padding: '20px', borderTop: '1px solid #27272a',
    display: 'flex', justifyContent: 'flex-end', gap: '12px'
  },
  cancelBtn: {
    padding: '10px 20px', background: 'transparent', border: 'none',
    color: '#a1a1aa', fontWeight: '500', cursor: 'pointer'
  },
  exportBtn: {
    padding: '10px 24px', background: '#6366f1', border: 'none',
    borderRadius: '8px', color: '#fff', fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
  }
};