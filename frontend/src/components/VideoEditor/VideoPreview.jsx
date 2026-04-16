import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Upload, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export default function VideoPreview({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onVideoUpload,
  onProjectCreated,
  onDurationChange,
  onTimeUpdate,
  onSeek,
  videoSeekRef,
  videoRef,
  isMuted,
  onToggleMute,
  projectName,
  onProjectNameChange,
  adjustments,
  videoSrc,
  isProcessing,
  textOverlays = [],
  stickers = [],
  appliedEffects = [],
  appliedFilter,
  onUpdateTextPosition,
  onUpdateStickerPosition,
  onRemoveText,
  onRemoveSticker,
  isUploading = false,
}) {
  const [hasVideo, setHasVideo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const internalVideoRef = useRef(null);
  const inputRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Drag state for overlays
  const [draggingOverlay, setDraggingOverlay] = useState(null); // { type: 'text'|'sticker', id, startX, startY, startPosX, startPosY }

  // Expose the video seek function to parent
  useEffect(() => {
    if (videoSeekRef) {
      videoSeekRef.current = (time) => {
        if (internalVideoRef.current) {
          internalVideoRef.current.currentTime = time;
        }
      };
    }
  }, [videoSeekRef]);

  // Sync the parent's videoSrc with this component's internal state
  useEffect(() => {
    if (videoSrc) {
      setVideoUrl(videoSrc);
      setHasVideo(true);
    }
  }, [videoSrc]);

  // Sync video muted state
  useEffect(() => {
    if (internalVideoRef.current) {
      internalVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Build comprehensive CSS filter string
  const getVideoFilters = () => {
    const filters = [];

    // Base adjustments
    if (adjustments.brightness !== 0) filters.push(`brightness(${(100 + adjustments.brightness) / 100})`);
    if (adjustments.contrast !== 0) filters.push(`contrast(${(100 + adjustments.contrast) / 100})`);
    if (adjustments.saturation !== 0) filters.push(`saturate(${(100 + adjustments.saturation) / 100})`);
    if (adjustments.hue !== 0) filters.push(`hue-rotate(${adjustments.hue}deg)`);

    // Temperature - warm = sepia + slight hue shift
    if (adjustments.temperature > 0) {
      filters.push(`sepia(${adjustments.temperature * 0.4}%)`);
    } else if (adjustments.temperature < 0) {
      // Cool = slight blue hue shift
      filters.push(`hue-rotate(${adjustments.temperature * 1.5}deg)`);
    }

    // Highlights & Shadows via brightness
    if (adjustments.highlight !== 0) {
      filters.push(`brightness(${(100 + adjustments.highlight * 0.3) / 100})`);
    }
    if (adjustments.shadows !== 0) {
      filters.push(`brightness(${(100 + adjustments.shadows * 0.2) / 100})`);
    }

    // Sharpness - approximate with contrast
    if (adjustments.sharpness > 0) {
      filters.push(`contrast(${(100 + adjustments.sharpness * 0.3) / 100})`);
    }

    // Tint via hue-rotate
    if (adjustments.tint !== 0) {
      filters.push(`hue-rotate(${adjustments.tint * 0.5}deg)`);
    }

    // Applied effects CSS filters
    appliedEffects.forEach(effect => {
      switch (effect.id) {
        case 'blur': filters.push(`blur(${effect.intensity || 5}px)`); break;
        case 'grayscale': filters.push(`grayscale(${effect.intensity || 100}%)`); break;
        case 'sepia': filters.push(`sepia(${effect.intensity || 80}%)`); break;
        case 'invert': filters.push(`invert(${effect.intensity || 100}%)`); break;
        case 'brightness': filters.push(`brightness(${(effect.intensity || 150) / 100})`); break;
        case 'contrast': filters.push(`contrast(${(effect.intensity || 150) / 100})`); break;
        case 'saturate': filters.push(`saturate(${(effect.intensity || 200) / 100})`); break;
        case 'hue': filters.push(`hue-rotate(${effect.intensity || 90}deg)`); break;
        case 'opacity': filters.push(`opacity(${(effect.intensity || 50) / 100})`); break;
        case 'drop-shadow': filters.push(`drop-shadow(0 10px 20px rgba(0,0,0,0.5))`); break;
        default: break;
      }
    });

    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  const handleFileUpload = (file) => {
    if (file && file.type && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setHasVideo(true);

      // IMPORTANT: pass the *File* to parent so backend upload works
      if (onVideoUpload) onVideoUpload(file);

      const fileName = file.name.replace(/\.[^/.]+$/, '');
      if (onProjectNameChange) onProjectNameChange(fileName);

      if (onProjectCreated) {
        onProjectCreated({
          id: Date.now(),
          name: fileName,
          timestamp: Date.now(),
          clips: 1,
          videoFile: file,
        });
      }
    }
  };

  // Sync video playback with isPlaying state
  useEffect(() => {
    if (internalVideoRef.current) {
      if (isPlaying) {
        internalVideoRef.current.play();
      } else {
        internalVideoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync video currentTime with timeline
  useEffect(() => {
    if (internalVideoRef.current && !isPlaying) {
      internalVideoRef.current.currentTime = currentTime;
    }
  }, [currentTime, isPlaying]);

  const handleLoadedMetadata = () => {
    if (internalVideoRef.current && internalVideoRef.current.duration && onDurationChange) {
      const videoDuration = internalVideoRef.current.duration;
      if (!isNaN(videoDuration) && isFinite(videoDuration)) {
        onDurationChange(videoDuration);
      }
    }
  };

  const handleDurationChange = () => {
    if (internalVideoRef.current && internalVideoRef.current.duration && onDurationChange) {
      const videoDuration = internalVideoRef.current.duration;
      if (!isNaN(videoDuration) && isFinite(videoDuration)) {
        onDurationChange(videoDuration);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      handleFileUpload(file);
    };
    input.click();
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // 30 fps
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (onProjectNameChange) onProjectNameChange(tempName);
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  // --- Overlay Drag Logic ---
  const handleOverlayMouseDown = useCallback((e, type, id) => {
    e.stopPropagation();
    e.preventDefault();
    const container = videoContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const overlays = type === 'text' ? textOverlays : stickers;
    const overlay = overlays.find(o => o.id === id);
    if (!overlay) return;

    setDraggingOverlay({
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: overlay.position.x,
      startPosY: overlay.position.y,
      containerWidth: rect.width,
      containerHeight: rect.height,
    });
  }, [textOverlays, stickers]);

  useEffect(() => {
    if (!draggingOverlay) return;

    const handleMouseMove = (e) => {
      const { type, id, startX, startY, startPosX, startPosY, containerWidth, containerHeight } = draggingOverlay;
      const deltaX = ((e.clientX - startX) / containerWidth) * 100;
      const deltaY = ((e.clientY - startY) / containerHeight) * 100;
      const newX = Math.max(5, Math.min(95, startPosX + deltaX));
      const newY = Math.max(5, Math.min(95, startPosY + deltaY));

      if (type === 'text' && onUpdateTextPosition) {
        onUpdateTextPosition(id, { x: newX, y: newY });
      } else if (type === 'sticker' && onUpdateStickerPosition) {
        onUpdateStickerPosition(id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setDraggingOverlay(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingOverlay, onUpdateTextPosition, onUpdateStickerPosition]);

  // Render text overlay
  const renderTextOverlay = (overlay) => {
    const getTextStyle = () => {
      const base = {
        fontFamily: overlay.font || 'Inter, sans-serif',
        color: overlay.color || '#ffffff',
        fontSize: '24px',
        fontWeight: '600',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      };
      if (overlay.style === 'bold') base.fontWeight = '700';
      if (overlay.style === 'title') { base.fontSize = '36px'; base.fontWeight = '700'; }
      if (overlay.style === 'subtitle') { base.fontSize = '22px'; base.fontWeight = '600'; }
      if (overlay.style === 'outline') {
        base.WebkitTextStroke = '2px white';
        base.color = 'transparent';
      }
      if (overlay.style === 'shadow') {
        base.textShadow = '4px 4px 8px rgba(0,0,0,0.9)';
      }
      // Handle gradient color
      if (typeof overlay.color === 'string' && overlay.color.startsWith('linear-gradient')) {
        base.background = overlay.color;
        base.WebkitBackgroundClip = 'text';
        base.WebkitTextFillColor = 'transparent';
      }
      return base;
    };

    return (
      <div
        key={overlay.id}
        style={{
          position: 'absolute',
          left: `${overlay.position.x}%`,
          top: `${overlay.position.y}%`,
          transform: 'translate(-50%, -50%)',
          cursor: draggingOverlay?.id === overlay.id ? 'grabbing' : 'grab',
          zIndex: 10,
          padding: '6px 14px',
          borderRadius: '6px',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(2px)',
          border: '1px solid rgba(255,255,255,0.15)',
          transition: draggingOverlay?.id === overlay.id ? 'none' : 'left 0.05s, top 0.05s',
        }}
        onMouseDown={(e) => handleOverlayMouseDown(e, 'text', overlay.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (onRemoveText) onRemoveText(overlay.id);
        }}
        title="Drag to move • Double-click to remove"
      >
        <div style={getTextStyle()}>
          {overlay.text}
        </div>
      </div>
    );
  };

  // Render sticker overlay
  const renderStickerOverlay = (sticker) => {
    const getContent = () => {
      if (sticker.emoji) return <span style={{ fontSize: '48px' }}>{sticker.emoji}</span>;
      if (sticker.icon) return <span style={{ fontSize: '42px' }}>{sticker.icon}</span>;
      if (sticker.arrow) return <span style={{ fontSize: '52px', color: '#fff', fontWeight: '700' }}>{sticker.arrow}</span>;
      if (sticker.text) return (
        <span style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          background: sticker.color || '#3b82f6',
        }}>
          {sticker.text}
        </span>
      );
      if (sticker.shape) {
        const size = '50px';
        const shapeStyle = {
          width: size,
          height: size,
          background: sticker.color || '#3b82f6',
          borderRadius: sticker.shape === 'circle' ? '50%' : '4px',
        };
        return <div style={shapeStyle} />;
      }
      return null;
    };

    return (
      <div
        key={sticker.id}
        style={{
          position: 'absolute',
          left: `${sticker.position.x}%`,
          top: `${sticker.position.y}%`,
          transform: 'translate(-50%, -50%)',
          cursor: draggingOverlay?.id === sticker.id ? 'grabbing' : 'grab',
          zIndex: 11,
          transition: draggingOverlay?.id === sticker.id ? 'none' : 'left 0.05s, top 0.05s',
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
        }}
        onMouseDown={(e) => handleOverlayMouseDown(e, 'sticker', sticker.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (onRemoveSticker) onRemoveSticker(sticker.id);
        }}
        title="Drag to move • Double-click to remove"
      >
        {getContent()}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              value={tempName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyPress={handleNameKeyPress}
              style={styles.nameInput}
              autoFocus
            />
          ) : (
            <div
              style={styles.nameLabel}
              onClick={() => setIsEditingName(true)}
            >
              {projectName}
            </div>
          )}
        </div>
        <div style={styles.topRight}>
          <div style={styles.timeDisplay}>
            {formatTime(currentTime)}
          </div>
          <div style={styles.separator}>/</div>
          <div style={styles.timeDisplay}>
            {formatTime(duration)}
          </div>
        </div>
      </div>

      <div style={styles.previewArea}>
        {!hasVideo ? (
          <div
            style={{
              ...styles.uploadArea,
              ...(isDragging ? styles.uploadAreaDragging : {})
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <div style={styles.uploadIcon}>
              <Upload size={48} />
            </div>
            <div style={styles.uploadText}>
              Drag and drop your video here
            </div>
            <div style={styles.uploadSubtext}>
              or click to browse
            </div>
            <div style={styles.uploadFormats}>
              MP4, MOV, AVI, WebM
            </div>
          </div>
        ) : (
          <div style={styles.videoContainer} ref={videoContainerRef}>
            <video
              ref={internalVideoRef}
              src={videoSrc || videoUrl}
              style={{
                ...styles.video,
                filter: getVideoFilters()
              }}
              controls={false}
              onLoadedMetadata={handleLoadedMetadata}
              onDurationChange={handleDurationChange}
              onTimeUpdate={onTimeUpdate}
              crossOrigin="anonymous"
            />

            {/* Vignette Overlay */}
            {adjustments.vignette > 0 && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${adjustments.vignette / 100}) 100%)`,
                pointerEvents: 'none',
                zIndex: 5,
              }} />
            )}

            {/* Text Overlays */}
            {textOverlays.map(overlay => renderTextOverlay(overlay))}

            {/* Sticker Overlays */}
            {stickers.map(sticker => renderStickerOverlay(sticker))}

            {/* Upload Progress Overlay */}
            {isUploading && (
              <div style={styles.uploadingOverlay}>
                <div style={styles.uploadingContent}>
                  <div style={styles.uploadRing}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="url(#uploadGradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray="160" strokeDashoffset="40" style={{ animation: 'uploadSpin 1.4s ease-in-out infinite' }} />
                      <defs>
                        <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={styles.uploadIconInner}>
                      <Upload size={24} />
                    </div>
                  </div>
                  <p style={styles.uploadingText}>Uploading to server</p>
                  <div style={styles.uploadingDots}>
                    <span style={{ ...styles.dot, animationDelay: '0s' }}>•</span>
                    <span style={{ ...styles.dot, animationDelay: '0.2s' }}>•</span>
                    <span style={{ ...styles.dot, animationDelay: '0.4s' }}>•</span>
                  </div>
                  <p style={styles.uploadingSubtext}>
                    Free tier may take ~1 min to connect
                  </p>
                </div>
              </div>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <div style={styles.processingOverlay}>
                <div style={styles.spinner}></div>
                <p style={styles.processingText}>
                  Applying AI Magic...
                </p>
                <p style={styles.processingSubtext}>
                  (This might take 1-2 mins on free server)
                </p>
              </div>
            )}

            <div style={styles.centerButton}>
              <button style={styles.playOverlay} onClick={onPlayPause}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {hasVideo && (
        <div style={styles.controlBar}>
          <div style={styles.controlLeft}>
            <button style={styles.controlButton} onClick={onPlayPause}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button style={styles.controlButton} onClick={onToggleMute}>
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div style={styles.timeInfo}>
              {formatTime(currentTime)}
            </div>
          </div>
          <div style={styles.controlRight}>
            <button style={styles.controlButton} onClick={() => setIsFullscreen(true)}>
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div style={styles.fullscreenOverlay} onClick={() => setIsFullscreen(false)}>
          <div style={styles.fullscreenModal} onClick={(e) => e.stopPropagation()}>
            <video
              src={videoSrc || videoUrl}
              style={{
                ...styles.fullscreenVideo,
                filter: getVideoFilters()
              }}
              controls
              autoPlay={isPlaying}
            />
            <button
              style={styles.closeFullscreen}
              onClick={() => setIsFullscreen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: '#000',
    minHeight: 0,
  },
  topBar: {
    height: '40px',
    background: '#18181b',
    borderBottom: '1px solid #27272a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
  },
  topLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    color: '#a1a1aa',
    fontSize: '13px',
  },
  timeDisplay: {
    color: '#e4e4e7',
    fontSize: '13px',
    fontFamily: 'monospace',
    fontVariantNumeric: 'tabular-nums',
  },
  separator: {
    color: '#52525b',
    fontSize: '13px',
  },
  previewArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    position: 'relative',
    minHeight: 0,
  },
  uploadArea: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    gap: '12px',
  },
  uploadAreaDragging: {
    background: 'rgba(37, 99, 235, 0.1)',
  },
  uploadIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    marginBottom: '8px',
  },
  uploadText: {
    fontSize: '18px',
    color: '#e4e4e7',
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: '14px',
    color: '#71717a',
  },
  uploadFormats: {
    fontSize: '12px',
    color: '#52525b',
    marginTop: '8px',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  video: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  centerButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  playOverlay: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.6)',
    border: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    pointerEvents: 'all',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 55,
    animation: 'uploadGlow 2s ease-in-out infinite',
  },
  uploadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  uploadRing: {
    position: 'relative',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconInner: {
    position: 'absolute',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '0.5px',
  },
  uploadingDots: {
    display: 'flex',
    gap: '6px',
    fontSize: '24px',
    lineHeight: '1',
  },
  dot: {
    color: '#8b5cf6',
    animation: 'dotPulse 1.2s ease-in-out infinite',
    display: 'inline-block',
  },
  uploadingSubtext: {
    color: '#9ca3af',
    fontSize: '13px',
    margin: 0,
    marginTop: '4px',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  spinner: {
    width: '64px',
    height: '64px',
    border: '4px solid transparent',
    borderTop: '4px solid #a855f7',
    borderBottom: '4px solid #a855f7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  processingText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
  },
  processingSubtext: {
    color: '#9ca3af',
    fontSize: '14px',
    marginTop: '8px',
  },
  controlBar: {
    height: '48px',
    background: '#18181b',
    borderTop: '1px solid #27272a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
  },
  controlLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  controlRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  controlButton: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    background: '#27272a',
    color: '#e4e4e7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  timeInfo: {
    color: '#a1a1aa',
    fontSize: '13px',
    fontFamily: 'monospace',
    fontVariantNumeric: 'tabular-nums',
    marginLeft: '4px',
  },
  nameLabel: {
    color: '#e4e4e7',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  nameInput: {
    background: '#27272a',
    border: '1px solid #3b82f6',
    borderRadius: '4px',
    color: '#e4e4e7',
    fontSize: '15px',
    fontWeight: '500',
    padding: '4px 8px',
    outline: 'none',
    minWidth: '200px',
  },
  fullscreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  fullscreenModal: {
    position: 'relative',
    width: '90%',
    height: '90%',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  closeFullscreen: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    fontSize: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    lineHeight: '1',
    padding: 0,
    zIndex: 10,
  },
};

// Add keyframes for spinner and upload animations
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes uploadSpin {
      0% { stroke-dashoffset: 160; transform-origin: center; transform: rotate(0deg); }
      50% { stroke-dashoffset: 40; }
      100% { stroke-dashoffset: 160; transform-origin: center; transform: rotate(360deg); }
    }
    @keyframes dotPulse {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.3); }
    }
    @keyframes uploadGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
      50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.4); }
    }
  `;
  if (!document.querySelector('[data-editverse-spinner]')) {
    styleEl.setAttribute('data-editverse-spinner', '');
    document.head.appendChild(styleEl);
  }
}