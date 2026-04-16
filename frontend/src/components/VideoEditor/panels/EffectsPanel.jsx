import React, { useState } from 'react';
import { Sparkles, Play } from 'lucide-react';

export default function EffectsPanel({ onApplyEffect, clips = [], appliedEffects = [] }) {
  const isEffectApplied = (effectId) => appliedEffects.some(e => e.id === effectId);

  const effects = [
    { id: 'blur', name: 'Blur', description: 'Add blur effect', intensity: 5 },
    { id: 'grayscale', name: 'Grayscale', description: 'Black and white', intensity: 100 },
    { id: 'sepia', name: 'Sepia', description: 'Vintage sepia tone', intensity: 80 },
    { id: 'invert', name: 'Invert', description: 'Invert colors', intensity: 100 },
    { id: 'brightness', name: 'Brighten', description: 'Increase brightness', intensity: 150 },
    { id: 'contrast', name: 'High Contrast', description: 'Boost contrast', intensity: 150 },
    { id: 'saturate', name: 'Saturate', description: 'Boost saturation', intensity: 200 },
    { id: 'hue', name: 'Hue Rotate', description: 'Shift colors', intensity: 90 },
    { id: 'opacity', name: 'Fade', description: 'Reduce opacity', intensity: 50 },
    { id: 'drop-shadow', name: 'Drop Shadow', description: 'Add shadow effect', intensity: 20 },
  ];

  const animationEffects = [
    { id: 'zoom-in', name: 'Zoom In', icon: '⬆️' },
    { id: 'zoom-out', name: 'Zoom Out', icon: '⬇️' },
    { id: 'pan-left', name: 'Pan Left', icon: '⬅️' },
    { id: 'pan-right', name: 'Pan Right', icon: '➡️' },
    { id: 'rotate', name: 'Rotate', icon: '🔄' },
    { id: 'shake', name: 'Shake', icon: '📳' },
  ];

  const overlayEffects = [
    { id: 'vhs', name: 'VHS', color: '#8b5cf6' },
    { id: 'film-grain', name: 'Film Grain', color: '#6366f1' },
    { id: 'light-leak', name: 'Light Leak', color: '#f59e0b' },
    { id: 'bokeh', name: 'Bokeh', color: '#10b981' },
    { id: 'lens-flare', name: 'Lens Flare', color: '#fbbf24' },
    { id: 'vignette', name: 'Vignette', color: '#71717a' },
  ];

  const handleApplyEffect = (effect) => {
    if (onApplyEffect) {
      onApplyEffect(effect);
    }
  };

  const getEffectPreviewStyle = (effectId) => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };

    switch(effectId) {
      case 'blur':
        return { ...baseStyle, filter: 'blur(3px)' };
      case 'grayscale':
        return { ...baseStyle, filter: 'grayscale(100%)' };
      case 'sepia':
        return { ...baseStyle, filter: 'sepia(80%)' };
      case 'invert':
        return { ...baseStyle, filter: 'invert(100%)' };
      case 'brightness':
        return { ...baseStyle, filter: 'brightness(150%)' };
      case 'contrast':
        return { ...baseStyle, filter: 'contrast(150%)' };
      case 'saturate':
        return { ...baseStyle, filter: 'saturate(200%)' };
      case 'hue':
        return { ...baseStyle, filter: 'hue-rotate(90deg)' };
      case 'opacity':
        return { ...baseStyle, opacity: 0.5 };
      case 'drop-shadow':
        return { ...baseStyle, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={styles.container}>
      {/* Color Effects */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Color & Style Effects</div>
        <div style={styles.effectsGrid}>
          {effects.map(effect => (
            <div
              key={effect.id}
              style={{
                ...styles.effectItem,
                ...(isEffectApplied(effect.id) ? styles.effectItemActive : {})
              }}
              onClick={() => handleApplyEffect(effect)}
            >
              <div style={styles.effectPreview}>
                <div style={getEffectPreviewStyle(effect.id)} />
              </div>
              <div style={styles.effectInfo}>
                <div style={styles.effectName}>{effect.name}</div>
                <div style={styles.effectDesc}>{effect.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animation Effects */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Animation Effects</div>
        <div style={styles.animationsGrid}>
          {animationEffects.map(effect => (
            <div
              key={effect.id}
              style={styles.animationItem}
              onClick={() => handleApplyEffect(effect)}
            >
              <div style={styles.animationIcon}>{effect.icon}</div>
              <div style={styles.animationName}>{effect.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay Effects */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Overlay Effects</div>
        <div style={styles.overlayGrid}>
          {overlayEffects.map(effect => (
            <div
              key={effect.id}
              style={styles.overlayItem}
              onClick={() => handleApplyEffect(effect)}
            >
              <div style={{
                ...styles.overlayPreview,
                background: effect.color,
              }}>
                <Sparkles size={24} style={{ color: 'white', opacity: 0.8 }} />
              </div>
              <div style={styles.overlayName}>{effect.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Applied Effects Info */}
      {clips.length > 0 && (
        <div style={styles.infoBox}>
          <div style={styles.infoTitle}>💡 Tip</div>
          <div style={styles.infoText}>
            Select a clip on the timeline and apply effects to enhance your video.
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
  effectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  effectItem: {
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  effectItemActive: {
    borderColor: '#3b82f6',
    background: '#1e3a8a',
  },
  effectPreview: {
    width: '100%',
    height: '80px',
    overflow: 'hidden',
  },
  effectInfo: {
    padding: '8px',
  },
  effectName: {
    fontSize: '12px',
    color: '#e4e4e7',
    fontWeight: '500',
    marginBottom: '2px',
  },
  effectDesc: {
    fontSize: '10px',
    color: '#71717a',
  },
  animationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  animationItem: {
    padding: '16px 8px',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  animationIcon: {
    fontSize: '28px',
  },
  animationName: {
    fontSize: '11px',
    color: '#a1a1aa',
    textAlign: 'center',
  },
  overlayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  overlayItem: {
    cursor: 'pointer',
  },
  overlayPreview: {
    aspectRatio: '16/9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
    border: '1px solid #3f3f46',
  },
  overlayName: {
    fontSize: '11px',
    color: '#a1a1aa',
    textAlign: 'center',
  },
  infoBox: {
    padding: '12px',
    background: '#27272a',
    borderRadius: '8px',
    border: '1px solid #3f3f46',
  },
  infoTitle: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: '6px',
  },
  infoText: {
    fontSize: '12px',
    color: '#a1a1aa',
    lineHeight: '1.5',
  },
};
