import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/UI/Header';
import VideoPreview from '../components/VideoEditor/VideoPreview';
import SlideOutSidebar from '../components/VideoEditor/SlideOutSidebar';
import RightSidebar from '../components/VideoEditor/RightSidebar';
import Timeline from '../components/VideoEditor/Timeline';
import ExportModal from '../components/VideoEditor/ExportModal'; // Adjust path if needed
import ComingSoonModal from '../components/VideoEditor/ComingSoonModal';
import { useSearchParams } from 'react-router-dom'; // <--- Add this
import axios from 'axios';
import { API_BASE_URL } from '../config'; // Adjust path as needed (e.g. '../../config')
const API_URL = API_BASE_URL;

const EditorPage = () => {
    const [searchParams] = useSearchParams();
    const [hasVideo, setHasVideo] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [selectedClip, setSelectedClip] = useState(null);
    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [projectName, setProjectName] = useState('Untitled Project');
    const [activeLeftTab, setActiveLeftTab] = useState('transitions');
    const [jobId, setJobId] = useState(null);       // To track the job ID from backend
    const [videoSrc, setVideoSrc] = useState(null); // To store the server URL of the video
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    // Inside your component
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const videoSeekRef = useRef(null);
    const videoRef = useRef(null);

    const [clips, setClips] = useState([]);
    const [musicTracks, setMusicTracks] = useState([]);

    // New states for text and stickers
    const [textOverlays, setTextOverlays] = useState([]);
    const [stickers, setStickers] = useState([]);

    // Effects and filters states
    const [appliedEffects, setAppliedEffects] = useState([]);
    const [appliedTransition, setAppliedTransition] = useState(null);
    const [appliedFilter, setAppliedFilter] = useState(null);

    // Adjustment states
    const [adjustments, setAdjustments] = useState({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        highlight: 0,
        shadows: 0,
        temperature: 0,
        tint: 0,
        sharpness: 0,
        vignette: 0,
    });

    const [history, setHistory] = useState([{ clips: [], musicTracks: [] }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);

    // When video duration becomes known, update clips that have end=0
    useEffect(() => {
        if (duration > 0 && clips.length > 0 && clips.some(c => c.end === 0)) {
            setClips(prev => prev.map(c => c.end === 0 ? { ...c, end: duration } : c));
        }
    }, [duration]);

    // --- COMING SOON STATE ---
    const [comingSoonData, setComingSoonData] = useState({ open: false, feature: '' });

    // Refs for keyboard handler (avoids stale closures)
    const clipsRef = useRef(clips);
    const selectedClipRef = useRef(selectedClip);
    useEffect(() => { clipsRef.current = clips; }, [clips]);
    useEffect(() => { selectedClipRef.current = selectedClip; }, [selectedClip]);

    // Keyboard shortcuts: Space = play/pause, Delete/Backspace = delete clip
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if typing in an input or textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === 'Space') {
                e.preventDefault();
                setIsPlaying(prev => !prev);
            } else if (e.code === 'Delete' || e.code === 'Backspace') {
                e.preventDefault();
                // Use refs for fresh state
                const currentClips = clipsRef.current;
                const currentSelected = selectedClipRef.current;

                if (currentSelected) {
                    const newClips = currentClips.filter(c => c.id !== currentSelected);
                    setClips(newClips);
                    saveToHistory(newClips, musicTracks);
                    setSelectedClip(newClips.length > 0 ? newClips[0].id : null);
                    if (newClips.length === 0) {
                        setHasVideo(false);
                        setVideoSrc(null);
                        setDuration(0);
                        setCurrentTime(0);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [musicTracks]);

    // Helper to trigger the modal
    const showComingSoon = (featureName) => {
        setComingSoonData({ open: true, feature: featureName });
    };

    // AI Chat messages
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant. I can help you edit your video, suggest improvements, or answer any questions about Editverse AI features.',
            timestamp: new Date(),
        },
    ]);


    const handleExportConfirm = async (format, resolution) => {
        if (!jobId) return;

        setIsDownloading(true);
        try {
            console.log(`Exporting as ${format} at ${resolution}...`);

            // 1. Fetch Blob from Backend
            const res = await axios.get(`${API_URL}/jobs/${jobId}/download`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            // 2. Create Object URL
            const url = window.URL.createObjectURL(new Blob([res.data]));

            // 3. Create invisible <a> tag and click it
            const link = document.createElement('a');
            link.href = url;
            // Use the format selected in the filename
            const filename = `editverse_${projectName.replace(/\s+/g, '_')}.${format}`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();

            // 4. Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Close modal on success
            setIsExportOpen(false);

            // Optional: Success Message in Chat
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: `Successfully exported ${filename}!`,
                timestamp: new Date()
            }]);

        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };
    const saveToHistory = (newClips, newMusic) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ clips: newClips, musicTracks: newMusic });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            // Don't undo back to empty clips if we have a video loaded
            if (hasVideo && prevState.clips.length === 0) return;
            
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setClips(prevState.clips);
            setMusicTracks(prevState.musicTracks);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setClips(history[newIndex].clips);
            setMusicTracks(history[newIndex].musicTracks);
        }
    };

    const handleCut = () => {
        if (selectedClip) {
            const clipIndex = clips.findIndex(c => c.id === selectedClip);
            if (clipIndex !== -1) {
                const clip = clips[clipIndex];
                const cutTime = currentTime;

                if (cutTime > clip.start && cutTime < clip.end) {
                    const newClips = [...clips];
                    const newClip = {
                        id: Date.now(),
                        name: `${clip.name} (Cut)`,
                        start: cutTime,
                        end: clip.end,
                        file: clip.file,
                    };
                    newClips[clipIndex] = { ...clip, end: cutTime };
                    newClips.splice(clipIndex + 1, 0, newClip);
                    setClips(newClips);
                    saveToHistory(newClips, musicTracks);
                }
            }
        }
    };

    const handleTrim = () => {
        if (selectedClip) {
            const clipIndex = clips.findIndex(c => c.id === selectedClip);
            if (clipIndex !== -1) {
                const newClips = [...clips];
                const clip = newClips[clipIndex];
                // If playhead is within clip, trim end to playhead
                // Otherwise trim 1 second from end
                if (currentTime > clip.start && currentTime < clip.end) {
                    newClips[clipIndex] = { ...clip, end: currentTime };
                } else {
                    newClips[clipIndex] = { ...clip, end: Math.max(clip.start + 0.5, clip.end - 1) };
                }
                setClips(newClips);
                saveToHistory(newClips, musicTracks);
            }
        }
    };

    const handleDelete = () => {
        if (selectedClip) {
            const newClips = clips.filter(c => c.id !== selectedClip);
            setClips(newClips);
            saveToHistory(newClips, musicTracks);
            setSelectedClip(newClips.length > 0 ? newClips[0].id : null);
            if (newClips.length === 0) {
                setHasVideo(false);
                setVideoSrc(null);
                setDuration(0);
                setCurrentTime(0);
            }
        } else if (clips.length > 0) {
            // Auto-select and delete the last clip
            const lastClip = clips[clips.length - 1];
            const newClips = clips.filter(c => c.id !== lastClip.id);
            setClips(newClips);
            saveToHistory(newClips, musicTracks);
            setSelectedClip(newClips.length > 0 ? newClips[0].id : null);
            if (newClips.length === 0) {
                setHasVideo(false);
                setVideoSrc(null);
                setDuration(0);
                setCurrentTime(0);
            }
        }
    };

    const handleAddMusic = (fileFromPanel) => {
        if (!hasVideo) return;

        const addAudioFile = (file) => {
            if (file && (file.type.startsWith('audio/') || file.name)) {
                const newTrack = {
                    id: Date.now(),
                    name: file.name || 'Audio Track',
                    start: 0,
                    end: duration,
                    file: URL.createObjectURL(file),
                };
                const newMusic = [...musicTracks, newTrack];
                setMusicTracks(newMusic);
                saveToHistory(clips, newMusic);
            }
        };

        if (fileFromPanel) {
            addAudioFile(fileFromPanel);
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            addAudioFile(file);
        };
        input.click();
    };

    const handleAddMedia = (fileFromPanel) => {
        const addMediaFile = (file) => {
            if (file && file.type && (file.type.startsWith('video/') || file.type.startsWith('image/'))) {
                const newClip = {
                    id: Date.now(),
                    name: file.name,
                    start: clips.length > 0 ? clips[clips.length - 1].end : 0,
                    end: (clips.length > 0 ? clips[clips.length - 1].end : 0) + 10,
                    file: URL.createObjectURL(file),
                };
                const newClips = [...clips, newClip];
                setClips(newClips);
                saveToHistory(newClips, musicTracks);
                if (!hasVideo) setHasVideo(true);
            }
        };

        if (fileFromPanel) {
            addMediaFile(fileFromPanel);
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*,image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            addMediaFile(file);
        };
        input.click();
    };

    // in EditorPage.jsx — set local state FIRST, then upload to backend in background
    const handleVideoUpload = async (file) => {
        if (!file) return;
        console.log("Processing video...", file.name);

        // 1. IMMEDIATELY set local state so timeline + preview work right away
        const localBlobUrl = URL.createObjectURL(file);
        setHasVideo(true);
        setVideoSrc(localBlobUrl);
        setIsUploading(true); // Show upload loading animation

        const initialClip = {
            id: Date.now(),
            name: file.name,
            start: 0,
            end: 0, // will be updated when video metadata loads
            file: localBlobUrl,
        };
        setClips([initialClip]);
        setSelectedClip(initialClip.id);
        saveToHistory([initialClip], musicTracks);

        // 2. Then try backend upload in background (for AI editing + export)
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("AUTH_MISSING");
            }

            const formData = new FormData();
            formData.append("file", file);

            console.log("Uploading to backend...", `${API_URL}/jobs/upload`);
            const res = await axios.post(`${API_URL}/jobs/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
                timeout: 120000, // 2 minute timeout for large files
            });

            if (res && res.data) {
                const data = res.data;
                console.log("Backend upload success:", data);

                setJobId(data.job_id);

                // Update clip duration from server if available
                if (data.duration) {
                    setClips(prev => prev.map(c => c.id === initialClip.id ? { ...c, end: data.duration } : c));
                }

                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: 'assistant',
                    content: '🎥 Visuals acquired! I am analyzing the footage. What is your creative vision?',
                    timestamp: new Date()
                }]);
            }
        } catch (err) {
            console.error("Backend upload failed:", err);

            let errorMsg = '⚠️ Backend connection failed — manual editing tools work fine! AI features need the backend running.';

            if (err.message === "AUTH_MISSING") {
                errorMsg = '🔒 Not logged in! Please log out and log back in to enable AI features and export.';
            } else if (err.response && err.response.status === 401) {
                errorMsg = '🔒 Session expired! Please log out and log back in, then re-upload your video.';
            } else if (err.response && err.response.status === 413) {
                errorMsg = '📦 Video file is too large for the server. Try a smaller file.';
            } else if (err.code === 'ECONNABORTED') {
                errorMsg = '⏰ Upload timed out — the server may be waking up. Try again in a minute.';
            }

            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: errorMsg,
                timestamp: new Date()
            }]);
        } finally {
            setIsUploading(false); // Hide upload loading animation
        }
    };


    // const handleVideoUpload = async (event) => {

    //     const file = event.target.files?.[0];
    //     if (!file) return;

    //     try {
    //         // 2. Prepare the file for upload
    //         const formData = new FormData();
    //         formData.append('file', file);

    //         // 3. Send to Backend
    //         console.log("Uploading to server...");
    //         const response = await axios.post(`${API_URL}/jobs/upload`, formData, {
    //             headers: { 'Content-Type': 'multipart/form-data' },
    //         });

    //         const data = response.data; // { job_id: "...", filename: "...", status: "..." }
    //         console.log("Upload Success:", data);

    //         // 4. Update State with Server Data
    //         setJobId(data.job_id);
    //         setHasVideo(true);

    //         // Construct the server URL for the video
    //         // We use the download endpoint we created in jobs.py
    //         const serverVideoUrl = `${API_URL}/jobs/${data.job_id}/download`;
    //         setVideoSrc(serverVideoUrl);


    //         const initialClip = {
    //             id: Date.now(),
    //             name: 'Main Video',
    //             start: 0,
    //             end: 0, // Will be updated when duration is loaded
    //         };

    //         setClips([initialClip]);
    //         setSelectedClip(initialClip.id);
    //         saveToHistory([initialClip], musicTracks);
    //         setMessages(prev => [...prev, {
    //             id: Date.now(),
    //             role: 'assistant',
    //             content: 'Video uploaded successfully! What would you like to edit?',
    //             timestamp: new Date()
    //         }]);

    //     } catch (error) {
    //         console.error("Upload failed:", error);
    //         alert("Error uploading video. Check console for details.");
    //     }
    // };



    const handleProjectNameChange = (name) => {
        setProjectName(name);
    };

    const handleProjectCreated = (project) => {
        setProjects(prev => [project, ...prev]);
        setCurrentProject(project);
    };

    // Update clip end time when duration changes
    useEffect(() => {
        if (duration > 0 && clips.length > 0 && clips[0].end === 0) {
            const updatedClips = clips.map(clip => ({
                ...clip,
                end: duration
            }));
            setClips(updatedClips);
        }
    }, [duration]);

    const handleVideoTimeUpdate = (e) => {
        if (!e.target || isDraggingPlayhead) return;

        const videoTime = e.target.currentTime;

        if (isPlaying && clips.length > 0) {
            // Sort clips by start time
            const sortedClips = [...clips].sort((a, b) => a.start - b.start);

            // Check if current time is within any clip
            const currentClip = sortedClips.find(c => videoTime >= c.start && videoTime <= c.end);

            if (currentClip) {
                // We're inside a valid clip — just update the time
                setCurrentTime(videoTime);
            } else {
                // We're outside all clips — find next clip to jump to
                const nextClip = sortedClips.find(c => c.start > videoTime);

                if (nextClip) {
                    // Jump to next clip's start
                    if (videoSeekRef.current) videoSeekRef.current(nextClip.start);
                    setCurrentTime(nextClip.start);
                } else {
                    // Past all clips — pause playback
                    setIsPlaying(false);
                    // Seek back to first clip start
                    if (sortedClips.length > 0) {
                        const firstStart = sortedClips[0].start;
                        if (videoSeekRef.current) videoSeekRef.current(firstStart);
                        setCurrentTime(firstStart);
                    }
                }
            }
        } else {
            setCurrentTime(videoTime);
        }
    };

    const handleSeek = (time) => {
        if (videoSeekRef.current) videoSeekRef.current(time);
        setCurrentTime(time);
    };

    const handleAdjustmentChange = (key, value) => {
        setAdjustments(prev => ({
            ...prev,
            [key]: value
        }));
    };

    useEffect(() => {
        const urlJobId = searchParams.get('jobId');
        if (urlJobId) {
            loadExistingProject(urlJobId);
        }
    }, [searchParams]);

    const loadExistingProject = async (id) => {
        try {
            console.log("Loading project:", id);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/jobs/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            const jobData = res.data;

            // 1. Restore Job State
            setJobId(id);
            setHasVideo(true);
            setProjectName(`Project ${id.substring(0, 6)}`);

            // 2. Set Video Source — download as blob to avoid auth issues
            try {
                const videoRes = await axios.get(`${API_URL}/jobs/${id}/download`, {
                    responseType: 'blob',
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const blob = videoRes.data;
                const videoUrl = URL.createObjectURL(blob);
                setVideoSrc(videoUrl);
            } catch (videoErr) {
                console.warn("Could not load video preview, using direct URL", videoErr);
                setVideoSrc(`${API_URL}/jobs/${id}/download?t=${Date.now()}`);
            }

            // 3. Restore Chat History
            const recoveredMessages = [
                {
                    id: 1,
                    role: 'assistant',
                    content: 'Welcome back! I have loaded your project.',
                    timestamp: new Date()
                }
            ];

            if (jobData.prompt && jobData.prompt !== "Awaiting user prompt...") {
                recoveredMessages.push({
                    id: 'restored-user',
                    role: 'user',
                    content: jobData.prompt,
                    timestamp: new Date()
                });
                recoveredMessages.push({
                    id: 'restored-ai',
                    role: 'assistant',
                    content: `I've restored your project. Current status is: ${jobData.status}`,
                    timestamp: new Date()
                });
            }
            setMessages(recoveredMessages);

            // 4. Update Duration/Metadata if available
            if (jobData.duration) {
                setDuration(jobData.duration);
            }
            // Create a restored clip for the timeline
            const restoredClip = {
                id: Date.now(),
                name: "Main Video",
                start: 0,
                end: jobData.duration || 0,
                file: `${API_URL}/jobs/${id}/download`
            };
            setClips([restoredClip]);
            setSelectedClip(restoredClip.id);

        } catch (err) {
            console.error("Failed to load existing project:", err);
            alert("Could not load project. It might have been deleted or the server is unavailable.");
        }
    };

    // Handler functions for new features
    const handleAddText = (textData) => {
        const newText = {
            id: Date.now(),
            ...textData,
            position: { x: 50, y: 50 }, // centered in %
        };
        setTextOverlays(prev => [...prev, newText]);
    };

    const handleRemoveText = (id) => {
        setTextOverlays(prev => prev.filter(t => t.id !== id));
    };

    const handleUpdateTextPosition = (id, position) => {
        setTextOverlays(prev => prev.map(t => t.id === id ? { ...t, position } : t));
    };

    const handleAddSticker = (stickerData) => {
        const newSticker = {
            id: Date.now(),
            ...stickerData,
            position: { x: 60, y: 40 }, // offset from center
        };
        setStickers(prev => [...prev, newSticker]);
    };

    const handleRemoveSticker = (id) => {
        setStickers(prev => prev.filter(s => s.id !== id));
    };

    const handleUpdateStickerPosition = (id, position) => {
        setStickers(prev => prev.map(s => s.id === id ? { ...s, position } : s));
    };

    const handleApplyEffect = (effect) => {
        if (!hasVideo) return;

        // Toggle: if same effect is already applied, remove it
        const existing = appliedEffects.find(e => e.id === effect.id);
        if (existing) {
            setAppliedEffects(prev => prev.filter(e => e.id !== effect.id));
        } else {
            const newEffect = {
                ...effect,
                startTime: currentTime,
                duration: duration, // apply to full video
            };
            setAppliedEffects(prev => [...prev, newEffect]);
        }
    };

    const handleApplyTransition = (transition) => {
        if (!hasVideo) return;

        setAppliedTransition({
            id: Date.now(),
            ...transition,
            clipId: selectedClip,
        });
    };

    const handleApplyFilter = (filter) => {
        if (filter.id === 'none') {
            setAppliedFilter(null);
            // Reset adjustments that the filter may have set
            setAdjustments({
                brightness: 0, contrast: 0, saturation: 0, hue: 0,
                highlight: 0, shadows: 0, temperature: 0, tint: 0,
                sharpness: 0, vignette: 0,
            });
            return;
        }
        setAppliedFilter(filter);
        // Apply the filter's adjustment values
        if (filter.adjustments) {
            setAdjustments(prev => {
                const updated = { ...prev };
                Object.entries(filter.adjustments).forEach(([key, value]) => {
                    if (key in updated) updated[key] = value;
                });
                return updated;
            });
        }
    };

    // call prompt endpoint
    const handleSendMessage = async (content) => {
        if (!hasVideo) {
            alert("Upload a video first.");
            return;
        }
        if (!jobId) {
            // Video is uploaded locally but backend hasn't finished processing yet
            setMessages(prev => [...prev, 
                { id: Date.now(), role: 'user', content, timestamp: new Date() },
                { id: Date.now() + 1, role: 'assistant', content: '⏳ Still uploading to server (free tier takes ~1 min to wake up). Please try again in a moment!', timestamp: new Date() }
            ]);
            return;
        }
        setIsProcessing(true);

        const userMessage = { id: messages.length + 1, role: 'user', content, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);

        try {
            // 2. Send to Backend
            await axios.post(`${API_URL}/jobs/${jobId}/prompt`, { prompt: content });

            // 3. Start waiting for the REAL reply (Silent wait)
            startPollingStatus(jobId);


        } catch (err) {
            console.error("Prompt send error:", err);
            setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: 'Failed to reach the AI brain. The server might still be waking up — try again in a moment.', timestamp: new Date() }]);
            setIsProcessing(false);
        }


        // try {
        //     const res = await axios.post(`${API_URL}/jobs/${jobId}/prompt`, { prompt: content });
        //     console.log("Prompt response:", res.data);

        //     setMessages(prev => [...prev, {
        //         id: Date.now(),
        //         role: 'assistant',
        //         content: `Prompt accepted — editing started (status: ${res.data.status || 'QUEUED'})`,
        //         timestamp: new Date()
        //     }]);

        //     // start polling job status
        //     startPollingStatus(jobId);
        // } catch (err) {
        //     console.error("Prompt send error:", err);
        //     setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: 'Failed to send prompt.', timestamp: new Date() }]);
        // }
    };

    // polling
    const statusPollRef = useRef(null);
    const pollStartTimeRef = useRef(null);
    const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minute timeout

    const startPollingStatus = (id) => {
        if (statusPollRef.current) clearInterval(statusPollRef.current);
        pollStartTimeRef.current = Date.now();

        statusPollRef.current = setInterval(async () => {
            // Timeout check — stop polling after 5 minutes
            if (Date.now() - pollStartTimeRef.current > POLL_TIMEOUT_MS) {
                clearInterval(statusPollRef.current);
                statusPollRef.current = null;
                setIsProcessing(false);
                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: '⏰ Processing timed out. The free server may be overloaded — please try again.', timestamp: new Date() }]);
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/jobs/${id}`);
                const data = res.data;
                console.log("Polled status:", data);
                if (data.status === "COMPLETED") {
                    clearInterval(statusPollRef.current);
                    statusPollRef.current = null;
                    // download edited video and update preview
                    await downloadEditedVideo(id);
                    const aiMessage = data.ai_reply || 'Editing magic complete! ✨';
                    setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: aiMessage, timestamp: new Date() }]);
                    setIsProcessing(false);
                }
                else if (data.status === "CHAT_ONLY") {
                    clearInterval(statusPollRef.current);

                    // Note: We SKIP downloadEditedVideo() here!

                    const aiMessage = data.ai_reply || 'I am ready to help!';
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        role: 'assistant',
                        content: aiMessage,
                        timestamp: new Date()
                    }]);
                    setIsProcessing(false); // Stop the spinner immediately
                }
                else if (data.status === "FAILED") {
                    clearInterval(statusPollRef.current);
                    setIsProcessing(false);
                    statusPollRef.current = null;
                    const errMsg = data.error || 'Editing failed. Check backend logs.';
                    setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `❌ ${errMsg}`, timestamp: new Date() }]);
                } else {
                    // update UI status if you want
                }
            } catch (err) {
                console.error("Status poll error:", err);
            }
        }, 10000);
    };

    const downloadEditedVideo = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/jobs/${id}/download`, { responseType: 'blob' });
            const blob = res.data;
            const url = URL.createObjectURL(blob);
            setVideoSrc(url); // update parent videoSrc so VideoPreview shows edited video
            // also update internal videoRef if present:
            if (videoRef && videoRef.current) {
                videoRef.current.src = url;
                videoRef.current.load();
                try { videoRef.current.play(); } catch (e) { }
            }
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download edited video.");
        }
    };


    // const handleSendMessage = (content) => {
    //     const userMessage = {
    //         id: messages.length + 1,
    //         role: 'user',
    //         content,
    //         timestamp: new Date(),
    //     };
    //     setMessages([...messages, userMessage]);

    //     // Simulate AI response
    //     setTimeout(() => {
    //         const aiMessage = {
    //             id: messages.length + 2,
    //             role: 'assistant',
    //             content: 'I understand you want to ' + content.toLowerCase() + '. Let me help you with that! You can use the tools in the toolbar to make those edits.',
    //             timestamp: new Date(),
    //         };
    //         setMessages((prev) => [...prev, aiMessage]);
    //     }, 1000);
    // };

    useEffect(() => {
        return () => {
            if (statusPollRef.current) clearInterval(statusPollRef.current);
        };
    }, []);



    return (
        <div style={styles.container}>
            <Header
                projects={projects}
                currentProject={currentProject}
                hasVideo={hasVideo}
                onExport={() => setIsExportOpen(true)}
            />

            <div style={styles.mainContent}>
                <SlideOutSidebar
                    hasVideo={hasVideo}
                    onAddMedia={handleAddMedia}
                    onAddMusic={handleAddMusic}
                    onAddText={handleAddText}
                    onAddSticker={handleAddSticker}
                    onApplyEffect={handleApplyEffect}
                    onApplyTransition={handleApplyTransition}
                    onApplyFilter={handleApplyFilter}
                    adjustments={adjustments}
                    onAdjustmentChange={handleAdjustmentChange}
                    textOverlays={textOverlays}
                    stickers={stickers}
                    clips={clips}
                    onRemoveText={handleRemoveText}
                    onRemoveSticker={handleRemoveSticker}
                    appliedEffects={appliedEffects}
                />

                <div style={styles.centerArea}>
                    <VideoPreview
                        isPlaying={isPlaying}
                        videoSrc={videoSrc}
                        onPlayPause={() => setIsPlaying(!isPlaying)}
                        currentTime={currentTime}
                        duration={duration}
                        onVideoUpload={handleVideoUpload}
                        onProjectCreated={handleProjectCreated}
                        onDurationChange={setDuration}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onSeek={handleSeek}
                        videoSeekRef={videoSeekRef}
                        videoRef={videoRef}
                        isMuted={isMuted}
                        onToggleMute={() => setIsMuted(!isMuted)}
                        projectName={projectName}
                        onProjectNameChange={handleProjectNameChange}
                        adjustments={adjustments}
                        isProcessing={isProcessing}
                        isUploading={isUploading}
                        textOverlays={textOverlays}
                        stickers={stickers}
                        appliedEffects={appliedEffects}
                        appliedFilter={appliedFilter}
                        onUpdateTextPosition={handleUpdateTextPosition}
                        onUpdateStickerPosition={handleUpdateStickerPosition}
                        onRemoveText={handleRemoveText}
                        onRemoveSticker={handleRemoveSticker}
                    />

                    <Timeline
                        clips={clips}
                        musicTracks={musicTracks}
                        currentTime={currentTime}
                        duration={duration}
                        onTimeChange={setCurrentTime}
                        selectedClip={selectedClip}
                        onSelectClip={setSelectedClip}
                        hasVideo={hasVideo}
                        isDraggingPlayhead={isDraggingPlayhead}
                        onDraggingChange={setIsDraggingPlayhead}
                        onSeek={handleSeek}
                        isPlaying={isPlaying}
                        onPlayPause={() => setIsPlaying(!isPlaying)}
                        onCut={handleCut}
                        onDelete={handleDelete}
                        onTrim={handleTrim}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={historyIndex > 0}
                        canRedo={historyIndex < history.length - 1}
                        videoRef={videoRef}
                        videoSrc={videoSrc}
                        appliedTransition={appliedTransition}
                    />
                    <ExportModal
                        isOpen={isExportOpen}
                        onClose={() => setIsExportOpen(false)}
                        onConfirm={handleExportConfirm}
                        isProcessing={isDownloading}
                    />

                    <ComingSoonModal
                        isOpen={comingSoonData.open}
                        onClose={() => setComingSoonData({ ...comingSoonData, open: false })}
                        featureName={comingSoonData.feature}
                    />
                </div>

                <RightSidebar
                    messages={messages}
                    onSendMessage={handleSendMessage}
                />
            </div>
        </div>
    );
}

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#000',
        userSelect: 'none',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
        position: 'relative',
    },
    centerArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
    },
};
export default EditorPage;