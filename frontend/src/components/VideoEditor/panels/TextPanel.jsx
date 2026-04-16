import React, { useState } from 'react';
import { Type, Plus, AlignLeft, AlignCenter, AlignRight, X } from 'lucide-react';

export default function TextPanel({ onAddText, textOverlays = [], onRemoveText }) {
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [selectedStyle, setSelectedStyle] = useState('default');

  const fonts = [
    'Inter', 'Roboto', 'Montserrat', 'Poppins', 'Playfair Display',
    'Open Sans', 'Lato', 'Oswald', 'Raleway', 'Bebas Neue'
  ];

  const textStyles = [
    { id: 'default', name: 'Default', preview: 'Aa' },
    { id: 'bold', name: 'Bold', preview: 'Aa', style: { fontWeight: '700' } },
    { id: 'title', name: 'Title', preview: 'Aa', style: { fontSize: '24px', fontWeight: '700' } },
    { id: 'subtitle', name: 'Subtitle', preview: 'Aa', style: { fontSize: '18px', fontWeight: '600' } },
    { id: 'outline', name: 'Outline', preview: 'Aa', style: { WebkitTextStroke: '2px white', color: 'transparent' } },
    { id: 'shadow', name: 'Shadow', preview: 'Aa', style: { textShadow: '3px 3px 6px rgba(0,0,0,0.8)' } },
  ];

  const textTemplates = [
    { id: 1, text: 'SUBSCRIBE', style: 'gradient', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 2, text: 'LIKE & SHARE', style: 'gradient', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 3, text: 'NEW', style: 'solid', color: '#ef4444' },
    { id: 4, text: 'TRENDING', style: 'solid', color: '#f59e0b' },
    { id: 5, text: 'EXCLUSIVE', style: 'gradient', color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
    { id: 6, text: 'LIMITED TIME', style: 'gradient', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  ];

  const colors = [
    '#ffffff', '#000000', '#ef4444', '#f59e0b', '#10b981',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
  ];

  const handleAddText = (template) => {
    if (onAddText) {
      onAddText({
        text: template?.text || 'Your Text Here',
        font: selectedFont,
        style: template?.style || selectedStyle,
        color: template?.color || '#ffffff',
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* Quick Add */}
      <div style={styles.section}>
        <button style={styles.addButton} onClick={() => handleAddText()}>
          <Plus size={18} />
          Add Text Layer
        </button>
      </div>

      {/* Text Templates */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Templates</div>
        <div style={styles.templatesGrid}>
          {textTemplates.map(template => (
            <div 
              key={template.id} 
              style={styles.templateItem}
              onClick={() => handleAddText(template)}
            >
              <div style={{
                ...styles.templatePreview,
                background: template.style === 'gradient' ? template.color : template.color,
              }}>
                <div style={{
                  ...styles.templateText,
                  ...(template.style === 'gradient' ? {
                    background: template.color,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  } : {
                    color: 'white'
                  })
                }}>
                  {template.text}
                </div>
              </div>
              <button style={styles.templateAddButton}>
                <Plus size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Font Selection */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Font Family</div>
        <div style={styles.fontList}>
          {fonts.map(font => (
            <button
              key={font}
              style={{
                ...styles.fontItem,
                ...(selectedFont === font ? styles.fontItemActive : {})
              }}
              onClick={() => setSelectedFont(font)}
            >
              <span style={{ fontFamily: font }}>{font}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text Styles */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Text Styles</div>
        <div style={styles.stylesGrid}>
          {textStyles.map(style => (
            <div
              key={style.id}
              style={{
                ...styles.styleItem,
                ...(selectedStyle === style.id ? styles.styleItemActive : {})
              }}
              onClick={() => setSelectedStyle(style.id)}
            >
              <div style={{ ...styles.stylePreview, ...style.style }}>
                {style.preview}
              </div>
              <div style={styles.styleName}>{style.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Text Color</div>
        <div style={styles.colorGrid}>
          {colors.map(color => (
            <button
              key={color}
              style={{
                ...styles.colorButton,
                background: color,
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Alignment</div>
        <div style={styles.alignmentButtons}>
          <button style={styles.alignButton}>
            <AlignLeft size={18} />
          </button>
          <button style={{...styles.alignButton, ...styles.alignButtonActive}}>
            <AlignCenter size={18} />
          </button>
          <button style={styles.alignButton}>
            <AlignRight size={18} />
          </button>
        </div>
      </div>

      {/* Active Text Overlays */}
      {textOverlays.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Active Text Layers ({textOverlays.length})</div>
          <div style={styles.overlayList}>
            {textOverlays.map((overlay, idx) => (
              <div key={idx} style={styles.overlayItem}>
                <Type size={16} style={{ color: '#3b82f6' }} />
                <div style={styles.overlayText}>{overlay.text}</div>
                <button 
                  style={styles.removeButton}
                  onClick={() => onRemoveText && onRemoveText(overlay.id)}
                  title="Remove text"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    color: '#e4e4e7',
    fontSize: '14px',
    fontWeight: '600',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  templatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  templateItem: {
    position: 'relative',
    cursor: 'pointer',
  },
  templatePreview: {
    aspectRatio: '16/9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #3f3f46',
    padding: '8px',
  },
  templateText: {
    fontSize: '14px',
    fontWeight: '700',
    textAlign: 'center',
  },
  templateAddButton: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '24px',
    height: '24px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  fontList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '200px',
    overflow: 'auto',
  },
  fontItem: {
    padding: '10px 12px',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    color: '#e4e4e7',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  fontItemActive: {
    background: '#3b82f6',
    border: '1px solid #3b82f6',
  },
  stylesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  styleItem: {
    padding: '12px',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  styleItemActive: {
    border: '1px solid #3b82f6',
    background: '#1e3a8a',
  },
  stylePreview: {
    fontSize: '24px',
    color: '#e4e4e7',
    marginBottom: '4px',
  },
  styleName: {
    fontSize: '10px',
    color: '#a1a1aa',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  colorButton: {
    aspectRatio: '1',
    border: '2px solid #3f3f46',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  alignmentButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  alignButton: {
    padding: '10px',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    color: '#a1a1aa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  alignButtonActive: {
    background: '#3b82f6',
    border: '1px solid #3b82f6',
    color: 'white',
  },
  overlayList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  overlayItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: '#27272a',
    borderRadius: '6px',
    border: '1px solid #3f3f46',
  },
  overlayText: {
    flex: 1,
    fontSize: '12px',
    color: '#e4e4e7',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  removeButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid #52525b',
    borderRadius: '4px',
    color: '#ef4444',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
};