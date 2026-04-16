import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';

export default function StickersPanel({ onAddSticker, stickers = [], onRemoveSticker }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Emojis', 'Shapes', 'Arrows', 'Icons', 'Social'];

  const stickerLibrary = {
    'Emojis': [
      { id: 1, emoji: '😀', name: 'Smile' },
      { id: 2, emoji: '😂', name: 'Laughing' },
      { id: 3, emoji: '❤️', name: 'Heart' },
      { id: 4, emoji: '🔥', name: 'Fire' },
      { id: 5, emoji: '⭐', name: 'Star' },
      { id: 6, emoji: '✨', name: 'Sparkles' },
      { id: 7, emoji: '👍', name: 'Thumbs Up' },
      { id: 8, emoji: '🎉', name: 'Party' },
      { id: 9, emoji: '💯', name: '100' },
      { id: 10, emoji: '🚀', name: 'Rocket' },
      { id: 11, emoji: '💪', name: 'Strong' },
      { id: 12, emoji: '🌟', name: 'Glowing Star' },
    ],
    'Shapes': [
      { id: 13, shape: 'circle', color: '#ef4444', name: 'Red Circle' },
      { id: 14, shape: 'square', color: '#3b82f6', name: 'Blue Square' },
      { id: 15, shape: 'triangle', color: '#10b981', name: 'Green Triangle' },
      { id: 16, shape: 'circle', color: '#f59e0b', name: 'Orange Circle' },
      { id: 17, shape: 'square', color: '#8b5cf6', name: 'Purple Square' },
      { id: 18, shape: 'star', color: '#fbbf24', name: 'Yellow Star' },
    ],
    'Arrows': [
      { id: 19, arrow: '→', name: 'Right Arrow' },
      { id: 20, arrow: '←', name: 'Left Arrow' },
      { id: 21, arrow: '↑', name: 'Up Arrow' },
      { id: 22, arrow: '↓', name: 'Down Arrow' },
      { id: 23, arrow: '↗', name: 'Diagonal Right' },
      { id: 24, arrow: '⟳', name: 'Circular' },
    ],
    'Icons': [
      { id: 25, icon: '🎬', name: 'Clapper' },
      { id: 26, icon: '🎵', name: 'Music Note' },
      { id: 27, icon: '📱', name: 'Phone' },
      { id: 28, icon: '💻', name: 'Laptop' },
      { id: 29, icon: '📷', name: 'Camera' },
      { id: 30, icon: '🎮', name: 'Game' },
    ],
    'Social': [
      { id: 31, text: 'LIKE', color: '#3b82f6', name: 'Like' },
      { id: 32, text: 'SUBSCRIBE', color: '#ef4444', name: 'Subscribe' },
      { id: 33, text: 'SHARE', color: '#10b981', name: 'Share' },
      { id: 34, text: 'NEW', color: '#f59e0b', name: 'New' },
      { id: 35, text: 'SALE', color: '#ec4899', name: 'Sale' },
      { id: 36, text: 'HOT', color: '#ef4444', name: 'Hot' },
    ],
  };

  const getAllStickers = () => {
    return Object.values(stickerLibrary).flat();
  };

  const getFilteredStickers = () => {
    let stickers = selectedCategory === 'All' 
      ? getAllStickers() 
      : stickerLibrary[selectedCategory] || [];
    
    if (searchQuery) {
      stickers = stickers.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return stickers;
  };

  const renderSticker = (sticker) => {
    if (sticker.emoji) {
      return <div style={styles.emojiSticker}>{sticker.emoji}</div>;
    }
    if (sticker.icon) {
      return <div style={styles.iconSticker}>{sticker.icon}</div>;
    }
    if (sticker.arrow) {
      return <div style={styles.arrowSticker}>{sticker.arrow}</div>;
    }
    if (sticker.text) {
      return (
        <div style={{
          ...styles.textSticker,
          background: sticker.color,
        }}>
          {sticker.text}
        </div>
      );
    }
    if (sticker.shape === 'circle') {
      return <div style={{...styles.shapeSticker, background: sticker.color, borderRadius: '50%'}} />;
    }
    if (sticker.shape === 'square') {
      return <div style={{...styles.shapeSticker, background: sticker.color}} />;
    }
    if (sticker.shape === 'triangle') {
      return (
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '25px solid transparent',
          borderRight: '25px solid transparent',
          borderBottom: `43px solid ${sticker.color}`,
        }} />
      );
    }
    if (sticker.shape === 'star') {
      return <div style={{...styles.emojiSticker, color: sticker.color}}>★</div>;
    }
    return null;
  };

  return (
    <div style={styles.container}>
      {/* Search */}
      <div style={styles.searchContainer}>
        <Search size={16} style={{ color: '#71717a' }} />
        <input
          type="text"
          placeholder="Search stickers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Categories */}
      <div style={styles.categoriesContainer}>
        {categories.map(category => (
          <button
            key={category}
            style={{
              ...styles.categoryButton,
              ...(selectedCategory === category ? styles.categoryButtonActive : {})
            }}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Stickers Grid */}
      <div style={styles.stickersGrid}>
        {getFilteredStickers().map(sticker => (
          <div
            key={sticker.id}
            style={styles.stickerItem}
            onClick={() => onAddSticker && onAddSticker(sticker)}
          >
            {renderSticker(sticker)}
            <button style={styles.addButton}>
              <Plus size={12} />
            </button>
          </div>
        ))}
      </div>

      {getFilteredStickers().length === 0 && (
        <div style={styles.emptyState}>
          No stickers found
        </div>
      )}

      {/* Active Stickers */}
      {stickers.length > 0 && (
        <div style={styles.activeSection}>
          <div style={styles.sectionTitle}>Active Stickers ({stickers.length})</div>
          <div style={styles.activeList}>
            {stickers.map((sticker, idx) => (
              <div key={idx} style={styles.activeItem}>
                <div style={styles.activeThumbnail}>
                  {renderSticker(sticker)}
                </div>
                <div style={styles.activeName}>{sticker.name}</div>
                <button
                  style={styles.removeButton}
                  onClick={() => onRemoveSticker && onRemoveSticker(sticker.id)}
                  title="Remove sticker"
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
    gap: '16px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    background: '#27272a',
    borderRadius: '8px',
    border: '1px solid #3f3f46',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e4e4e7',
    fontSize: '13px',
  },
  categoriesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  categoryButton: {
    padding: '6px 12px',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    color: '#a1a1aa',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryButtonActive: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white',
  },
  stickersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  stickerItem: {
    position: 'relative',
    aspectRatio: '1',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emojiSticker: {
    fontSize: '32px',
  },
  iconSticker: {
    fontSize: '28px',
  },
  arrowSticker: {
    fontSize: '36px',
    color: '#e4e4e7',
    fontWeight: '700',
  },
  textSticker: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '4px',
  },
  shapeSticker: {
    width: '50px',
    height: '50px',
    borderRadius: '4px',
  },
  addButton: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '20px',
    height: '20px',
    background: 'rgba(59, 130, 246, 0.9)',
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
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#71717a',
    fontSize: '13px',
  },
  activeSection: {
    borderTop: '1px solid #27272a',
    paddingTop: '16px',
  },
  sectionTitle: {
    color: '#e4e4e7',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  activeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  activeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    background: '#27272a',
    borderRadius: '6px',
    border: '1px solid #3f3f46',
  },
  activeThumbnail: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  activeName: {
    flex: 1,
    fontSize: '12px',
    color: '#e4e4e7',
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
