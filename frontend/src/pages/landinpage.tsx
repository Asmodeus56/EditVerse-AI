import React, { useRef, useEffect, useState } from "react";
// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import {
  ArrowRight,
  Instagram,
  Twitter,
  MessageCircle,
  Sparkles,
  Video,
  Zap,
  Check,
  Globe,
  Wand2,
  Clock,
  Target,
  Lightbulb,
  Rocket,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RealisticSmartphone from "../components/RealisticSmartphone";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const phoneFrameRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const insidePhoneRef = useRef<HTMLDivElement>(null);
  const section9Ref = useRef<HTMLDivElement>(null);
  const [insidePhone, setInsidePhone] = useState(false);

  useEffect(() => {
    if (
      !phoneRef.current ||
      !containerRef.current ||
      !section1Ref.current ||
      !section2Ref.current ||
      !section3Ref.current ||
      !section4Ref.current
    )
      return;

    // Calculate responsive positions based on window width
    const calculatePositions = () => {
      const vw = window.innerWidth;
      return {
        rightPos: vw * 0.25, // 25vw converted to pixels
        leftPos: -(vw * 0.25), // -25vw converted to pixels
      };
    };

    let positions = calculatePositions();

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(phoneRef.current, {
        x: positions.rightPos,
        rotateY: -2,
        rotateZ: 0,
        scale: 1,
        force3D: true,
      });

      // INDEPENDENT FLOATING ANIMATION (runs continuously, not scroll-linked)
      const floatAnim = gsap.to(phoneRef.current, {
        y: 8,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // SECTION 1 → SECTION 2: Right to Left with timeline
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: section1Ref.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl1.to(phoneRef.current, {
        x: positions.leftPos,
        rotateY: 2,
        rotateX: 1,
        scale: 0.98,
        ease: "power1.inOut",
        force3D: true,
      });

      // SECTION 2 → SECTION 3: Left to Right with timeline
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: section2Ref.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl2.to(phoneRef.current, {
        x: positions.rightPos,
        rotateY: -2,
        rotateX: -1,
        scale: 1,
        ease: "power1.inOut",
        force3D: true,
      });

      // SECTION 3 → SECTION 4: Move to center and prepare for rotation
      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: section3Ref.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl3.to(phoneRef.current, {
        x: 0,
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        ease: "power1.inOut",
        force3D: true,
      });

      // SECTION 4: Two-stage animation - Rotate THEN Zoom
      const tl4 = gsap.timeline({
        scrollTrigger: {
          trigger: section4Ref.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onEnter: () => {
            floatAnim.pause();
          },
          onLeaveBack: () => {
            floatAnim.resume();
          },
        },
      });

      // STAGE 1: Rotate to landscape (90 degrees) - 50% of animation
      tl4
        .to(phoneRef.current, {
          rotateZ: 90,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.inOut",
          force3D: true,
        })
        // STAGE 2: Zoom in while in landscape - 50% of animation
        .to(phoneRef.current, {
          scale: 2.5,
          duration: 0.5,
          ease: "power2.in",
          force3D: true,
        });

      // Section 4 content fade in/out
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section4Ref.current,
            start: "top center",
            end: "top top",
            scrub: true,
          },
        })
        .fromTo(
          "#section4-content",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: "power2.out" },
        );

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section4Ref.current,
            start: "center center",
            end: "bottom-=20% bottom",
            scrub: true,
          },
        })
        .to("#section4-content", {
          opacity: 0,
          y: -30,
          ease: "power2.in",
        });

      // Final zoom and fade out phone, show phone frame ONLY after zoom complete
      const tl5 = gsap.timeline({
        scrollTrigger: {
          trigger: section4Ref.current,
          start: "bottom-=10% bottom",
          end: "bottom bottom",
          scrub: true,
          onEnter: () => {
            setInsidePhone(true);
          },
          onLeaveBack: () => {
            setInsidePhone(false);
          },
        },
      });

      tl5.to(phoneRef.current, {
        scale: 15,
        opacity: 0,
        ease: "power2.in",
        force3D: true,
      });

      // Content transitions - Logo (Section 1)
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section1Ref.current,
            start: "center top",
            end: "bottom top",
            scrub: true,
          },
        })
        .to("#phone-content-logo", {
          opacity: 0,
          scale: 0.9,
          ease: "power2.inOut",
        });

      // Content transitions - Chat (Section 2)
      const chatInTl = gsap.timeline({
        scrollTrigger: {
          trigger: section1Ref.current,
          start: "center top",
          end: "bottom top",
          scrub: true,
        },
      });
      chatInTl.fromTo(
        "#phone-content-chat",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, ease: "power2.out" },
      );

      const chatOutTl = gsap.timeline({
        scrollTrigger: {
          trigger: section2Ref.current,
          start: "center top",
          end: "bottom top",
          scrub: true,
        },
      });
      chatOutTl.to("#phone-content-chat", {
        opacity: 0,
        scale: 0.9,
        ease: "power2.inOut",
      });

      // Content transitions - Robot (Section 3)
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section2Ref.current,
            start: "center top",
            end: "bottom top",
            scrub: true,
          },
        })
        .fromTo(
          "#phone-content-robot",
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, ease: "back.out(1.5)" },
        );

      // Fade out robot content before rotation
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section3Ref.current,
            start: "center top",
            end: "bottom top",
            scrub: true,
          },
        })
        .to("#phone-content-robot", {
          opacity: 0,
          scale: 0.9,
          ease: "power2.inOut",
        });
    });

    // Handle window resize - recalculate positions and update

    const handleResize = () => {
      positions = calculatePositions();

      // Update all ScrollTriggers with new positions
      ScrollTrigger.getAll().forEach((st) => st.kill());
      ctx.revert();

      // Reinitialize with new positions
      ctx.add(() => {
        gsap.set(phoneRef.current, {
          x: positions.rightPos,
          rotateY: -2,
          rotateZ: 0,
          scale: 1,
          force3D: true,
        });

        // Recreate all animations...
        const floatAnim = gsap.to(phoneRef.current, {
          y: 8,
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        const tl1 = gsap.timeline({
          scrollTrigger: {
            trigger: section1Ref.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        tl1.to(phoneRef.current, {
          x: positions.leftPos,
          rotateY: 2,
          rotateX: 1,
          scale: 0.98,
          ease: "power1.inOut",
          force3D: true,
        });

        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: section2Ref.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        tl2.to(phoneRef.current, {
          x: positions.rightPos,
          rotateY: -2,
          rotateX: -1,
          scale: 1,
          ease: "power1.inOut",
          force3D: true,
        });

        const tl3 = gsap.timeline({
          scrollTrigger: {
            trigger: section3Ref.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        tl3.to(phoneRef.current, {
          x: 0,
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          ease: "power1.inOut",
          force3D: true,
        });

        const tl4 = gsap.timeline({
          scrollTrigger: {
            trigger: section4Ref.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onEnter: () => {
              floatAnim.pause();
            },
            onLeaveBack: () => {
              floatAnim.resume();
            },
          },
        });

        // STAGE 1: Rotate to landscape (90 degrees) - 50% of animation
        tl4
          .to(phoneRef.current, {
            rotateZ: 90,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.inOut",
            force3D: true,
          })
          // STAGE 2: Zoom in while in landscape - 50% of animation
          .to(phoneRef.current, {
            scale: 2.5,
            duration: 0.5,
            ease: "power2.in",
            force3D: true,
          });

        // Section 4 content fade in/out
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section4Ref.current,
              start: "top center",
              end: "top top",
              scrub: true,
            },
          })
          .fromTo(
            "#section4-content",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, ease: "power2.out" },
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section4Ref.current,
              start: "center center",
              end: "bottom-=20% bottom",
              scrub: true,
            },
          })
          .to("#section4-content", {
            opacity: 0,
            y: -30,
            ease: "power2.in",
          });

        const tl5 = gsap.timeline({
          scrollTrigger: {
            trigger: section4Ref.current,
            start: "bottom-=10% bottom",
            end: "bottom bottom",
            scrub: true,
            onLeaveBack: () => {
              setInsidePhone(false);
            },
            onUpdate: (self) => {
              // Only show bezel when phone is completely faded out (at 95% progress or more)
              if (self.progress >= 0.95) {
                setInsidePhone(true);
              } else {
                setInsidePhone(false);
              }
            },
          },
        });
        tl5.to(phoneRef.current, {
          scale: 15,
          opacity: 0,
          ease: "power2.in",
          force3D: true,
        });

        // Recreate content transitions
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section1Ref.current,
              start: "center top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to("#phone-content-logo", {
            opacity: 0,
            scale: 0.9,
            ease: "power2.inOut",
          });

        const chatInTl = gsap.timeline({
          scrollTrigger: {
            trigger: section1Ref.current,
            start: "center top",
            end: "bottom top",
            scrub: true,
          },
        });
        chatInTl.fromTo(
          "#phone-content-chat",
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, ease: "power2.out" },
        );

        const chatOutTl = gsap.timeline({
          scrollTrigger: {
            trigger: section2Ref.current,
            start: "center top",
            end: "bottom top",
            scrub: true,
          },
        });
        chatOutTl.to("#phone-content-chat", {
          opacity: 0,
          scale: 0.9,
          ease: "power2.inOut",
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section2Ref.current,
              start: "center top",
              end: "bottom top",
              scrub: true,
            },
          })
          .fromTo(
            "#phone-content-robot",
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, ease: "back.out(1.5)" },
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section3Ref.current,
              start: "center top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to("#phone-content-robot", {
            opacity: 0,
            scale: 0.9,
            ease: "power2.inOut",
          });
      });
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="relative bg-[#050505]">
        {/* Phone Frame Overlay - Shows when inside phone */}
        {insidePhone && (
          <div
            ref={phoneFrameRef}
            className="fixed inset-0 z-[99999] pointer-events-none"
          >
            {/* Left Bezel - Ultra-detailed multi-layered bezel */}
            <div className="absolute left-0 top-0 bottom-0 w-[3.5vw]">
              {/* Outer chamfered edge */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#1e293b] shadow-[-8px_0_24px_rgba(0,0,0,0.9)]">
                {/* Mid-layer metallic frame with anodized texture */}
                <div className="absolute inset-[0.15vw] bg-gradient-to-r from-[#1e293b] via-[#334155] to-[#1e293b] shadow-[inset_-6px_0_16px_rgba(0,0,0,0.9),inset_2px_0_8px_rgba(255,255,255,0.03)]">
                  {/* Inner structural lip */}
                  <div className="absolute inset-y-0 right-[0.35vw] left-[0.1vw] bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#1e293b] shadow-[inset_-3px_0_10px_rgba(0,0,0,0.8)]">
                    {/* Deep bezel recession */}
                    <div className="absolute inset-y-0 right-[0.25vw] left-0 bg-gradient-to-r from-[#000000] via-[#0a0a0a] to-[#000000] shadow-[inset_-2px_0_8px_rgba(0,0,0,0.95)]">
                      {/* Screen edge separator with micro-chamfer */}
                      <div className="absolute right-0 top-0 bottom-0 w-[0.1vw] bg-gradient-to-r from-[#1a1a1a] via-[#0a0a0a] to-transparent"></div>
                    </div>
                  </div>
                  {/* Brushed metal texture overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none"
                    style={{ backgroundSize: "100% 2px" }}
                  ></div>
                  {/* Primary metallic sheen */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/[0.02] to-transparent pointer-events-none"></div>
                  {/* Secondary highlight for depth */}
                  <div className="absolute inset-y-[10%] left-0 w-[0.2vw] bg-gradient-to-r from-white/8 to-transparent pointer-events-none"></div>
                </div>
                {/* Outer edge highlight */}
                <div className="absolute inset-y-0 left-0 w-[0.08vw] bg-gradient-to-b from-transparent via-white/15 to-transparent pointer-events-none"></div>
              </div>

              {/* Enhanced Volume Buttons */}
              <div className="absolute left-[-0.05vw] top-[24vh] w-[0.5vw] h-[7vh] rounded-r-lg bg-gradient-to-l from-[#1e293b] via-[#334155] to-[#475569] shadow-[inset_-2px_0_4px_rgba(0,0,0,0.8),3px_0_6px_rgba(0,0,0,0.5)]">
                {/* Button inner surface */}
                <div className="absolute inset-[1.5px] rounded-r-lg bg-gradient-to-l from-[#334155] via-[#3f4f5f] to-[#475569] shadow-[inset_0_2px_2px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.3)]">
                  {/* Button pressed detail */}
                  <div className="absolute top-[2px] left-[1px] right-[1px] h-[30%] bg-gradient-to-b from-white/10 to-transparent rounded-r-lg"></div>
                </div>
                {/* Button edge chamfer */}
                <div className="absolute top-0 right-0 w-[0.08vw] h-full bg-gradient-to-l from-[#1e293b] to-transparent"></div>
              </div>
              <div className="absolute left-[-0.05vw] top-[33vh] w-[0.5vw] h-[7vh] rounded-r-lg bg-gradient-to-l from-[#1e293b] via-[#334155] to-[#475569] shadow-[inset_-2px_0_4px_rgba(0,0,0,0.8),3px_0_6px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-[1.5px] rounded-r-lg bg-gradient-to-l from-[#334155] via-[#3f4f5f] to-[#475569] shadow-[inset_0_2px_2px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.3)]">
                  <div className="absolute top-[2px] left-[1px] right-[1px] h-[30%] bg-gradient-to-b from-white/10 to-transparent rounded-r-lg"></div>
                </div>
                <div className="absolute top-0 right-0 w-[0.08vw] h-full bg-gradient-to-l from-[#1e293b] to-transparent"></div>
              </div>
            </div>

            {/* Right Bezel - Ultra-detailed multi-layered bezel */}
            <div className="absolute right-0 top-0 bottom-0 w-[3.5vw]">
              {/* Outer chamfered edge */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#0f172a] via-[#1e293b] to-[#1e293b] shadow-[8px_0_24px_rgba(0,0,0,0.9)]">
                {/* Mid-layer metallic frame with anodized texture */}
                <div className="absolute inset-[0.15vw] bg-gradient-to-l from-[#1e293b] via-[#334155] to-[#1e293b] shadow-[inset_6px_0_16px_rgba(0,0,0,0.9),inset_-2px_0_8px_rgba(255,255,255,0.03)]">
                  {/* Inner structural lip */}
                  <div className="absolute inset-y-0 left-[0.35vw] right-[0.1vw] bg-gradient-to-l from-[#0f172a] via-[#1e293b] to-[#1e293b] shadow-[inset_3px_0_10px_rgba(0,0,0,0.8)]">
                    {/* Deep bezel recession */}
                    <div className="absolute inset-y-0 left-[0.25vw] right-0 bg-gradient-to-l from-[#000000] via-[#0a0a0a] to-[#000000] shadow-[inset_2px_0_8px_rgba(0,0,0,0.95)]">
                      {/* Screen edge separator with micro-chamfer */}
                      <div className="absolute left-0 top-0 bottom-0 w-[0.1vw] bg-gradient-to-l from-[#1a1a1a] via-[#0a0a0a] to-transparent"></div>
                    </div>
                  </div>
                  {/* Brushed metal texture overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none"
                    style={{ backgroundSize: "100% 2px" }}
                  ></div>
                  {/* Primary metallic sheen */}
                  <div className="absolute inset-0 bg-gradient-to-bl from-white/12 via-white/[0.02] to-transparent pointer-events-none"></div>
                  {/* Secondary highlight for depth */}
                  <div className="absolute inset-y-[10%] right-0 w-[0.2vw] bg-gradient-to-l from-white/8 to-transparent pointer-events-none"></div>
                </div>
                {/* Outer edge highlight */}
                <div className="absolute inset-y-0 right-0 w-[0.08vw] bg-gradient-to-b from-transparent via-white/15 to-transparent pointer-events-none"></div>
              </div>

              {/* Enhanced Power Button */}
              <div className="absolute right-[-0.05vw] top-[28vh] w-[0.6vw] h-[9vh] rounded-l-lg bg-gradient-to-r from-[#1e293b] via-[#334155] to-[#475569] shadow-[inset_2px_0_4px_rgba(0,0,0,0.8),-3px_0_8px_rgba(0,0,0,0.6)]">
                {/* Button inner surface */}
                <div className="absolute inset-[1.5px] rounded-l-lg bg-gradient-to-r from-[#334155] via-[#3f4f5f] to-[#475569] shadow-[inset_0_2px_3px_rgba(255,255,255,0.18),inset_0_-1px_2px_rgba(0,0,0,0.4)]">
                  {/* Button pressed detail */}
                  <div className="absolute top-[2px] left-[1px] right-[1px] h-[35%] bg-gradient-to-b from-white/15 to-transparent rounded-l-lg"></div>
                  {/* Tactile indicator line */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-[2px] right-[2px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                {/* Button edge chamfer */}
                <div className="absolute top-0 left-0 w-[0.08vw] h-full bg-gradient-to-r from-[#1e293b] to-transparent"></div>
              </div>
            </div>

            {/* Top Bezel - Ultra-detailed multi-layered bezel with Dynamic Island */}
            <div className="absolute top-0 left-0 right-0 h-[3vh]">
              {/* Outer chamfered edge */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#1e293b] shadow-[0_-8px_24px_rgba(0,0,0,0.9)]">
                {/* Mid-layer metallic frame with anodized texture */}
                <div className="absolute inset-[0.15vh_0.15vw] bg-gradient-to-b from-[#1e293b] via-[#334155] to-[#1e293b] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.9),inset_0_2px_8px_rgba(255,255,255,0.03)]">
                  {/* Inner structural lip */}
                  <div className="absolute inset-x-[0.35vw] bottom-[0.35vh] top-[0.1vh] bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#1e293b] shadow-[inset_0_-3px_10px_rgba(0,0,0,0.8)]">
                    {/* Deep bezel recession */}
                    <div className="absolute inset-x-0 bottom-[0.25vh] top-0 bg-gradient-to-b from-[#000000] via-[#0a0a0a] to-[#000000] shadow-[inset_0_-2px_8px_rgba(0,0,0,0.95)] flex items-center justify-center">
                      {/* Screen edge separator with micro-chamfer */}
                      <div className="absolute bottom-0 left-0 right-0 h-[0.1vh] bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-transparent"></div>

                      {/* Enhanced Dynamic Island with hardware */}
                      <div className="relative w-[130px] h-[36px] bg-gradient-to-b from-[#000000] to-[#0a0a0a] rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.03),inset_0_-1px_2px_rgba(0,0,0,0.8)]">
                        {/* Island inner depression */}
                        <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-[#000000] via-[#050505] to-[#000000] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
                          {/* Selfie Camera Module */}
                          <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,0.8)]">
                            {/* Camera lens glass */}
                            <div className="absolute inset-[2.5px] rounded-full bg-gradient-to-br from-[#1e3a5f] via-[#0f1820] to-[#000000] shadow-[0_0_3px_rgba(59,130,246,0.4),inset_0_1px_2px_rgba(59,130,246,0.2)]">
                              {/* Lens multi-coating reflection */}
                              <div className="absolute top-[1.5px] left-[1.5px] w-[3.5px] h-[3.5px] rounded-full bg-gradient-to-br from-white/50 via-blue-200/30 to-transparent"></div>
                              {/* Secondary reflection */}
                              <div className="absolute bottom-[1px] right-[1px] w-[2px] h-[2px] rounded-full bg-white/20"></div>
                            </div>
                          </div>

                          {/* Proximity Sensor */}
                          <div className="absolute right-[25px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[#0a0a0a] shadow-[inset_0_2px_3px_rgba(0,0,0,0.95)]">
                            <div className="absolute inset-[1.5px] rounded-full bg-gradient-to-br from-[#1a0a0a] via-[#0f0505] to-[#0a0000] opacity-70">
                              {/* IR emitter glow */}
                              <div className="absolute inset-[1px] rounded-full bg-gradient-radial from-red-900/20 to-transparent"></div>
                            </div>
                          </div>

                          {/* Ambient Light Sensor */}
                          <div className="absolute right-[35px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[#0a0a0a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.95)] opacity-60">
                            <div className="absolute inset-[1px] rounded-full bg-gradient-to-br from-[#0f0f0f] to-[#000000]"></div>
                          </div>

                          {/* Microphone Hole */}
                          <div className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-[#000000] shadow-[inset_0_1px_2px_rgba(0,0,0,1)] opacity-80"></div>
                        </div>
                        {/* Island edge highlight */}
                        <div className="absolute inset-[1px] rounded-full bg-gradient-to-t from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                  {/* Brushed metal texture overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none"
                    style={{ backgroundSize: "2px 100%" }}
                  ></div>
                  {/* Primary metallic sheen */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/[0.02] to-transparent pointer-events-none"></div>
                  {/* Secondary highlight for depth */}
                  <div className="absolute inset-x-[10%] top-0 h-[0.2vh] bg-gradient-to-b from-white/8 to-transparent pointer-events-none"></div>
                </div>
                {/* Outer edge highlight */}
                <div className="absolute inset-x-0 top-0 h-[0.08vh] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"></div>
              </div>

              {/* Enhanced Speaker Grille */}
              <div className="absolute top-[0.85vh] left-1/2 -translate-x-1/2 translate-x-[65px] w-[45px] h-[3.5px] rounded-full bg-gradient-to-b from-[#000000] via-[#0a0a0a] to-[#000000] shadow-[inset_0_1.5px_3px_rgba(0,0,0,1)] opacity-50">
                {/* Grille mesh simulation */}
                <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                  <div className="w-[1px] h-[60%] bg-black/40 rounded-full"></div>
                  <div className="w-[1px] h-[60%] bg-black/40 rounded-full"></div>
                  <div className="w-[1px] h-[60%] bg-black/40 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Bottom Bezel - Ultra-detailed multi-layered bezel */}
            <div className="absolute bottom-0 left-0 right-0 h-[3vh]">
              {/* Outer chamfered edge */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#1e293b] to-[#1e293b] shadow-[0_8px_24px_rgba(0,0,0,0.9)]">
                {/* Mid-layer metallic frame with anodized texture */}
                <div className="absolute inset-[0.15vh_0.15vw] bg-gradient-to-t from-[#1e293b] via-[#334155] to-[#1e293b] shadow-[inset_0_6px_16px_rgba(0,0,0,0.9),inset_0_-2px_8px_rgba(255,255,255,0.03)]">
                  {/* Inner structural lip */}
                  <div className="absolute inset-x-[0.35vw] top-[0.35vh] bottom-[0.1vh] bg-gradient-to-t from-[#0f172a] via-[#1e293b] to-[#1e293b] shadow-[inset_0_3px_10px_rgba(0,0,0,0.8)]">
                    {/* Deep bezel recession */}
                    <div className="absolute inset-x-0 top-[0.25vh] bottom-0 bg-gradient-to-t from-[#000000] via-[#0a0a0a] to-[#000000] shadow-[inset_0_2px_8px_rgba(0,0,0,0.95)]">
                      {/* Screen edge separator with micro-chamfer */}
                      <div className="absolute top-0 left-0 right-0 h-[0.1vh] bg-gradient-to-t from-[#1a1a1a] via-[#0a0a0a] to-transparent"></div>
                    </div>
                  </div>
                  {/* Brushed metal texture overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none"
                    style={{ backgroundSize: "2px 100%" }}
                  ></div>
                  {/* Primary metallic sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/12 via-white/[0.02] to-transparent pointer-events-none"></div>
                  {/* Secondary highlight for depth */}
                  <div className="absolute inset-x-[10%] bottom-0 h-[0.2vh] bg-gradient-to-t from-white/8 to-transparent pointer-events-none"></div>
                </div>
                {/* Outer edge highlight */}
                <div className="absolute inset-x-0 bottom-0 h-[0.08vh] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"></div>
              </div>
            </div>

            {/* Enhanced inner screen frame glow */}
            <div className="absolute inset-[3.5vw] inset-y-[3vh] border-[0.5px] border-[#334155]/20 rounded-[4px] pointer-events-none shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]"></div>
            {/* Corner accent details */}
            <div className="absolute top-[3vh] left-[3.5vw] w-[1vw] h-[1vh] border-l-[0.5px] border-t-[0.5px] border-[#475569]/40 rounded-tl-[4px] pointer-events-none"></div>
            <div className="absolute top-[3vh] right-[3.5vw] w-[1vw] h-[1vh] border-r-[0.5px] border-t-[0.5px] border-[#475569]/40 rounded-tr-[4px] pointer-events-none"></div>
            <div className="absolute bottom-[3vh] left-[3.5vw] w-[1vw] h-[1vh] border-l-[0.5px] border-b-[0.5px] border-[#475569]/40 rounded-bl-[4px] pointer-events-none"></div>
            <div className="absolute bottom-[3vh] right-[3.5vw] w-[1vw] h-[1vh] border-r-[0.5px] border-b-[0.5px] border-[#475569]/40 rounded-br-[4px] pointer-events-none"></div>
          </div>
        )}

        {/* SINGLE SMARTPHONE - Fixed vertically, moves horizontally with premium GSAP animation */}
        <div
          className="fixed z-[5] pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            willChange: "transform",
          }}
        >
          <RealisticSmartphone ref={phoneRef} />
        </div>

        {/* SECTION 1: The Hook (Hero) */}
        <section
          ref={section1Ref}
          className="min-h-screen flex items-center justify-center px-8 py-20 relative overflow-hidden"
        >
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <motion.h1
                  className="text-7xl lg:text-8xl bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#8b5cf6] bg-clip-text text-transparent mb-4 bg-[length:200%]"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  Create Stunning Videos
                </motion.h1>
                <p className="text-2xl text-[#f8fafc]/60 tracking-wide">
                  With Just a Chat
                </p>
              </motion.div>

              <motion.p
                className="text-xl text-[#f8fafc]/70 leading-relaxed max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: false, amount: 0.2 }}
              >
                The AI-powered editor that understands context. Describe your
                scene, and we build the universe around it.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <motion.button
                  onClick={() => navigate("/login")}
                  className="group mt-4 px-10 py-5 bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] rounded-full text-[#f8fafc] flex items-center gap-3 hover:shadow-2xl hover:shadow-[#8b5cf6]/50 transition-all duration-300 text-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Creating
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>

              <motion.div
                className="flex gap-8 pt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl text-[#f8fafc]">10M+</p>
                    <p className="text-sm text-[#f8fafc]/60">Videos Created</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#8b5cf6] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl text-[#f8fafc]">4.9/5</p>
                    <p className="text-sm text-[#f8fafc]/60">User Rating</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <div></div>
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#38bdf8] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -100],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </section>

        {/* SECTION 2: Demo - AI Chat Interface */}
        <section
          ref={section2Ref}
          className="min-h-screen flex items-center justify-center px-8 py-20 relative overflow-hidden"
        >
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="hidden lg:block"></div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-8"
            >
              <motion.h2
                className="text-5xl lg:text-6xl text-[#f8fafc] mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: false, amount: 0.2 }}
              >
                Edit via{" "}
                <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                  Conversation
                </span>
                .
              </motion.h2>

              <motion.p
                className="text-xl text-[#f8fafc]/70 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: false, amount: 0.2 }}
              >
                No complex software. Just text Editverse what you need, and the
                AI renders it instantly.
              </motion.p>

              <motion.div
                className="space-y-5 pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: false, amount: 0.2 }}
              >
                {[
                  {
                    num: 1,
                    title: "Describe Your Vision",
                    desc: "Tell the AI what you want to change or create",
                    color: "from-[#8b5cf6] to-[#a78bfa]",
                  },
                  {
                    num: 2,
                    title: "AI Understands Context",
                    desc: "Our engine analyzes your entire scene",
                    color: "from-[#38bdf8] to-[#0ea5e9]",
                  },
                  {
                    num: 3,
                    title: "Instant Results",
                    desc: "Watch your edits come to life in real-time",
                    color: "from-[#8b5cf6] to-[#38bdf8]",
                  },
                ].map((step) => (
                  <motion.div
                    key={step.num}
                    className="flex items-start gap-5 bg-[#0f172a]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-all duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: false, amount: 0.2 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <div
                      className={`min-w-[60px] h-[60px] rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-2xl text-white">{step.num}</span>
                    </div>
                    <div>
                      <h3 className="text-xl text-[#f8fafc] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[#f8fafc]/60">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-3xl"
              style={{ top: "20%", right: "10%" }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </section>

        {/* SECTION 3: Success - Happy Robot */}
        <section
          ref={section3Ref}
          className="min-h-screen flex items-center justify-center px-8 py-20 relative overflow-hidden"
        >
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-8"
            >
              <motion.h2
                className="text-5xl lg:text-6xl text-[#f8fafc] mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: false, amount: 0.2 }}
              >
                Videos That{" "}
                <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                  Convert
                </span>
                .
              </motion.h2>

              <motion.p
                className="text-xl text-[#f8fafc]/70 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: false, amount: 0.2 }}
              >
                Join 50,000+ creators who've transformed their content strategy
                with Editverse AI.
              </motion.p>

              <motion.div
                className="grid grid-cols-2 gap-6 pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                {[
                  {
                    value: "10M+",
                    label: "Videos Created",
                    icon: Video,
                    color: "from-[#8b5cf6] to-[#a78bfa]",
                  },
                  {
                    value: "95%",
                    label: "Time Saved",
                    icon: Clock,
                    color: "from-[#38bdf8] to-[#0ea5e9]",
                  },
                  {
                    value: "4.9/5",
                    label: "User Rating",
                    icon: Sparkles,
                    color: "from-[#8b5cf6] to-[#38bdf8]",
                  },
                  {
                    value: "190+",
                    label: "Countries",
                    icon: Globe,
                    color: "from-[#38bdf8] to-[#8b5cf6]",
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={i}
                      className="bg-[#0f172a]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: false, amount: 0.2 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-3xl text-[#f8fafc] mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-[#f8fafc]/60">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            <div></div>
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-96 h-96 bg-[#38bdf8]/20 rounded-full blur-3xl"
              style={{ top: "30%", left: "10%" }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </section>

        {/* Phone Landscape Transition - Sections 4-9 inside phone */}
        <div ref={phoneContainerRef} className="relative">
          {/* SECTION 4: Transition Section */}
          <section
            ref={section4Ref}
            className="h-[150vh] flex items-center justify-center px-8 py-20 relative overflow-hidden"
          >
            <div
              id="section4-content"
              className="max-w-4xl mx-auto text-center relative z-10"
            >
              <h2 className="text-4xl lg:text-6xl text-[#f8fafc] mb-6">
                Step Inside The{" "}
                <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                  Future
                </span>
              </h2>
              <p className="text-xl text-[#f8fafc]/70 max-w-2xl mx-auto">
                Discover how Editverse AI transforms your creative workflow
              </p>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#8b5cf6] rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </section>

          {/* SECTION 5: How It Works */}
          <section className="min-h-screen flex items-center justify-center px-8 py-20 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <h2 className="text-4xl lg:text-5xl text-[#f8fafc] mb-4">
                  How It{" "}
                  <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                    Works
                  </span>
                </h2>
                <p className="text-xl text-[#f8fafc]/70">
                  Four simple steps to video perfection
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: "01",
                    title: "Upload",
                    desc: "Drop your raw footage or start from scratch",
                    icon: Video,
                    color: "from-[#8b5cf6] to-[#a78bfa]",
                  },
                  {
                    step: "02",
                    title: "Chat",
                    desc: "Describe your vision in plain English",
                    icon: MessageCircle,
                    color: "from-[#38bdf8] to-[#0ea5e9]",
                  },
                  {
                    step: "03",
                    title: "AI Edits",
                    desc: "Watch as AI applies professional edits instantly",
                    icon: Wand2,
                    color: "from-[#8b5cf6] to-[#38bdf8]",
                  },
                  {
                    step: "04",
                    title: "Export",
                    desc: "Download in any format, ready to share",
                    icon: Zap,
                    color: "from-[#38bdf8] to-[#8b5cf6]",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={i}
                      className="bg-[#0f172a]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-all duration-300"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: false, amount: 0.2 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-6xl text-[#8b5cf6]/20 mb-2">
                        {item.step}
                      </div>
                      <h3 className="text-2xl text-[#f8fafc] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-[#f8fafc]/60">{item.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl"
                style={{ top: "20%", left: "20%" }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </section>

          {/* SECTION 6: Use Cases */}
          <section className="min-h-screen flex items-center justify-center px-8 py-20 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <h2 className="text-4xl lg:text-5xl text-[#f8fafc] mb-4">
                  Perfect For{" "}
                  <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                    Everyone
                  </span>
                </h2>
                <p className="text-xl text-[#f8fafc]/70">
                  From solo creators to enterprise teams
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Content Creators",
                    desc: "Turn raw clips into viral content in minutes, not hours",
                    icon: Instagram,
                    gradient: "from-[#8b5cf6] to-[#a78bfa]",
                    features: [
                      "YouTube videos",
                      "TikTok shorts",
                      "Instagram Reels",
                    ],
                  },
                  {
                    title: "Marketing Teams",
                    desc: "Scale video production without scaling your team",
                    icon: Sparkles,
                    gradient: "from-[#38bdf8] to-[#0ea5e9]",
                    features: ["Product demos", "Ad campaigns", "Social media"],
                  },
                  {
                    title: "Educators",
                    desc: "Create engaging lessons with professional polish",
                    icon: Video,
                    gradient: "from-[#8b5cf6] to-[#38bdf8]",
                    features: ["Online courses", "Tutorials", "Presentations"],
                  },
                  {
                    title: "Agencies",
                    desc: "Deliver more client projects, faster than ever",
                    icon: Globe,
                    gradient: "from-[#38bdf8] to-[#8b5cf6]",
                    features: ["Client videos", "Branded content", "Campaigns"],
                  },
                  {
                    title: "Podcasters",
                    desc: "Transform audio into engaging video content",
                    icon: MessageCircle,
                    gradient: "from-[#8b5cf6] to-[#a78bfa]",
                    features: ["Video podcasts", "Clips", "Highlights"],
                  },
                  {
                    title: "Businesses",
                    desc: "Professional video content for your brand",
                    icon: Zap,
                    gradient: "from-[#38bdf8] to-[#0ea5e9]",
                    features: [
                      "Training videos",
                      "Internal comms",
                      "Marketing",
                    ],
                  },
                ].map((useCase, i) => {
                  const Icon = useCase.icon;
                  return (
                    <motion.div
                      key={i}
                      className="bg-[#0f172a]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-all duration-300 group"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: false, amount: 0.2 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl text-[#f8fafc] mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-[#f8fafc]/60 mb-4">{useCase.desc}</p>
                      <ul className="space-y-2">
                        {useCase.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-[#f8fafc]/70 text-sm"
                          >
                            <Check className="w-4 h-4 text-[#8b5cf6]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl"
                style={{ bottom: "20%", right: "20%" }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </section>

          {/* SECTION 7: Social Proof */}
          <section className="min-h-screen flex items-center justify-center px-8 py-20 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <h2 className="text-4xl lg:text-5xl text-[#f8fafc] mb-4">
                  Trusted By{" "}
                  <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                    Creators Worldwide
                  </span>
                </h2>
                <p className="text-xl text-[#f8fafc]/70">
                  Join 50,000+ creators making better videos
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {[
                  {
                    name: "Sarah Chen",
                    role: "YouTuber - 2M subscribers",
                    quote:
                      "Editverse cut my editing time from 6 hours to 30 minutes. Game changer.",
                    avatar: "SC",
                    rating: 5,
                  },
                  {
                    name: "Marcus Thompson",
                    role: "Marketing Director",
                    quote:
                      "We've 10x'd our video output without hiring more editors. ROI is insane.",
                    avatar: "MT",
                    rating: 5,
                  },
                  {
                    name: "Elena Rodriguez",
                    role: "Course Creator",
                    quote:
                      "My students say my videos look more professional than ever. Thank you!",
                    avatar: "ER",
                    rating: 5,
                  },
                  {
                    name: "David Kim",
                    role: "TikTok Creator",
                    quote:
                      "I went from 50k to 500k followers using Editverse. The AI just gets it.",
                    avatar: "DK",
                    rating: 5,
                  },
                  {
                    name: "Priya Sharma",
                    role: "Podcast Host",
                    quote:
                      "Turning my audio podcasts into video was never this easy. Brilliant tool!",
                    avatar: "PS",
                    rating: 5,
                  },
                  {
                    name: "James Wilson",
                    role: "Agency Owner",
                    quote:
                      "Our clients think we hired 3 new editors. It's just Editverse AI.",
                    avatar: "JW",
                    rating: 5,
                  },
                ].map((testimonial, i) => (
                  <motion.div
                    key={i}
                    className="bg-[#0f172a]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/40 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: false, amount: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center">
                        <span className="text-white">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <h4 className="text-[#f8fafc]">{testimonial.name}</h4>
                        <p className="text-sm text-[#f8fafc]/60">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, idx) => (
                        <Sparkles
                          key={idx}
                          className="w-4 h-4 text-[#8b5cf6] fill-[#8b5cf6]"
                        />
                      ))}
                    </div>
                    <p className="text-[#f8fafc]/70 italic">
                      "{testimonial.quote}"
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                {[
                  { value: "10M+", label: "Videos Created" },
                  { value: "50K+", label: "Active Users" },
                  { value: "4.9/5", label: "Average Rating" },
                  { value: "190+", label: "Countries" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: false, amount: 0.2 }}
                  >
                    <p className="text-4xl text-[#f8fafc] mb-1 bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-sm text-[#f8fafc]/60">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* SECTION 8: About Us */}
          <section className="min-h-screen flex items-center justify-center px-8 py-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                className="text-center mb-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8b5cf6]/20 to-[#38bdf8]/20 border border-[#8b5cf6]/30 mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: false, amount: 0.2 }}
                >
                  <Rocket className="w-5 h-5 text-[#8b5cf6]" />
                  <span className="text-[#f8fafc]/80">About Editverse Ai</span>
                </motion.div>

                <h2 className="text-5xl lg:text-7xl text-[#f8fafc] mb-6">
                  Our{" "}
                  <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                    Vision
                  </span>
                </h2>
                <p className="text-2xl text-[#f8fafc]/60 max-w-3xl mx-auto">
                  Building a universe where human intent is the only command
                  necessary
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Mission Statement Card */}
                <motion.div
                  className="lg:col-span-2 bg-gradient-to-br from-[#0f172a]/80 to-[#1e293b]/80 backdrop-blur-sm border border-[#8b5cf6]/20 rounded-3xl p-10 lg:p-12 hover:border-[#8b5cf6]/40 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: false, amount: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-6">
                    <div className="min-w-[70px] h-[70px] rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/50">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl text-[#f8fafc] mb-4">
                        Our Mission
                      </h3>
                      <p className="text-xl text-[#f8fafc]/80 leading-relaxed mb-4">
                        Editverse Ai was founded on a simple belief: that the
                        most powerful creative tools should also be the
                        simplest. We saw video editing bogged down by complex
                        software, endless menus, and hours of rendering.
                      </p>
                      <p className="text-xl text-[#f8fafc]/80 leading-relaxed">
                        Our mission is to eliminate the technical barrier
                        between an idea and a final cut, empowering creators to
                        focus on what truly matters—their vision.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Core Principles */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <h3 className="text-3xl lg:text-4xl text-[#f8fafc] mb-10 text-center">
                  Built on Three{" "}
                  <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                    Core Principles
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: MessageCircle,
                      title: "Simplicity First",
                      description:
                        "Replace complexity with conversation. Natural language commands eliminate the learning curve.",
                      gradient: "from-[#8b5cf6]/10 to-[#8b5cf6]/5",
                      iconBg: "from-[#8b5cf6] to-[#7c3aed]",
                    },
                    {
                      icon: Lightbulb,
                      title: "Context-Aware AI",
                      description:
                        "AI that understands the scene, not just the frame. Intelligent editing that knows your intent.",
                      gradient: "from-[#38bdf8]/10 to-[#38bdf8]/5",
                      iconBg: "from-[#38bdf8] to-[#0ea5e9]",
                    },
                    {
                      icon: Sparkles,
                      title: "Boundless Creation",
                      description:
                        "Empowering creators to realize impossible visions, instantly. No limits, only possibilities.",
                      gradient: "from-[#8b5cf6]/10 to-[#38bdf8]/10",
                      iconBg: "from-[#8b5cf6] to-[#38bdf8]",
                    },
                  ].map((principle, i) => {
                    const Icon = principle.icon;
                    return (
                      <motion.div
                        key={i}
                        className={`bg-gradient-to-br ${principle.gradient} backdrop-blur-sm border border-[#8b5cf6]/20 rounded-2xl p-8 hover:border-[#8b5cf6]/50 transition-all duration-300 group`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                        viewport={{ once: false, amount: 0.2 }}
                        whileHover={{ scale: 1.05, y: -10 }}
                      >
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${principle.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-[#8b5cf6]/50 transition-all duration-300`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-2xl text-[#f8fafc] mb-3 group-hover:text-[#8b5cf6] transition-colors duration-300">
                          {principle.title}
                        </h4>
                        <p className="text-lg text-[#f8fafc]/70 leading-relaxed">
                          {principle.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Call to Join */}
              <motion.div
                className="text-center pt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <div className="inline-block px-8 py-6 rounded-2xl bg-gradient-to-r from-[#8b5cf6]/10 to-[#38bdf8]/10 border border-[#8b5cf6]/30">
                  <p className="text-2xl lg:text-3xl text-[#f8fafc] mb-2">
                    Join us in defining the next decade
                  </p>
                  <p className="text-3xl lg:text-4xl bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                    of digital storytelling
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-3xl"
                style={{ top: "10%", right: "10%" }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute w-96 h-96 bg-[#38bdf8]/20 rounded-full blur-3xl"
                style={{ bottom: "10%", left: "10%" }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </section>

          {/* SECTION 9: Final CTA */}
          <section
            ref={section9Ref}
            className="min-h-screen flex items-center justify-center px-8 py-20 relative overflow-hidden"
          >
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
                className="space-y-8"
              >
                <motion.h2
                  className="text-5xl lg:text-7xl text-[#f8fafc] mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, amount: 0.2 }}
                >
                  Ready to Create{" "}
                  <span
                    className="bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#8b5cf6] bg-clip-text text-transparent bg-[length:200%] inline-block"
                    style={{
                      animation: "gradient 8s linear infinite",
                    }}
                  >
                    Magic
                  </span>
                  ?
                </motion.h2>

                <motion.p
                  className="text-2xl text-[#f8fafc]/70 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, amount: 0.2 }}
                >
                  Join thousands of creators who've transformed their video
                  workflow with AI
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, amount: 0.2 }}
                >
                  <motion.button
                    onClick={() => navigate("/login")}
                    className="group px-12 py-5 bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] rounded-full text-[#f8fafc] text-xl flex items-center gap-3 hover:shadow-2xl hover:shadow-[#8b5cf6]/50 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Creating For Free
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <motion.button
                    className="px-12 py-5 bg-[#1e293b] hover:bg-[#334155] rounded-full text-[#f8fafc] text-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Watch Demo
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#8b5cf6] rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, -100],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="relative bg-[#0a0a0a] border-t border-[#8b5cf6]/20 py-16 px-8 z-50 w-full">
          <div className="w-full px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand Section */}
              <div className="space-y-4">
                <h3 className="text-2xl text-[#f8fafc] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#8b5cf6]" />
                  Editverse AI
                </h3>
                <p className="text-[#f8fafc]/60">
                  Transform your videos with AI-powered editing magic
                </p>
              </div>

              {/* Product Links */}
              <div className="space-y-4">
                <h4 className="text-[#f8fafc] text-lg">Product</h4>
                <ul className="space-y-2">
                  {["Features", "Demo", "API", "Integrations"].map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[#f8fafc]/60 hover:text-[#8b5cf6] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div className="space-y-4">
                <h4 className="text-[#f8fafc] text-lg">Company</h4>
                <ul className="space-y-2">
                  {["About", "Blog", "Careers", "Press", "Contact"].map(
                    (link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-[#f8fafc]/60 hover:text-[#8b5cf6] transition-colors"
                        >
                          {link}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Resources Links */}
              <div className="space-y-4">
                <h4 className="text-[#f8fafc] text-lg">Resources</h4>
                <ul className="space-y-2">
                  {[
                    "Documentation",
                    "Tutorials",
                    "Support",
                    "Community",
                    "Status",
                  ].map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[#f8fafc]/60 hover:text-[#8b5cf6] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-[#8b5cf6]/10 flex flex-col items-center gap-6">
              {/* Creators */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[#f8fafc]/60 text-center">
                <span>Creators</span>
                <span>:-</span>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {[
                    "Sonu Sen",
                    "Alakshya Salvi",
                    "Kshitij Kotian",
                    "Sumit Lodhi",
                  ].map((name, index) => (
                    <motion.span
                      key={name}
                      className="font-medium inline-block"
                      animate={{
                        color: [
                          "#8b5cf6",
                          "#8b5cf6",
                          "#38bdf8",
                          "#8b5cf6",
                          "#8b5cf6",
                        ],
                        scale: [1, 1, 1.15, 1, 1],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        delay: index * 1,
                        ease: "easeInOut",
                      }}
                    >
                      {name}
                      {index < 3 && ","}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Copyright & Social Links */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-[#f8fafc]/60">
                  © 2025 Editverse AI. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  {[
                    { Icon: Instagram, href: "#" },
                    { Icon: Twitter, href: "#" },
                    { Icon: MessageCircle, href: "#" },
                  ].map(({ Icon, href }, i) => (
                    <motion.a
                      key={i}
                      href={href}
                      className="w-10 h-10 rounded-full bg-[#1e293b] hover:bg-gradient-to-r hover:from-[#8b5cf6] hover:to-[#38bdf8] flex items-center justify-center transition-all duration-300"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5 text-[#f8fafc]" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
