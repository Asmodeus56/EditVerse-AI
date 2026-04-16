import React, { useState } from 'react';
import { Film, Music, Type, Sticker, Sparkles, Wand2, Filter, SlidersHorizontal, X } from 'lucide-react';
import MediaPanel from './panels/MediaPanel';
import AudioPanel from './panels/AudioPanel';
import TextPanel from './panels/TextPanel';
import StickersPanel from './panels/StickersPanel';
import EffectsPanel from './panels/EffectsPanel';
import TransitionsPanel from './panels/TransitionsPanel';
import FiltersPanel from './panels/FiltersPanel';
import AdjustmentPanel from './panels/AdjustmentPanel';

export default function SlideOutSidebar({ 
  hasVideo, 
  onAddMedia, 
  onAddMusic,
  onAddText,
  onAddSticker,
  onApplyEffect,
  onApplyTransition,
  onApplyFilter,
  adjustments,
  onAdjustmentChange,
  textOverlays,
  stickers,
  clips,
  onRemoveText,
  onRemoveSticker,
  appliedEffects
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState(false);

  const menuItems = [
    { id: 'media', label: 'Media', icon: Film, component: MediaPanel },
    { id: 'audio', label: 'Audio', icon: Music, component: AudioPanel },
    { id: 'text', label: 'Text', icon: Type, component: TextPanel },
    { id: 'stickers', label: 'Stickers', icon: Sticker, component: StickersPanel },
    { id: 'effects', label: 'Effects', icon: Sparkles, component: EffectsPanel },
    { id: 'transitions', label: 'Transitions', icon: Wand2, component: TransitionsPanel },
    { id: 'filters', label: 'Filters', icon: Filter, component: FiltersPanel },
    { id: 'adjustment', label: 'Adjustment', icon: SlidersHorizontal, component: AdjustmentPanel },
  ];

  const handleMenuClick = (menuId) => {
    if (activePanel === menuId && isOpen) {
      setIsOpen(false);
      setActivePanel(null);
    } else {
      setActivePanel(menuId);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setActivePanel(null);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = e.clientX - 56; // Subtract icon bar width
        if (newWidth >= 280 && newWidth <= 600) {
          setPanelWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const ActivePanelComponent = menuItems.find(item => item.id === activePanel)?.component;

  return (
    <>
      {/* Icon Bar */}
      <div style={styles.iconBar}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              style={{
                ...styles.iconButton,
                ...(isActive ? styles.iconButtonActive : {})
              }}
              onClick={() => handleMenuClick(item.id)}
              title={item.label}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      {/* Slide-out Panel */}
      <div style={{
        ...styles.panel,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        width: panelWidth,
      }}>
        <div style={styles.panelHeader}>
          <div style={styles.panelTitle}>
            {menuItems.find(item => item.id === activePanel)?.label}
          </div>
          <button style={styles.closeButton} onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.panelContent}>
          {ActivePanelComponent && (
            <ActivePanelComponent
              hasVideo={hasVideo}
              onAddMedia={onAddMedia}
              onAddMusic={onAddMusic}
              onAddText={onAddText}
              onAddSticker={onAddSticker}
              onApplyEffect={onApplyEffect}
              onApplyTransition={onApplyTransition}
              onApplyFilter={onApplyFilter}
              adjustments={adjustments}
              onAdjustmentChange={onAdjustmentChange}
              textOverlays={textOverlays}
              stickers={stickers}
              clips={clips}
              onRemoveText={onRemoveText}
              onRemoveSticker={onRemoveSticker}
              appliedEffects={appliedEffects}
            />
          )}
        </div>

        <div 
          style={{
            ...styles.resizeHandle,
            ...(isHoveringHandle ? styles.resizeHandleHover : {})
          }}
          onMouseDown={handleResizeStart}
          onMouseEnter={() => setIsHoveringHandle(true)}
          onMouseLeave={() => setIsHoveringHandle(false)}
        />
      </div>

      {/* Overlay */}
      {isOpen && <div style={styles.overlay} onClick={handleClose} />}
    </>
  );
}

const styles = {
  iconBar: {
    width: '56px',
    background: '#0f0f14',
    borderRight: '1px solid #27272a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 0',
    gap: '4px',
    zIndex: 200,
  },
  iconButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#71717a',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  iconButtonActive: {
    background: '#27272a',
    color: '#3b82f6',
  },
  panel: {
    position: 'absolute',
    left: '56px',
    top: 0,
    bottom: 0,
    width: '320px',
    background: '#18181b',
    borderRight: '1px solid #27272a',
    zIndex: 199,
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #27272a',
  },
  panelTitle: {
    color: '#e4e4e7',
    fontSize: '16px',
    fontWeight: '600',
  },
  closeButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#71717a',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  panelContent: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
  resizeHandle: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '4px',
    cursor: 'ew-resize',
    background: 'transparent',
    transition: 'background 0.2s',
  },
  resizeHandleHover: {
    background: '#3b82f6',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: '376px', // 56px icon bar + 320px panel
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 198,
  },
};