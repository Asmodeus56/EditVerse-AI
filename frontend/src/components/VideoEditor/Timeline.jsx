import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Scissors, SplitSquareHorizontal, Trash2, RotateCcw, RotateCw, ZoomIn, ZoomOut, Grid3x3 } from 'lucide-react';

export default function Timeline({ 
  clips, 
  musicTracks, 
  currentTime, 
  duration, 
  onTimeChange, 
  selectedClip, 
  onSelectClip,
  hasVideo,
  isDraggingPlayhead,
  onDraggingChange,
  onSeek,
  isPlaying,
  onPlayPause,
  onCut,
  onDelete,
  onTrim,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  videoRef,
  videoSrc,
  appliedTransition
}) {
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const tracksContainerRef = useRef(null);
  const [frameThumbnails, setFrameThumbnails] = useState([]); // Array of data URLs

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  // Handle mouse wheel for horizontal scrolling
  useEffect(() => {
    const container = tracksContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Prevent default scroll behavior
      e.preventDefault();
      // Scroll horizontally instead
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Extract video frame thumbnails
  useEffect(() => {
    if (!videoSrc || !hasVideo || !duration || duration <= 0) return;

    const extractFrames = async () => {
      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.preload = 'auto';

        // Use blob URL if it's a blob, otherwise direct
        video.src = videoSrc;

        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve;
          video.onerror = reject;
          setTimeout(reject, 10000); // timeout after 10s
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const thumbWidth = 120;
        const thumbHeight = 68;
        canvas.width = thumbWidth;
        canvas.height = thumbHeight;

        const numFrames = 16;
        const frames = [];
        const videoDuration = video.duration || duration;

        for (let i = 0; i < numFrames; i++) {
          const time = (i / numFrames) * videoDuration + 0.1; // slight offset
          video.currentTime = Math.min(time, videoDuration - 0.1);
          await new Promise(resolve => {
            video.onseeked = resolve;
            setTimeout(resolve, 500);
          });
          ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);
          try {
            frames.push(canvas.toDataURL('image/jpeg', 0.5));
          } catch (e) {
            // CORS issue - use a colored placeholder
            frames.push(null);
          }
        }

        setFrameThumbnails(frames);
        video.remove();
      } catch (err) {
        console.warn('Could not extract video frames:', err);
        setFrameThumbnails([]);
      }
    };

    extractFrames();
  }, [videoSrc, hasVideo, duration]);

  const updateTimeFromMousePosition = (clientX) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      onTimeChange(newTime);
      if (onSeek) {
        onSeek(newTime);
      }
    }
  };

  const updateTimeFromRulerClick = (clientX) => {
    const container = tracksContainerRef.current;
    if (!container || !timelineRef.current) return;
    
    const containerRect = container.getBoundingClientRect();
    const timelineRect = timelineRef.current.getBoundingClientRect();
    
    // Account for scroll position
    const scrollLeft = container.scrollLeft;
    const clickX = clientX - containerRect.left + scrollLeft;
    const timelineWidth = timelineRect.width;
    
    const percentage = Math.max(0, Math.min(clickX / timelineWidth, 1));
    const newTime = percentage * duration;
    onTimeChange(newTime);
    if (onSeek) {
      onSeek(newTime);
    }
  };

  const handleTimelineClick = (e) => {
    if (!isDragging) {
      updateTimeFromMousePosition(e.clientX);
    }
  };

  const handleRulerClick = (e) => {
    updateTimeFromRulerClick(e.clientX);
  };

  const handlePlayheadMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    onDraggingChange(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        updateTimeFromMousePosition(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDraggingChange(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration, onDraggingChange]);

  const generateTimeMarkers = (duration) => {
    const markers = [];
    const numMarkers = 11;
    const interval = duration / (numMarkers - 1);
    
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      if (mins > 0) {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }
      return `${secs}s`;
    };
    
    for (let i = 0; i < numMarkers; i++) {
      const time = i * interval;
      const position = (i / (numMarkers - 1)) * 100;
      
      markers.push(
        <div 
          key={i} 
          style={{
            ...styles.timeMarker,
            left: `${position}%`,
          }}
        >
          <div style={styles.timeMarkerLine} />
          <div style={styles.timeMarkerLabel}>{formatTime(time)}</div>
        </div>
      );
    }
    return markers;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatTimeDetail = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <button 
            style={{
              ...styles.toolButton, 
              background: snapToGrid ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : '#27272a'
            }} 
            onClick={() => setSnapToGrid(!snapToGrid)}
            disabled={!hasVideo}
            title="Snap to Grid"
          >
            <Grid3x3 size={14} />
          </button>
          
          <div style={styles.separator} />
          
          <button 
            style={styles.toolButton} 
            onClick={onCut}
            disabled={!hasVideo || !selectedClip}
            title="Cut"
          >
            <Scissors size={14} />
          </button>
          <button 
            style={styles.toolButton}
            onClick={onTrim}
            disabled={!hasVideo || !selectedClip}
            title="Trim"
          >
            <SplitSquareHorizontal size={14} />
          </button>
          <button 
            style={styles.toolButton}
            onClick={onDelete}
            disabled={!hasVideo || !selectedClip}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          
          <div style={styles.separator} />
          
          <button 
            style={{...styles.toolButton, opacity: (canUndo && hasVideo) ? 1 : 0.5}} 
            onClick={onUndo}
            disabled={!canUndo || !hasVideo}
            title="Undo"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            style={{...styles.toolButton, opacity: (canRedo && hasVideo) ? 1 : 0.5}} 
            onClick={onRedo}
            disabled={!canRedo || !hasVideo}
            title="Redo"
          >
            <RotateCw size={14} />
          </button>
        </div>
        
        <div style={styles.toolbarRight}>
          <div style={styles.timeDisplay}>
            {formatTime(currentTime)} / {formatTimeDetail(duration)}
          </div>
          <div style={styles.zoomControl}>
            <button 
              style={styles.zoomButton}
              onClick={handleZoomOut}
            >
              <ZoomOut size={14} />
            </button>
            <span style={styles.zoomLabel}>{zoom}%</span>
            <button 
              style={styles.zoomButton}
              onClick={handleZoomIn}
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      {!hasVideo ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateText}>Upload a video to start editing</div>
        </div>
      ) : (
        <div style={styles.timelineContent}>
          <div style={styles.trackHeader}>
            <div style={styles.trackControls}>
              <div style={styles.trackIcon}>
                <div style={styles.lockIcon}></div>
              </div>
              <div style={styles.trackIcon}>
                <div style={styles.eyeIcon}></div>
              </div>
              <div style={styles.trackIcon}>
                <div style={styles.volumeIcon}></div>
              </div>
            </div>
          </div>

          <div style={styles.tracksContainer} ref={tracksContainerRef}>
            <div style={{...styles.tracksWrapper, width: `${zoom}%`}}>
              <div 
                style={{
                  ...styles.timeRuler, 
                  cursor: 'pointer'
                }} 
                onClick={handleRulerClick}
              >
                {generateTimeMarkers(duration)}
              </div>

              <div 
                style={styles.tracks} 
                ref={timelineRef} 
                onClick={handleTimelineClick}
              >
                {/* Video Track */}
                <div style={styles.track} onClick={handleTimelineClick}>
                  {clips.length > 0 && clips[0].name && (
                    <div style={styles.trackLabel}>
                      <div style={styles.trackLabelBg}>
                        {clips[0].name}
                      </div>
                    </div>
                  )}
                  {clips.map((clip) => (
                    <div
                      key={clip.id}
                      style={{
                        ...styles.clip,
                        left: `${(clip.start / duration) * 100}%`,
                        width: `${((clip.end - clip.start) / duration) * 100}%`,
                        background: selectedClip === clip.id 
                          ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' 
                          : '#3f3f46',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClip(clip.id);
                      }}
                    >
                      <div style={styles.clipThumbnails}>
                        {[...Array(16)].map((_, i) => (
                          <div key={i} style={
                            frameThumbnails[i] ? {
                              flex: 1,
                              backgroundImage: `url(${frameThumbnails[i]})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              minWidth: 0,
                            } : styles.clipThumbnail
                          }></div>
                        ))}
                      </div>
                      {/* Transition indicator badge */}
                      {appliedTransition && appliedTransition.clipId === clip.id && (
                        <div style={styles.transitionBadge}>
                          ✦ {appliedTransition.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Audio Track */}
                <div style={styles.audioTrack} onClick={handleTimelineClick}>
                  {musicTracks.length > 0 && (
                    <div style={styles.trackLabel}>
                      <div style={{...styles.trackLabelBg, background: '#1e3a8a'}}>
                        {musicTracks[0].name}
                      </div>
                    </div>
                  )}
                  {musicTracks.map((track) => (
                    <div
                      key={track.id}
                      style={{
                        ...styles.clip,
                        ...styles.audioClip,
                        left: `${(track.start / duration) * 100}%`,
                        width: `${((track.end - track.start) / duration) * 100}%`,
                      }}
                    >
                      <div style={styles.waveform}>
                        {[...Array(50)].map((_, i) => (
                          <div 
                            key={i} 
                            style={{
                              ...styles.waveformBar,
                              height: `${30 + Math.random() * 70}%`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Playhead */}
                <div 
                  style={{
                    ...styles.playhead,
                    left: `${(currentTime / duration) * 100}%`,
                  }}
                  onMouseDown={handlePlayheadMouseDown}
                >
                  <div style={styles.playheadHandle} />
                  <div style={styles.playheadLine} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: '240px',
    background: '#18181b',
    borderTop: '1px solid #27272a',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
  },
  toolbar: {
    height: '48px',
    background: '#0f0f14',
    borderBottom: '1px solid #27272a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    gap: '12px',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  toolButton: {
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
  playButton: {
    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
  },
  separator: {
    width: '1px',
    height: '20px',
    background: '#27272a',
  },
  timeDisplay: {
    color: '#a1a1aa',
    fontSize: '13px',
    fontFamily: 'monospace',
    fontVariantNumeric: 'tabular-nums',
  },
  zoomControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#27272a',
    borderRadius: '6px',
    padding: '4px 8px',
  },
  zoomButton: {
    width: '20px',
    height: '20px',
    border: 'none',
    background: 'transparent',
    color: '#e4e4e7',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLabel: {
    color: '#a1a1aa',
    fontSize: '12px',
    minWidth: '40px',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f14',
  },
  emptyStateText: {
    color: '#71717a',
    fontSize: '14px',
  },
  timelineContent: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  trackHeader: {
    width: '60px',
    background: '#0f0f14',
    borderRight: '1px solid #27272a',
    display: 'flex',
    flexDirection: 'column',
  },
  trackControls: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  trackIcon: {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#18181b',
    borderBottom: '1px solid #27272a',
  },
  lockIcon: {
    width: '14px',
    height: '14px',
    border: '2px solid #52525b',
    borderRadius: '3px',
  },
  eyeIcon: {
    width: '16px',
    height: '10px',
    border: '2px solid #52525b',
    borderRadius: '50%',
  },
  volumeIcon: {
    width: '0',
    height: '0',
    borderLeft: '6px solid #52525b',
    borderTop: '4px solid transparent',
    borderBottom: '4px solid transparent',
  },
  tracksContainer: {
    flex: 1,
    position: 'relative',
    overflowX: 'scroll',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    scrollbarWidth: 'thin',
    scrollbarColor: '#3f3f46 #18181b',
  },
  tracksWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  timeRuler: {
    height: '32px',
    background: '#0f0f14',
    borderBottom: '1px solid #27272a',
    position: 'relative',
    flexShrink: 0,
  },
  timeMarker: {
    position: 'absolute',
    top: 0,
  },
  timeMarkerLine: {
    position: 'absolute',
    left: 0,
    top: '16px',
    width: '1px',
    height: '16px',
    background: '#3f3f46',
  },
  timeMarkerLabel: {
    position: 'absolute',
    left: '4px',
    top: '4px',
    fontSize: '10px',
    color: '#71717a',
    whiteSpace: 'nowrap',
  },
  tracks: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  track: {
    height: '60px',
    position: 'relative',
    background: '#0f0f14',
    borderBottom: '1px solid #27272a',
  },
  audioTrack: {
    height: '60px',
    position: 'relative',
    background: '#0f0f14',
  },
  trackLabel: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 1,
    maxWidth: '90%',
  },
  trackLabelBg: {
    background: '#1e40af',
    color: 'white',
    fontSize: '10px',
    padding: '4px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  clip: {
    position: 'absolute',
    top: '8px',
    height: '44px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 2,
    overflow: 'hidden',
  },
  clipThumbnails: {
    display: 'flex',
    height: '100%',
    gap: '0px',
  },
  clipThumbnail: {
    flex: 1,
    background: 'linear-gradient(135deg, #52525b 0%, #3f3f46 100%)',
    minWidth: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  transitionBadge: {
    position: 'absolute',
    bottom: '2px',
    right: '4px',
    padding: '1px 6px',
    background: 'rgba(139, 92, 246, 0.9)',
    borderRadius: '3px',
    fontSize: '9px',
    color: 'white',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    zIndex: 3,
  },
  audioClip: {
    background: '#1e40af',
  },
  waveform: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    gap: '1px',
    padding: '0 4px',
  },
  waveformBar: {
    flex: 1,
    background: '#60a5fa',
    borderRadius: '1px',
    minWidth: '2px',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '2px',
    cursor: 'ew-resize',
    zIndex: 100,
    pointerEvents: 'auto',
  },
  playheadHandle: {
    position: 'absolute',
    top: '-6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '14px',
    height: '14px',
    background: '#2563eb',
    borderRadius: '2px',
    border: '2px solid white',
    cursor: 'ew-resize',
  },
  playheadLine: {
    width: '2px',
    height: '100%',
    background: '#2563eb',
    boxShadow: '0 0 8px rgba(37, 99, 235, 0.8)',
  },
};