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

    // --- COMING SOON STATE ---
    const [comingSoonData, setComingSoonData] = useState({ open: false, feature: '' });

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
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setClips(history[newIndex].clips);
            setMusicTracks(history[newIndex].musicTracks);
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

        showComingSoon("Manual Cutting");
        // if (selectedClip) {
        //     const clipIndex = clips.findIndex(c => c.id === selectedClip);
        //     if (clipIndex !== -1) {
        //         const clip = clips[clipIndex];
        //         const cutTime = currentTime;

        //         if (cutTime > clip.start && cutTime < clip.end) {
        //             const newClips = [...clips];
        //             const newClip = {
        //                 id: Date.now(),
        //                 name: `${clip.name} (Cut)`,
        //                 start: cutTime,
        //                 end: clip.end,
        //             };
        //             newClips[clipIndex] = { ...clip, end: cutTime };
        //             newClips.splice(clipIndex + 1, 0, newClip);
        //             setClips(newClips);
        //             saveToHistory(newClips, musicTracks);
        //         }
        //     }
        // }
    };

    const handleTrim = () => {

        showComingSoon("Manual Trimming");
        // if (selectedClip) {
        //     const clipIndex = clips.findIndex(c => c.id === selectedClip);
        //     if (clipIndex !== -1) {
        //         const newClips = [...clips];
        //         const clip = newClips[clipIndex];
        //         newClips[clipIndex] = { ...clip, end: clip.end - 1 };
        //         setClips(newClips);
        //         saveToHistory(newClips, musicTracks);
        //     }
        // }
    };

    const handleDelete = () => {
        if (selectedClip) {
            const newClips = clips.filter(c => c.id !== selectedClip);
            setClips(newClips);
            saveToHistory(newClips, musicTracks);
            setSelectedClip(null);
        }
    };

    const handleAddMusic = () => {
        if (!hasVideo) return;

        showComingSoon("MuSIC OVERLAYS");

        // const input = document.createElement('input');
        // input.type = 'file';
        // input.accept = 'audio/*';
        // input.onchange = (e) => {
        //     const file = e.target.files[0];
        //     if (file && file.type.startsWith('audio/')) {
        //         const newTrack = {
        //             id: Date.now(),
        //             name: file.name,
        //             start: 0,
        //             end: duration,
        //             file: URL.createObjectURL(file),
        //         };
        //         const newMusic = [...musicTracks, newTrack];
        //         setMusicTracks(newMusic);
        //         saveToHistory(clips, newMusic);
        //     }
        // };
        // input.click();
    };

    const handleAddMedia = () => {
        // if (!hasVideo) return;
        showComingSoon("Media Overlays");

        // const input = document.createElement('input');
        // input.type = 'file';
        // input.accept = 'video/*';
        // input.onchange = (e) => {
        //     const file = e.target.files[0];
        //     if (file && file.type.startsWith('video/')) {
        //         const newClip = {
        //             id: Date.now(),
        //             name: file.name,
        //             start: clips.length > 0 ? clips[clips.length - 1].end : 0,
        //             end: (clips.length > 0 ? clips[clips.length - 1].end : 0) + 10,
        //             file: URL.createObjectURL(file),
        //         };
        //         const newClips = [...clips, newClip];
        //         setClips(newClips);
        //         saveToHistory(newClips, musicTracks);
        //     }
        // };
        // input.click();
    };

    // in EditorPage.jsx (replace existing handleVideoUpload)
    const handleVideoUpload = async (file) => {
        if (!file) return;
        console.log("Uploading file to backend...", file);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(`${API_URL}/jobs/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });

            if (!res || !res.data) {
                console.error("Upload: no response data", res);
                alert("Upload failed: no response.");
                return;
            }

            const data = res.data;
            console.log("Upload response:", data);

            // Save job id and set video preview to server download URL (original until edited)
            setJobId(data.job_id);
            setHasVideo(true);

            // Using server download endpoint to preview original (works even before edit)
            const serverVideoUrl = `${API_URL}/jobs/${data.job_id}/download`;
            setVideoSrc(serverVideoUrl);

            // add initial clip for UI (keeps timeline happy)
            const initialClip = {
                id: Date.now(),
                name: file.name,
                start: 0,
                end: data.duration || 0,
                file: URL.createObjectURL(file),
            };
            setClips([initialClip]);
            setSelectedClip(initialClip.id);
            saveToHistory([initialClip], musicTracks);

            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: '🎥 Visuals acquired! I am analyzing the footage. What is your creative vision?',
                timestamp: new Date()
            }]);

        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed — check console/backend logs.");
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
        if (isPlaying && e.target && !isDraggingPlayhead) {
            setCurrentTime(e.target.currentTime);
        }
    };

    const handleSeek = (time) => {
        videoSeekRef.current(time);
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
            const res = await axios.get(`${API_URL}/jobs/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            const jobData = res.data;

            // 1. Restore Job State
            setJobId(id);
            setHasVideo(true);
            setProjectName(`Project ${id.substring(0, 6)}`);


            // 2. Set Video Source (The backend logic usually serves edited if available)
            // We append a timestamp to avoid browser caching issues if you re-edit
            setVideoSrc(`${API_URL}/jobs/${id}/download?t=${Date.now()}`);

            const recoveredMessages = [
                {
                    id: 1,
                    role: 'assistant',
                    content: 'Welcome back! I have loaded your project.',
                    timestamp: new Date()
                }
            ];

            // 3. Restore Chat History (Last Prompt)
            if (jobData.prompt && jobData.prompt !== "Awaiting user prompt...") {
                setMessages(prev => [
                    ...prev, // Keep the "Hello I am AI" message
                    {
                        id: 'restored-user',
                        role: 'user',
                        content: jobData.prompt,
                        timestamp: new Date() // or jobData.created_at if available
                    },
                    {
                        id: 'restored-ai',
                        role: 'assistant',
                        content: `I've restored your project. Current status is: ${jobData.status}`,
                        timestamp: new Date()
                    }
                ]);
            }
            setMessages(recoveredMessages);

            // 4. Update Duration/Metadata if available
            if (jobData.duration) {
                setDuration(jobData.duration);
                // Also update the clips timeline to match duration
                const restoredClip = {
                    id: Date.now(),
                    name: "Main Video",
                    start: 0,
                    end: jobData.duration,
                    file: `${API_URL}/jobs/${id}/download`
                };
                setClips([restoredClip]);
            }

        } catch (err) {
            console.error("Failed to load existing project:", err);
            alert("Could not load project. It might have been deleted.");
        }
    };

    // Handler functions for new features
    const handleAddText = (textData) => {
        showComingSoon("Text Overlays");
        // const newText = {
        //     id: Date.now(),
        //     ...textData,
        //     position: { x: 50, y: 50 }, // centered in %
        // };
        // setTextOverlays(prev => [...prev, newText]);
    };

    const handleAddSticker = (stickerData) => {
        showComingSoon("Stickers & Emojis");


        // const newSticker = {
        //     id: Date.now(),
        //     ...stickerData,
        //     position: { x: 50, y: 50 }, // centered in %
        // };
        // setStickers(prev => [...prev, newSticker]);
    };

    const handleApplyEffect = (effect) => {

        showComingSoon(`Effect: ${effect.name}`);
        // if (!hasVideo) return;

        // // Add effect to the list
        // const newEffect = {
        //     id: Date.now(),
        //     ...effect,
        //     startTime: currentTime,
        //     duration: 3, // 3 second effect by default
        // };
        // setAppliedEffects(prev => [...prev, newEffect]);

        // console.log('Applied effect:', effect.name);
    };

    const handleApplyTransition = (transition) => {

        showComingSoon(`transition: ${transition.name}`);
        // if (!hasVideo || !selectedClip) return;

        // // Apply transition to selected clip
        // setAppliedTransition({
        //     id: Date.now(),
        //     ...transition,
        //     clipId: selectedClip,
        // });

        // console.log('Applied transition:', transition.name);
    };

    const handleApplyFilter = (filter) => {
        showComingSoon(`Filter: ${filter.name}`);
    };

    // call prompt endpoint
    const handleSendMessage = async (content) => {
        if (!jobId) {
            alert("Upload a video first.");
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
            setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: 'Failed to reach the AI brain.', timestamp: new Date() }]);
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
    const startPollingStatus = (id) => {
        if (statusPollRef.current) clearInterval(statusPollRef.current);
        statusPollRef.current = setInterval(async () => {
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
                    setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: 'Editing failed. Check backend logs.', timestamp: new Date() }]);
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