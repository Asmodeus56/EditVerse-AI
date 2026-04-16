import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function FiltersPanel({ onApplyFilter }) {
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [intensity, setIntensity] = useState(100);

  const filters = [
    { id: 'none', name: 'None', filter: 'none', adjustments: { brightness: 0, contrast: 0, saturation: 0, hue: 0 } },
    { id: 'vivid', name: 'Vivid', filter: 'saturate(150%) contrast(110%)', adjustments: { saturation: 50, contrast: 10 } },
    { id: 'dramatic', name: 'Dramatic', filter: 'contrast(150%) saturate(120%)', adjustments: { contrast: 50, saturation: 20 } },
    { id: 'warm', name: 'Warm', filter: 'sepia(30%) saturate(120%)', adjustments: { temperature: 30, saturation: 20 } },
    { id: 'cool', name: 'Cool', filter: 'hue-rotate(180deg) saturate(110%)', adjustments: { hue: 180, saturation: 10 } },
    { id: 'vintage', name: 'Vintage', filter: 'sepia(60%) contrast(110%)', adjustments: { temperature: 40, contrast: 10, saturation: -20 } },
    { id: 'black-white', name: 'B&W', filter: 'grayscale(100%)', adjustments: { saturation: -100 } },
    { id: 'noir', name: 'Noir', filter: 'grayscale(100%) contrast(150%)', adjustments: { saturation: -100, contrast: 50 } },
    { id: 'faded', name: 'Faded', filter: 'brightness(110%) contrast(90%) saturate(80%)', adjustments: { brightness: 10, contrast: -10, saturation: -20 } },
    { id: 'cold', name: 'Cold', filter: 'brightness(90%) saturate(150%) hue-rotate(200deg)', adjustments: { brightness: -10, saturation: 50, hue: 200 } },
    { id: 'sunset', name: 'Sunset', filter: 'sepia(40%) saturate(150%) hue-rotate(330deg)', adjustments: { temperature: 40, saturation: 50, hue: -30 } },
    { id: 'ocean', name: 'Ocean', filter: 'saturate(120%) hue-rotate(180deg) brightness(105%)', adjustments: { saturation: 20, hue: 180, brightness: 5 } },
    { id: 'forest', name: 'Forest', filter: 'saturate(130%) hue-rotate(90deg)', adjustments: { saturation: 30, hue: 90 } },
    { id: 'neon', name: 'Neon', filter: 'saturate(200%) contrast(120%) brightness(110%)', adjustments: { saturation: 100, contrast: 20, brightness: 10 } },
    { id: 'soft', name: 'Soft', filter: 'brightness(105%) contrast(95%) saturate(90%)', adjustments: { brightness: 5, contrast: -5, saturation: -10 } },
    { id: 'harsh', name: 'Harsh', filter: 'contrast(140%) saturate(120%)', adjustments: { contrast: 40, saturation: 20 } },
  ];

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter.id);
    if (onApplyFilter) {
      onApplyFilter({
        ...filter,
        intensity: intensity,
      });
    }
  };

  const getFilterPreviewStyle = (filter) => {
    return {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      filter: filter,
    };
  };

  return (
    <div style={styles.container}>
      {/* Intensity Control */}
      <div style={styles.section}>
        <div style={styles.controlRow}>
          <div style={styles.controlLabel}>Filter Intensity</div>
          <div style={styles.controlValue}>{intensity}%</div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={intensity}
          onChange={(e) => {
            setIntensity(parseInt(e.target.value));
            if (selectedFilter !== 'none') {
              const filter = filters.find(f => f.id === selectedFilter);
              handleFilterSelect(filter);
            }
          }}
          style={styles.slider}
        />
      </div>

      {/* Filters Grid */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Color Filters</div>
        <div style={styles.filtersGrid}>
          {filters.map(filter => (
            <div
              key={filter.id}
              style={{
                ...styles.filterItem,
                ...(selectedFilter === filter.id ? styles.filterItemActive : {})
              }}
              onClick={() => handleFilterSelect(filter)}
            >
              <div style={styles.filterPreview}>
                <div style={getFilterPreviewStyle(filter.filter)} />
                {selectedFilter === filter.id && (
                  <div style={styles.checkmark}>
                    <Check size={16} />
                  </div>
                )}
              </div>
              <div style={styles.filterName}>{filter.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Looks */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Cinematic Looks</div>
        <div style={styles.presetsContainer}>
          {[
            { id: 'blockbuster', name: 'Blockbuster', desc: 'Teal & Orange', filter: 'sepia(30%) saturate(150%) hue-rotate(330deg)', gradient: 'linear-gradient(135deg, #ff6b35 0%, #004e89 100%)', adjustments: { temperature: 30, saturation: 50, hue: -30 } },
            { id: 'dream', name: 'Dream', desc: 'Soft pastels', filter: 'brightness(110%) saturate(80%) contrast(90%)', gradient: 'linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%)', adjustments: { brightness: 10, saturation: -20, contrast: -10 } },
            { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon vibes', filter: 'saturate(200%) contrast(120%) brightness(110%)', gradient: 'linear-gradient(135deg, #ff0080 0%, #7928ca 50%, #00d4ff 100%)', adjustments: { saturation: 100, contrast: 20, brightness: 10 } },
            { id: 'filmnoir', name: 'Film Noir', desc: 'High contrast B&W', filter: 'grayscale(100%) contrast(150%)', gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)', adjustments: { saturation: -100, contrast: 50 } },
          ].map((preset, idx) => (
            <div key={idx} style={styles.presetItem} onClick={() => handleFilterSelect(preset)}>
              <div style={{
                ...styles.presetPreview,
                background: preset.gradient,
              }} />
              <div style={styles.presetInfo}>
                <div style={styles.presetName}>{preset.name}</div>
                <div style={styles.presetDesc}>{preset.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={styles.infoBox}>
        <div style={styles.infoTitle}>💡 Tip</div>
        <div style={styles.infoText}>
          Filters apply to your entire video. Adjust the intensity slider to control the strength of the effect.
        </div>
      </div>
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
  controlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: '13px',
    color: '#a1a1aa',
  },
  controlValue: {
    fontSize: '13px',
    color: '#3b82f6',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    background: '#3f3f46',
    WebkitAppearance: 'none',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  filterItem: {
    cursor: 'pointer',
    border: '2px solid transparent',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  filterItemActive: {
    border: '2px solid #3b82f6',
  },
  filterPreview: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    background: '#27272a',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '6px',
    border: '1px solid #3f3f46',
  },
  checkmark: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '24px',
    height: '24px',
    background: '#3b82f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  filterName: {
    fontSize: '10px',
    color: '#a1a1aa',
    textAlign: 'center',
  },
  presetsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  presetItem: {
    display: 'flex',
    gap: '12px',
    padding: '10px',
    background: '#27272a',
    borderRadius: '8px',
    border: '1px solid #3f3f46',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  presetPreview: {
    width: '60px',
    height: '60px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  presetInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  presetName: {
    fontSize: '13px',
    color: '#e4e4e7',
    fontWeight: '500',
    marginBottom: '4px',
  },
  presetDesc: {
    fontSize: '11px',
    color: '#71717a',
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