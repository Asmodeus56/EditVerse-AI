import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Sparkles, Info, Plus, Edit, Share2, Camera, X, Phone,
  Bell, ChevronDown, User, Settings, LogOut, Heart,
  Twitter, Instagram, Linkedin, Youtube, Layers, Mail,
  Users
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import Lenis from '@studio-freight/lenis';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "../styles/dashboard.css";
import { API_BASE_URL } from '../config'; // Adjust path as needed (e.g. '../../config')

import emailjs from '@emailjs/browser';
import LoginPage from './loginpage';

const logoImage = 'https://i.ibb.co/whRn8Nx4/LOGO-EDITVERSEAI.jpg';
const API_URL = API_BASE_URL;
emailjs.init('W3UAXZkWrUO1CY1mu');

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalStatus, setModalStatus] = useState('');
  const [modalBody, setModalBody] = useState<React.ReactNode>(null);
  const [modalType, setModalType] = useState<'custom' | 'settings' | 'profile' | 'changePassword'>('custom');
  const [profileName, setProfileName] = useState('User');
  const [profileImage, setProfileImage] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=User');
  const [editName, setEditName] = useState('User');
  const [tempProfileImage, setTempProfileImage] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=User');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [profileEmail, setProfileEmail] = useState('');

  const [jobs, setJobs] = useState<Array<{ id: string;[key: string]: any }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<{ id: string;[key: string]: any } | null>(null);

  const [downloadProgress, setDownloadProgress] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jobsPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navMarkerRef = useRef<HTMLDivElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);
  const projectsGridRef = useRef<HTMLDivElement>(null);
  const projectScrollLineRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const heroCardsRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);
  const rafIdRef = useRef<number | undefined>(undefined);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    // const userResponse = await fetch('/auth/register/email', {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`, // if using auth
    //     'Content-Type': 'application/json',
    //   },
    // });

    // if (!userResponse.ok) {
    //   throw new Error('Failed to fetch user data');
    // }

    // const userData = await userResponse.json();
    // const userEmail = userData.email; // Get email from backend response

    const subject = (form.elements.namedItem("subject") as HTMLInputElement)?.value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value;
    const email = (form.elements.namedItem("email") as HTMLTextAreaElement)?.value;

    const currentTime = new Date().toLocaleString(); // or whatever time format you want

    try {
      const result = await emailjs.send(
        'service_tq9qm9f',
        'template_kbn9tmd',
        {
          name: User.name || profileName,
          email: email,
          subject: subject,
          message: message,
          time: currentTime,
        },
        'W3UAXZkWrUO1CY1mu'
      );
      ;

      if (result.text === 'OK') {
        alert('Message sent successfully!');
        closeModal();
        form.reset();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };



  // Update functions need to be defined before the useEffect
  const updateScrollSpy = () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active-tab');
      if (link.getAttribute('href')?.includes(current)) {
        link.classList.add('active-tab');
        moveMarker(link as HTMLElement);
      }
    });
  };
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/jobs/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Expect array like [{ id, prompt, status, created_at, edited_file_path, original_file_path, ...}, ...]
      setJobs(Array.isArray(res.data) ? res.data : res.data.results || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to load jobs. Check backend.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJobs();

    // optional: poll jobs every 10s to keep UI fresh
    // jobsPollRef.current = setInterval(fetchJobs, 10000);
    // return () => {
    //   if (jobsPollRef.current) clearInterval(jobsPollRef.current);
    // };
  }, []);

  // Open editor for a job (or new project)
  const openEditorWithJob = (jobId: string) => {
    // navigate to editor and pass job id as query param
    // your EditorPage can read this from location.search or useParams depending on your router setup
    navigate(`/editor?jobId=${jobId}`);
  };

  // Download edited video (blob)
  const handleDownload = async (jobId: string, filename: string = "edited_video.mp4") => {
    try {
      setDownloadProgress("starting");
      const res = await axios.get(`${API_URL}/jobs/${jobId}/download`, {
        responseType: "blob",
        onDownloadProgress: (ev) => {
          if (ev.lengthComputable && ev.total) {
            const percent = Math.round((ev.loaded / ev.total) * 100);
            setDownloadProgress(percent);
          } else {
            setDownloadProgress("downloading");
          }
        },
      });


      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      // open in new tab
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloadProgress(null);
    } catch (err) {
      console.error("Download failed:", err);
      setDownloadProgress(null);
      alert("Failed to download edited video. Check backend logs.");
    }
  };

  // Delete job (if your backend exposes this)
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Delete this job and all associated files?")) return;
    try {
      await axios.delete(`${API_URL}/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setModalOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed (maybe endpoint not implemented). Check backend logs.");
    }
  };

  // Open modal with more info
  const openJobModal = (job: { id: string;[key: string]: any }) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const moveMarker = (element: HTMLElement) => {
    if (navMarkerRef.current) {
      navMarkerRef.current.style.width = element.offsetWidth + 'px';
      navMarkerRef.current.style.left = element.offsetLeft + 'px';
      navMarkerRef.current.style.opacity = '1';
    }
  };

  const updateVerticalLine = () => {
    if (!scrollLineRef.current) {
      console.log('scrollLineRef not found');
      return;
    }

    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const lineStartAbsolute = 150;
    const maxScroll = docHeight - winHeight;
    const contentEnd = docHeight;

    let progress = 0;
    if (maxScroll > 0) progress = scrollY / maxScroll;

    const totalTrackLength = contentEnd - lineStartAbsolute;
    let height = totalTrackLength * progress;
    if (height < 0) height = 0;

    scrollLineRef.current.style.height = `${height}px`;

    const lineTipAbsolute = lineStartAbsolute + height;
    const powerNodes = document.querySelectorAll('.power-node');

    powerNodes.forEach((node) => {
      const nodeTopViewport = node.getBoundingClientRect().top;
      const lineTipViewport = lineStartAbsolute - scrollY + height;
      if (lineTipViewport >= nodeTopViewport) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });
  };

  const updateHorizontalLine = () => {
    if (!projectsGridRef.current || !projectScrollLineRef.current || !horizontalTrackRef.current) {
      return;
    }

    const scrollLeft = projectsGridRef.current.scrollLeft;
    const scrollWidth = projectsGridRef.current.scrollWidth;
    const clientWidth = projectsGridRef.current.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    const cards = projectsGridRef.current.querySelectorAll('.tilt-card');
    if (cards.length < 2) return;

    const firstCard = cards[0] as HTMLElement;
    const lastCard = cards[cards.length - 1] as HTMLElement;

    const firstCardCenter = firstCard.offsetLeft + firstCard.offsetWidth / 2;
    const lastCardCenter = lastCard.offsetLeft + lastCard.offsetWidth / 2;
    const trackWidth = lastCardCenter - firstCardCenter;

    horizontalTrackRef.current.style.left = `${firstCardCenter}px`;
    horizontalTrackRef.current.style.width = `${trackWidth}px`;
    projectScrollLineRef.current.style.left = `${firstCardCenter}px`;

    let scrollPercentage = 0;
    if (maxScroll > 0) scrollPercentage = scrollLeft / maxScroll;

    const fillWidth = trackWidth * scrollPercentage;
    projectScrollLineRef.current.style.width = `${fillWidth}px`;
  };

  // Animation loop for lines
  useEffect(() => {
    function raf() {
      updateVerticalLine();
      updateScrollSpy();
      if (projectsGridRef.current) updateHorizontalLine();
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let particles: Particle[] = [];
    let animationId: number;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < 40; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.3 * (1 - dist / 100)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();

    const handleResize = () => {
      resize();
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Initial animations
  useEffect(() => {
    if (heroCardsRef.current) {
      heroCardsRef.current.classList.remove('opacity-0', 'translate-y-10');
    }
    const textElement = document.querySelector('.hacker-text') as HTMLElement;
    if (textElement) hackEffect(textElement);

    // Initial line updates
    updateVerticalLine();
    updateScrollSpy();
  }, []);

  // Horizontal line on resize
  useEffect(() => {
    const handleResize = () => updateHorizontalLine();

    window.addEventListener('resize', handleResize);

    // Initial update
    setTimeout(() => updateHorizontalLine(), 500);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#profile-container')) {
        setProfileDropdownOpen(false);
      }
      if (!target.closest('#notification-container')) {
        setNotificationDropdownOpen(false);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const hackEffect = (element: HTMLElement) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&@$';
    const originalText = element.dataset.value || '';
    let iterations = 0;

    const interval = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((letter, index) => {
          if (index < iterations) return originalText[index];
          return letters[Math.floor(Math.random() * 26)];
        })
        .join('');

      if (iterations >= originalText.length) clearInterval(interval);
      iterations += 1 / 3;
    }, 30);
  };

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const resetTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  const toggleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = '';
  };

  const openModal = (title: string, status: string) => {
    setModalTitle(title);
    setModalStatus(status);
    setModalType('custom');
    setModalBody(
      <>
        <div className="h-48 bg-slate-900/50 rounded-xl mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50"></div>
          <Layers className="text-4xl text-slate-700" size={48} />
          <p className="absolute bottom-4 text-slate-500 text-xs">Preview Placeholder</p>
        </div>
        <div className="flex gap-4 mt-auto">
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            onClick={() => navigate('/editor')}>
            <Edit size={16} /> Open Editor
          </button>
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all">
            <Share2 size={16} />
          </button>
        </div>
      </>
    );
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // or redirect to login

        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = res.data;
        setProfileName(user.name);
        setProfileEmail(user.email);
        setProfileImage(user.avatar);
        setTempProfileImage(user.avatar);
        setEditName(user.name);

      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    
    fetchProfile();
  }, []);

  const openProfileModal = () => {
    setModalTitle('Edit Profile');
    setModalStatus('');
    setEditName(profileName);
    setTempProfileImage(profileImage);
    setModalType('profile');
    setModalOpen(true);
    setProfileDropdownOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setTempProfileImage(result);
        const modalImg = document.getElementById('modal-profile-img') as HTMLImageElement;
        if (modalImg) modalImg.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setProfileName(editName);
    setProfileImage(tempProfileImage);
    closeModal();
    alert('Profile Updated Successfully!');
  };

  const openSettingsModal = () => {
    setModalTitle('Settings');
    setModalStatus('');
    setModalType('settings');
    setModalOpen(true);
    setProfileDropdownOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const openChangePasswordModal = () => {
    setModalTitle('Change Password');
    setModalStatus('');
    setModalType('changePassword');
    setModalBody(
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-2">Current Password</label>
          <input type="password" placeholder="Enter current password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none" required />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">New Password</label>
          <input type="password" placeholder="Enter new password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none" required />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none" required />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={openSettingsModal} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl font-bold transition-all">
            Cancel
          </button>
          <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-bold transition-all">
            Update Password
          </button>
        </div>
      </form>
    );
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password Changed Successfully!');
    closeModal();
  };

  const openHowItWorksModal = () => {
    setModalTitle('How It Works');
    setModalStatus('');
    setModalType('custom');
    setModalBody(
      <div className="space-y-6 text-slate-300">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold">1</div>
          <div>
            <h4 className="text-white font-bold text-lg">Upload Content</h4>
            <p className="text-sm mt-1">Drag and drop your images or videos directly into the workspace.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold">2</div>
          <div>
            <h4 className="text-white font-bold text-lg">AI Assistance</h4>
            <p className="text-sm mt-1">Our neural engine analyzes your media and suggests enhancements.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold">3</div>
          <div>
            <h4 className="text-white font-bold text-lg">Manual Refinement</h4>
            <p className="text-sm mt-1">Take control with professional-grade tools to tweak every detail.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold">4</div>
          <div>
            <h4 className="text-white font-bold text-lg">Download Options</h4>
            <p className="text-sm mt-1">Export in 4K, 8K, or web-optimized formats instantly.</p>
          </div>
        </div>
      </div>
    );
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const openContactModal = () => {
    setModalTitle('Contact Us');
    setModalStatus('');
    setModalType('custom');
    setModalBody(
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-bold text-lg mb-2">Get in Touch</h4>
            <p className="text-slate-400 text-sm leading-relaxed">We'd love to hear from you. Fill out the form or reach us via our social channels.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Email Us</p>
              <a href="mailto:support@editverse.ai" className="text-white hover:text-indigo-400 transition-colors">
                support@editverse.ai
              </a>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">Follow Us</p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleContactSubmit}>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Email</label>
            <input name="email" type="text" placeholder="enter your email@id" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm" required />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Subject</label>
            <input name="subject" type="text" placeholder="How can we help?" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm" required />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Message</label>
            <textarea name="message" rows={4} placeholder="Tell us more..." className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none text-sm" required />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all text-sm">
            Send Message
          </button>
        </form>
      </div>
    );
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // const handleContactSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   alert('Message Sent Successfully!');
  //   closeModal();
  // };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      alert('Signing out...');
      window.location.reload();
    }
  };

  const handleLogoClick = () => {
    window.location.href = window.location.pathname + '#home';
    window.location.reload();
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-smooth [data-lenis-prevent] { oversizing-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }
        .lenis.lenis-scrolling iframe { pointer-events: none; }

        body {
            background-color: #0B0F19;
            color: #94a3b8;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            margin: 0;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        body.light-mode {
            background-color: #f8fafc;
            color: #475569;
        }
        body.light-mode .glass-nav {
            background: rgba(255, 255, 255, 0.85);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        body.light-mode h1, body.light-mode h2, body.light-mode h3, body.light-mode h4 {
            color: #1e293b;
        }
        body.light-mode .tilt-card, body.light-mode .modal-content {
            background: rgba(255, 255, 255, 0.95) !important;
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
        }
        body.light-mode .text-slate-400 { color: #64748b; }
        body.light-mode .text-white { color: #0f172a; } 
        body.light-mode .bg-white\\/5 { background-color: rgba(0,0,0,0.05); }
        body.light-mode .border-white\\/10 { border-color: rgba(0,0,0,0.1); }
        body.light-mode .text-slate-200 { color: #1e293b; }
        body.light-mode .text-slate-300 { color: #475569; }
        body.light-mode .text-slate-500 { color: #64748b; }
        body.light-mode button.text-slate-400 { color: #475569; }
        body.light-mode button.text-slate-400:hover { color: #0f172a; }
        body.light-mode .dropdown-menu { 
            background: #ffffff !important; 
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2) !important;
        }
        body.light-mode .dropdown-menu .border-white\\/5 { border-color: rgba(0, 0, 0, 0.08) !important; }
        body.light-mode .dropdown-menu .bg-white\\/5 { background-color: rgba(0, 0, 0, 0.03) !important; }
        body.light-mode .dropdown-menu .text-white { color: #0f172a !important; }
        body.light-mode .dropdown-menu .text-slate-300 { color: #475569 !important; }
        body.light-mode .dropdown-menu .text-slate-400 { color: #64748b !important; }
        body.light-mode .dropdown-menu .text-indigo-400 { color: #6366f1 !important; }
        body.light-mode .dropdown-menu .text-green-400 { color: #22c55e !important; }
        body.light-mode .dropdown-menu .text-red-400 { color: #ef4444 !important; }
        body.light-mode .dropdown-menu a:hover { 
            background: #6366f1 !important;
            color: #ffffff !important;
        }
        body.light-mode .dropdown-menu a:hover * { 
            color: #ffffff !important;
        }
        body.light-mode .modal-overlay .bg-black\\/80 { 
            background: rgba(0, 0, 0, 0.4); 
        }
        
        /* Language dropdown and select elements in light mode */
        body.light-mode select {
            background: rgba(0, 0, 0, 0.05) !important;
            border-color: rgba(0, 0, 0, 0.2) !important;
            color: #0f172a !important;
        }
        body.light-mode select option {
            background: #ffffff !important;
            color: #0f172a !important;
        }
        
        /* Logo background in light mode */
        body.light-mode nav img[alt="Editverse Logo"] {
            background: #ffffff;
            padding: 4px;
            border-radius: 8px;
        }

        h1, h2, h3, h4, .font-display {
            font-family: 'Space Grotesk', sans-serif;
        }

        #neural-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        }

        .glass-nav {
            background: rgba(11, 15, 25, 0.85);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .tilt-card {
            position: relative;
            background: rgba(30, 41, 59, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: visible;
            transition: box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease;
            transform-style: preserve-3d;
            perspective: 1000px;
            will-change: transform;
        }
        
        .tilt-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: inherit;
            padding: 1px;
            background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.6), transparent 40%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            z-index: 2;
            opacity: 0;
            transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            pointer-events: none;
        }

        .tilt-card:hover::before { opacity: 1; }
        .tilt-card:hover { 
            border-color: rgba(99, 102, 241, 0.3); 
            box-shadow: 0 10px 40px -10px rgba(99,102,241,0.3);
        }

        .spotlight-bg {
            position: absolute;
            inset: 0;
            background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.08), transparent 40%);
            opacity: 0;
            transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            z-index: 1;
            pointer-events: none;
            border-radius: inherit;
        }
        .tilt-card:hover .spotlight-bg { opacity: 1; }

        .card-connector {
            position: absolute;
            top: -26px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 12px;
            background: #0B0F19;
            border: 2px solid #334155;
            border-radius: 50%;
            z-index: 20;
            transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .tilt-card:hover .card-connector {
            border-color: #6366f1;
            background: #6366f1;
            box-shadow: 0 0 10px #6366f1;
        }

        .nav-link {
            position: relative;
            color: #94a3b8;
            transition: color 0.3s ease;
            cursor: pointer;
        }
        .nav-link.active-tab {
            color: white;
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        body.light-mode .nav-link {
            color: #64748b;
        }
        body.light-mode .nav-link.active-tab {
            color: #6366f1;
            text-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }
        .nav-indicator-container {
            position: relative;
            display: flex;
            align-items: center;
            gap: 2rem;
        }
        #nav-marker {
            position: absolute;
            bottom: -4px;
            left: 0;
            height: 2px;
            background: #6366f1;
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.8);
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
            border-radius: 2px;
            opacity: 0;
        }

        .power-line-container {
            position: absolute;
            left: 12px;
            top: 0;
            bottom: 0; 
            width: 2px;
            z-index: 0;
            pointer-events: none;
        }
        @media (min-width: 640px) {
            .power-line-container {
                left: 20px;
            }
        }
        @media (min-width: 1280px) {
            .power-line-container {
                left: calc(50% - 660px);
            }
        }
        .power-line-track {
            position: absolute;
            top: 150px;
            bottom: 0;
            width: 1px;
            background: rgba(255,255,255,0.05);
        }
        body.light-mode .power-line-track {
            background: rgba(0,0,0,0.15);
        }
        .power-line-progress {
            position: absolute;
            top: 150px;
            width: 2px;
            height: 0px;
            background: linear-gradient(180deg, #6366f1, #a855f7, #ec4899);
            box-shadow: 0 0 15px #6366f1;
            will-change: height;
        }
        .power-node {
            position: absolute;
            left: -4px;
            width: 10px;
            height: 10px;
            background: #0B0F19;
            border: 2px solid #334155;
            border-radius: 50%;
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            z-index: 2;
        }
        .power-node.active {
            border-color: #6366f1;
            box-shadow: 0 0 10px #6366f1;
            background: #6366f1;
        }

        #horizontal-line-wrapper {
            position: absolute;
            top: 28px;
            left: 0;
            height: 2px;
            z-index: 0;
            pointer-events: none;
        }
        .horizontal-line-track {
            position: absolute;
            top: 0;
            left: 0;
            height: 1px;
            background: rgba(255,255,255,0.1);
        }
        body.light-mode .horizontal-line-track {
            background: rgba(0,0,0,0.15);
        }
        .horizontal-line-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 2px;
            width: 0px;
            background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
            box-shadow: 0 0 15px #6366f1;
            will-change: width;
        }

        .btn-shimmer {
            background: linear-gradient(110deg, #4f46e5 45%, #818cf8 55%, #4f46e5);
            background-size: 200% 100%;
            animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        .text-glow { text-shadow: 0 0 30px rgba(99, 102, 241, 0.5); }
        .gradient-text {
            background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hacker-text span {
            display: inline-block;
            min-width: 10px;
        }

        .dropdown-menu {
            transform-origin: top right;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0;
            visibility: hidden;
            transform: scale(95%);
            pointer-events: none;
        }
        .dropdown-menu.open {
            opacity: 1;
            visibility: visible;
            transform: scale(100%);
            pointer-events: auto;
        }

        .modal-overlay {
            opacity: 1;
            pointer-events: none;
            visibility: hidden;
            transition: visibility 0s linear 0.3s;
        }
        .modal-overlay.open {
            pointer-events: auto;
            visibility: visible;
            transition-delay: 0s;
        }
        .modal-overlay > div:first-child {
            backdrop-filter: blur(0px);
            background-color: rgba(0, 0, 0, 0);
            transition: backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-overlay.open > div:first-child {
            backdrop-filter: blur(8px);
            background-color: rgba(0, 0, 0, 0.8);
        }
        .modal-overlay.open .modal-content {
            transform: scale(100%);
            opacity: 1;
        }
        .modal-content {
            transform: scale(95%);
            opacity: 0;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        section { scroll-margin-top: 100px; }

        .animate-fade-in {
            animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="min-h-screen relative antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <canvas ref={canvasRef} id="neural-canvas"></canvas>

        <div className="power-line-container">
          <div className="power-line-track"></div>
          <div className="power-line-progress" ref={scrollLineRef} id="scroll-line"></div>
          <div className="power-node" style={{ top: '150px' }} data-target="home"></div>
          <div className="power-node" style={{ top: '800px' }} data-target="projects"></div>
          <div className="power-node" style={{ top: '1400px' }} data-target="community"></div>
        </div>

        <nav className="glass-nav fixed w-full z-50 top-0 transition-transform duration-300" id="navbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
                <ImageWithFallback
                  src={isDarkMode ? logoImage : "https://iili.io/fIeaEdv.png"}
                  alt="Editverse Logo"
                  className="h-10 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="hidden md:flex items-center nav-indicator-container" ref={navContainerRef} id="nav-container">
                <a href="#home" className="nav-link active-tab text-sm font-medium py-2">Home</a>
                <a href="#projects" className="nav-link text-sm font-medium py-2">Projects</a>
                <a href="#community" className="nav-link text-sm font-medium py-2">Community</a>
                <div ref={navMarkerRef} id="nav-marker"></div>
              </div>
              <div className="flex items-center gap-4 relative">
                <div className="relative" id="notification-container">
                  <button onClick={(e) => { e.stopPropagation(); setNotificationDropdownOpen(!notificationDropdownOpen); setProfileDropdownOpen(false); }} className="text-slate-400 hover:text-white transition-colors relative">
                    <Bell size={20} />
                    {notificationsEnabled && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                  </button>
                  <div className={`dropdown-menu absolute right-0 top-10 w-72 bg-[#151925] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ${notificationDropdownOpen ? 'open' : ''}`}>
                    <div className="px-4 py-3 border-b border-white/5 font-bold text-white text-sm">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                      <a href="#" className="block px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5">
                        <p className="text-sm text-indigo-400 font-medium">New Feature</p>
                        <p className="text-xs text-slate-300 mt-1">AI Upscaling v2.0 is now live!</p>
                      </a>
                      <a href="#" className="block px-4 py-3 hover:bg-white/5 transition-colors">
                        <p className="text-sm text-green-400 font-medium">Render Complete</p>
                        <p className="text-xs text-slate-300 mt-1">"Neon Streets" finished processing.</p>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="h-6 w-px bg-white/10"></div>

                <div className="relative" id="profile-container">
                  <div onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); setNotificationDropdownOpen(false); }} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 py-1 px-2 rounded-lg transition-colors group select-none">
                    <img src={profileImage} alt="Profile" className="w-7 h-7 rounded-full bg-indigo-900 border border-indigo-500/30 group-hover:border-indigo-400 transition-colors object-cover" />
                    <span className="text-sm font-medium text-slate-200 hidden sm:block">{profileName}</span>
                    <ChevronDown size={12} className="text-slate-500 ml-1 group-hover:text-white transition-colors" />
                  </div>

                  <div className={`dropdown-menu absolute right-0 top-12 w-56 bg-[#151925] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ${profileDropdownOpen ? 'open' : ''}`}>
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                      <p className="text-sm text-white font-medium">{profileName}</p>
                      
                    </div>
                    <div className="py-1">
                      <a href="#" onClick={(e) => { e.preventDefault(); openProfileModal(); }} className="block px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors">
                        <User size={14} className="inline mr-2" /> Profile
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); openSettingsModal(); }} className="block px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors">
                        <Settings size={14} className="inline mr-2" /> Settings
                      </a>
                    </div>
                    <div className="py-1 border-t border-white/5">
                      <a href="#"  onClick={() => navigate('/login')} className="block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={14} className="inline mr-2" /> Sign out
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="w-full relative z-10">
          <section id="home" className="min-h-screen flex flex-col justify-center pt-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="text-center space-y-8 animate-fade-in">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white leading-tight">
                  <span className="hacker-text" data-value="Refine Reality">Refine Reality</span>, <br />
                  <span className="gradient-text text-glow">One Pixel at a Time.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
                  Transform your ideas into reality. Editverse AI simplifies complex editing tasks, giving you the power to create stunning visuals in seconds, not hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button onClick={() => openModal('New Project', 'Start fresh')} className="btn-shimmer px-8 py-4 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                    <Sparkles className="group-hover:rotate-12 transition-transform" size={20} /> Start New Project
                  </button>
                  <button onClick={openHowItWorksModal} className="px-8 py-4 rounded-xl bg-white/5 text-white font-medium border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                    <Info size={20} /> How it Works
                  </button>
                </div>
              </div>
              <div ref={heroCardsRef} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 translate-y-10 transition-all duration-700 delay-300">
                <div onClick={() => openModal('Neon Streets', 'Rendered')} className="tilt-card rounded-xl p-5 flex gap-4 items-center group cursor-pointer bg-slate-900/50" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="spotlight-bg"></div>
                  <div className="w-16 h-16 rounded-lg bg-gray-800 relative overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1535370976884-f4376736ab06?q=80&w=200&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Neon Streets" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">Neon Streets</h3>
                    <p className="text-xs text-slate-500">Edited 2h ago</p>
                  </div>
                </div>
                <div onClick={() => openModal('Fluid Dynamics', 'Draft')} className="tilt-card rounded-xl p-5 flex gap-4 items-center group cursor-pointer bg-slate-900/50" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="spotlight-bg"></div>
                  <div className="w-16 h-16 rounded-lg bg-gray-800 relative overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Fluid Dynamics" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">Fluid Dynamics</h3>
                    <p className="text-xs text-slate-500">Edited yesterday</p>
                  </div>
                </div>
                <div onClick={() => openModal('New Workspace', 'Create')} className="tilt-card rounded-xl p-5 flex gap-4 items-center justify-center group cursor-pointer border-dashed border-slate-700 bg-transparent hover:bg-indigo-500/5" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-400 group-hover:text-white">New Workspace</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="projects" className="min-h-screen py-20 relative flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl font-bold text-white font-display mb-2">My Projects</h2>
                  <p className="text-slate-400">Manage and edit your creative assets.</p>
                </div>
              </div>

              <div className="relative w-full">
                <div ref={projectsGridRef} className="flex overflow-x-auto gap-8 pb-12 pt-12 snap-x snap-mandatory hide-scrollbar relative z-10" onScroll={updateHorizontalLine}>
                  <div id="horizontal-line-wrapper">
                    <div ref={horizontalTrackRef} className="horizontal-line-track"></div>
                    <div ref={projectScrollLineRef} className="horizontal-line-progress"></div>
                  </div>

                  <div onClick={() => openModal('New Project', 'Create')} className="tilt-card rounded-xl group flex flex-col h-[350px] min-w-[300px] md:min-w-[340px] bg-slate-900/80 border border-white/5 hover:border-indigo-500/50 transition-colors cursor-pointer justify-center items-center snap-center backdrop-blur-xl" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                    <div className="spotlight-bg"></div>
                    <div className="card-connector"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-500/20">
                        <Plus size={32} />
                      </div>
                      <h3 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">Create New</h3>
                      <p className="text-xs text-slate-500 mt-2">Start a fresh project</p>
                    </div>
                  </div>
{/*                   
                  <div onClick={() => openModal('Neon Streets', 'Rendered')} className="tilt-card rounded-xl group flex flex-col h-[350px] min-w-[300px] md:min-w-[340px] bg-slate-900/80 snap-center backdrop-blur-xl cursor-pointer" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                    <div className="spotlight-bg"></div>
                    <div className="card-connector"></div>
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="h-48 relative bg-gray-900 overflow-hidden rounded-t-xl">
                        <img src="https://images.unsplash.com/photo-1535370976884-f4376736ab06?q=80&w=600&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Neon Streets" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-green-400 border border-green-500/30 font-mono uppercase">Rendered</div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-white font-bold text-lg truncate group-hover:text-indigo-400 transition-colors">Neon Streets_Final</h3>
                          <p className="text-xs text-slate-500 mt-1">Edited 2h ago</p>
                        </div>
                        <div className="w-full mt-4 py-2 rounded bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 text-sm transition-all border border-white/5 text-center">Open Editor</div>
                      </div>
                    </div>
                  </div>


                  <div onClick={() => openModal('Abstract Mesh v2', 'Draft')} className="tilt-card rounded-xl group flex flex-col h-[350px] min-w-[300px] md:min-w-[340px] bg-slate-900/80 snap-center backdrop-blur-xl cursor-pointer" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                    <div className="spotlight-bg"></div>
                    <div className="card-connector"></div>
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="h-48 relative bg-gray-900 overflow-hidden rounded-t-xl">
                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Abstract Mesh" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-yellow-400 border border-yellow-500/30 font-mono uppercase">Draft</div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-white font-bold text-lg truncate group-hover:text-indigo-400 transition-colors">Abstract Mesh v2</h3>
                          <p className="text-xs text-slate-500 mt-1">Edited yesterday</p>
                        </div>
                        <div className="w-full mt-4 py-2 rounded bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 text-sm transition-all border border-white/5 text-center">Open Editor</div>
                      </div>
                    </div>
                  </div>

                  <div onClick={() => openModal('Product Shot Clean', 'Processing')} className="tilt-card rounded-xl group flex flex-col h-[350px] min-w-[300px] md:min-w-[340px] bg-slate-900/80 snap-center backdrop-blur-xl cursor-pointer" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                    <div className="spotlight-bg"></div>
                    <div className="card-connector"></div>
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="h-48 relative bg-gray-900 overflow-hidden rounded-t-xl">
                        <img src="https://images.unsplash.com/photo-1633113216056-0b8f2e0a9d04?q=80&w=600&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Product Shot" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-blue-400 border border-blue-500/30 font-mono uppercase">Processing</div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-white font-bold text-lg truncate group-hover:text-indigo-400 transition-colors">Product Shot_Clean</h3>
                          <p className="text-xs text-slate-500 mt-1">Edited 3d ago</p>
                        </div>
                        <div className="w-full mt-4 py-2 rounded bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 text-sm transition-all border border-white/5 text-center">Open Editor</div>
                      </div>
                    </div>
                  </div>

                  <div onClick={() => openModal('Cyberpunk City', 'Shared')} className="tilt-card rounded-xl group flex flex-col h-[350px] min-w-[300px] md:min-w-[340px] bg-slate-900/80 snap-center backdrop-blur-xl cursor-pointer" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                    <div className="spotlight-bg"></div>
                    <div className="card-connector"></div>
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="h-48 relative bg-gray-900 overflow-hidden rounded-t-xl">
                        <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Cyberpunk City" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-purple-400 border border-purple-500/30 font-mono uppercase">Shared</div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-white font-bold text-lg truncate group-hover:text-indigo-400 transition-colors">Cyberpunk City</h3>
                          <p className="text-xs text-slate-500 mt-1">Edited 5d ago</p>
                        </div>
                        <div className="w-full mt-4 py-2 rounded bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 text-sm transition-all border border-white/5 text-center">Open Editor</div>
                      </div>
                    </div>
                  </div> */}

                  <div className="tilt-card rounded-xl group flex flex-col h-[350px] min-w-[300px] md:min-w-[340px] bg-slate-900/80 snap-center backdrop-blur-xl cursor-pointer" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                    <div className="spotlight-bg"></div>
                    <div className="card-connector"></div>

                    <div className="relative z-10 h-full flex flex-col">

                      <div className="projects-grid">
                        {jobs.length === 0 ? (
                          <div className="project-card">
                             <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&fit=crop" className="w-full h-full object-fit transition-transform duration-700 " alt="Cyberpunk City" />
                             
                            <p>No recent projects yet.</p>
                          </div>
                          
                          
                          
                        ) : (
                          jobs.map((job) => (
                            <div key={job.id} className="project-card">

                              <div className="thumbnail-box">
                                <video src={`${API_URL}/jobs/${job.id}/download`} className="thumb-video" />
                              </div>

                              <div className="project-info">
                                <h3>Project {job.id.substring(0, 6)}</h3>
                                <p>Status: {job.status}</p>
                                <p>{new Date(job.created_at).toLocaleString()}</p>
                              </div>

                              <div className="actions">
                                <button onClick={() => openEditorWithJob(job.id)}>
                                  Open in Editor
                                </button>

                                <button onClick={() => handleDownload(job.id)}>
                                  Download
                                </button>
                              </div>

                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="community" className="relative bg-gradient-to-t from-black/40 to-transparent pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white font-display">Explore the Metaverse</h2>
                <p className="text-slate-400 mt-4 text-lg">Discover assets created by top designers around the world.</p>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                <div className="tilt-card rounded-2xl break-inside-avoid bg-slate-900/40" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="spotlight-bg"></div>
                  <div className="relative z-10 p-1">
                    <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop" className="w-full rounded-xl" alt="Community Art" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" className="w-6 h-6 rounded-full bg-slate-700" alt="Sarah" />
                          <span className="text-sm text-white font-medium">Sarah_Design</span>
                        </div>
                        <button
                          onClick={() => toggleLike('item1')}
                          className={`text-xs transition-colors flex items-center gap-1 ${likedItems.has('item1') ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                        >
                          <Heart size={14} className={likedItems.has('item1') ? 'fill-current' : ''} /> {likedItems.has('item1') ? '1.3k' : '1.2k'}
                        </button>
                      </div>
                      <h3 className="text-slate-200 font-bold">Glassmorphism UI Kit v2</h3>
                    </div>
                  </div>
                </div>

                <div className="tilt-card rounded-2xl break-inside-avoid bg-slate-900/40" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="spotlight-bg"></div>
                  <div className="relative z-10 p-1">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" className="w-full rounded-xl" alt="3D Render" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" className="w-6 h-6 rounded-full bg-slate-700" alt="Alex" />
                          <span className="text-sm text-white font-medium">Alex_3D</span>
                        </div>
                        <button
                          onClick={() => toggleLike('item2')}
                          className={`text-xs transition-colors flex items-center gap-1 ${likedItems.has('item2') ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                        >
                          <Heart size={14} className={likedItems.has('item2') ? 'fill-current' : ''} /> {likedItems.has('item2') ? '856' : '855'}
                        </button>
                      </div>
                      <h3 className="text-slate-200 font-bold">Abstract 3D Scene</h3>
                    </div>
                  </div>
                </div>



                <div className="tilt-card rounded-2xl break-inside-avoid bg-slate-900/40" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="spotlight-bg"></div>
                  <div className="relative z-10 p-1">
                    <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop" className="w-full rounded-xl" alt="Metaverse" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maya" className="w-6 h-6 rounded-full bg-slate-700" alt="Maya" />
                          <span className="text-sm text-white font-medium">Maya_VR</span>
                        </div>
                        <button
                          onClick={() => toggleLike('item3')}
                          className={`text-xs transition-colors flex items-center gap-1 ${likedItems.has('item3') ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                        >
                          <Heart size={14} className={likedItems.has('item3') ? 'fill-current' : ''} /> {likedItems.has('item3') ? '2.1k' : '2.0k'}
                        </button>
                      </div>
                      <h3 className="text-slate-200 font-bold">Virtual Reality Hub</h3>
                    </div>
                  </div>
                </div>

                <div className="tilt-card rounded-2xl break-inside-avoid bg-slate-900/40" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="spotlight-bg"></div>
                  <div className="relative z-10 p-1">
                    <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=600&auto=format&fit=crop" className="w-full rounded-xl" alt="NFT Art" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" className="w-6 h-6 rounded-full bg-slate-700" alt="Jordan" />
                          <span className="text-sm text-white font-medium">Jordan_NFT</span>
                        </div>
                        <button
                          onClick={() => toggleLike('item4')}
                          className={`text-xs transition-colors flex items-center gap-1 ${likedItems.has('item4') ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                        >
                          <Heart size={14} className={likedItems.has('item4') ? 'fill-current' : ''} /> {likedItems.has('item4') ? '543' : '542'}
                        </button>
                      </div>
                      <h3 className="text-slate-200 font-bold">Digital Collectibles</h3>
                    </div>
                  </div>
                </div>

                <div className="tilt-card rounded-2xl break-inside-avoid bg-slate-900/40" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="spotlight-bg"></div>
                  <div className="relative z-10 p-1">
                    <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop" className="w-full rounded-xl" alt="Cyberpunk" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Neo" className="w-6 h-6 rounded-full bg-slate-700" alt="Neo" />
                          <span className="text-sm text-white font-medium">Neo_Cyber</span>
                        </div>
                        <button
                          onClick={() => toggleLike('item5')}
                          className={`text-xs transition-colors flex items-center gap-1 ${likedItems.has('item5') ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                        >
                          <Heart size={14} className={likedItems.has('item5') ? 'fill-current' : ''} /> {likedItems.has('item5') ? '1.8k' : '1.7k'}
                        </button>
                      </div>
                      <h3 className="text-slate-200 font-bold">Cyberpunk City 2077</h3>
                    </div>
                  </div>
                </div>

                <div className="tilt-card rounded-2xl break-inside-avoid bg-slate-900/40" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="spotlight-bg"></div>
                  <div className="relative z-10 p-1">
                    <img src="https://images.unsplash.com/photo-1617802690658-1173a812650d?q=80&w=600&auto=format&fit=crop" className="w-full rounded-xl" alt="Futuristic" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Luna" className="w-6 h-6 rounded-full bg-slate-700" alt="Luna" />
                          <span className="text-sm text-white font-medium">Luna_AI</span>
                        </div>
                        <button
                          onClick={() => toggleLike('item6')}
                          className={`text-xs transition-colors flex items-center gap-1 ${likedItems.has('item6') ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                        >
                          <Heart size={14} className={likedItems.has('item6') ? 'fill-current' : ''} /> {likedItems.has('item6') ? '924' : '923'}
                        </button>
                      </div>
                      <h3 className="text-slate-200 font-bold">AI Generated Dreams</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div onClick={openContactModal} className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-500/40 hover:scale-110 hover:bg-indigo-500 transition-all">
          <Phone className="text-white" size={24} />
        </div>

        <div className={`modal-overlay fixed inset-0 z-[100] flex items-center justify-center ${modalOpen ? 'open' : ''}`}>
          <div className="absolute inset-0" onClick={closeModal}></div>
          <div className="relative bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-2xl p-8 modal-content shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white font-display">{modalTitle}</h2>
                {modalStatus && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono border border-indigo-500/30 text-indigo-400 bg-indigo-500/10">{modalStatus}</span>
                  </div>
                )}
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10">
                <X size={24} />
              </button>
            </div>
            <div>
              {modalType === 'settings' && (
                <SettingsContent
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  notificationsEnabled={notificationsEnabled}
                  setNotificationsEnabled={setNotificationsEnabled}
                  publicProfile={publicProfile}
                  setPublicProfile={setPublicProfile}
                  openChangePasswordModal={openChangePasswordModal}
                  profileEmail={profileEmail}
                />
              )}
              {modalType === 'profile' && (
                <ProfileEditContent
                  profileImage={tempProfileImage}
                  editName={editName}
                  setEditName={setEditName}
                  handleProfileImageChange={handleProfileImageChange}
                  saveProfile={saveProfile}
                />
              )}
              {(modalType === 'custom' || modalType === 'changePassword') && modalBody}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ToggleSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} className={`w-10 h-6 ${active ? 'bg-indigo-600' : 'bg-slate-600'} rounded-full relative cursor-pointer transition-colors duration-200`}>
      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200" style={{ transform: active ? 'translateX(100%)' : 'translateX(0)' }}></div>
    </div>
  );
}
function SettingsContent({
  isDarkMode,
  setIsDarkMode,
  notificationsEnabled,
  setNotificationsEnabled,
  publicProfile,
  setPublicProfile,
  openChangePasswordModal,
  profileEmail
}: {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  publicProfile: boolean;
  setPublicProfile: (val: boolean) => void;
  openChangePasswordModal: () => void;
  profileEmail: string;
}) {

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white/5 rounded-xl">
        <label className="block text-slate-400 text-sm mb-2">Account Email</label>
        <input type="text" value={profileEmail} readOnly className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white" />
      </div>
      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
        <span className="text-white">Dark Mode</span>
        <ToggleSwitch active={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
      </div>
      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
        <span className="text-white">Notifications</span>
        <ToggleSwitch active={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
      </div>
      <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
        <span className="text-white">Public Profile</span>
        <ToggleSwitch active={publicProfile} onToggle={() => setPublicProfile(!publicProfile)} />
      </div>
      <div className="p-4 bg-white/5 rounded-xl">
        <label className="block text-slate-400 text-sm mb-2">Language</label>
        <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white outline-none">
          <option className="bg-[#0B0F19] text-white">English (US)</option>
          <option className="bg-[#0B0F19] text-white">Spanish</option>
          <option className="bg-[#0B0F19] text-white">French</option>
          <option className="bg-[#0B0F19] text-white">Japanese</option>
        </select>
      </div>
      <div className="p-4 bg-white/5 rounded-xl">
        <label className="block text-slate-400 text-sm mb-2">Account Email</label>
        <input type="text" defaultValue="user@editverse.ai" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white mb-3" readOnly />
        <button onClick={openChangePasswordModal} className="w-full text-sm bg-white/5 py-2 rounded text-slate-300 hover:bg-white/10 transition">
          Change Password
        </button>
      </div>
    </div>
  );
}

function ProfileEditContent({
  profileImage,
  editName,
  setEditName,
  handleProfileImageChange,
  saveProfile
}: {
  profileImage: string;
  editName: string;
  setEditName: (val: string) => void;
  handleProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveProfile: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative group cursor-pointer" onClick={() => document.getElementById('modal-file-input')?.click()}>
        <img id="modal-profile-img" src={profileImage} className="w-24 h-24 rounded-full border-4 border-indigo-500/30 object-cover" alt="Profile" />
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="text-white" size={24} />
        </div>
      </div>
      <input type="file" id="modal-file-input" className="hidden" accept="image/*" onChange={handleProfileImageChange} />
      <div className="w-full space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-2">Display Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">Job Title</label>
          <input type="text" defaultValue="Senior Visual Designer" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-2">Bio</label>
          <textarea rows={3} defaultValue="Creating digital dreams." className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none" />
        </div>
      </div>
      <button onClick={saveProfile} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all">
        Save Changes
      </button>
    </div>
  );
}
export default Dashboard;