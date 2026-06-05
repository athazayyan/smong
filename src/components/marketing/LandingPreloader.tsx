"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type MutableNumber = {
  value: number;
};

function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LandingPreloader() {
  const [isVisible, setIsVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const sublineRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  useEffect(() => {
    const root = rootRef.current;
    const topCurtain = topCurtainRef.current;
    const bottomCurtain = bottomCurtainRef.current;
    const brand = brandRef.current;
    const headline = headlineRef.current;
    const subline = sublineRef.current;
    const path = pathRef.current;
    const dot = dotRef.current;
    const progress = progressRef.current;

    if (root === null || topCurtain === null || bottomCurtain === null || brand === null || headline === null || subline === null || path === null || dot === null || progress === null) {
      return;
    }

    if (getReducedMotionPreference()) {
      const reducedTimeoutId = window.setTimeout(() => setIsVisible(false), 650);

      return () => window.clearTimeout(reducedTimeoutId);
    }

    const pathLength = path.getTotalLength();
    const cursor: MutableNumber = { value: 0 };
    const updateDot = () => {
      const point = path.getPointAtLength(pathLength * cursor.value);
      dot.setAttribute("cx", point.x.toFixed(2));
      dot.setAttribute("cy", point.y.toFixed(2));
    };

    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });
    gsap.set(dot, { autoAlpha: 0 });
    gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
    gsap.set([brand, headline, subline], { y: 18, autoAlpha: 0 });
    gsap.set(topCurtain, { yPercent: 0 });
    gsap.set(bottomCurtain, { yPercent: 0 });
    updateDot();

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => setIsVisible(false),
    });

    timeline
      .to(brand, { y: 0, autoAlpha: 1, duration: 0.42 })
      .to(headline, { y: 0, autoAlpha: 1, duration: 0.48 }, "-=0.24")
      .to(subline, { y: 0, autoAlpha: 1, duration: 0.38 }, "-=0.26")
      .to(path, { strokeDashoffset: 0, duration: 0.86, ease: "power2.inOut" }, "-=0.12")
      .to(dot, { autoAlpha: 1, duration: 0.12 }, "<")
      .to(cursor, { value: 1, duration: 0.86, ease: "power2.inOut", onUpdate: updateDot }, "<")
      .to(progress, { scaleX: 1, duration: 0.74, ease: "power2.inOut" }, "<")
      .to([brand, headline, subline], { y: -16, autoAlpha: 0, duration: 0.32, stagger: 0.025, ease: "power2.in" }, "+=0.18")
      .to(topCurtain, { yPercent: -102, duration: 0.62, ease: "expo.inOut" }, "-=0.05")
      .to(bottomCurtain, { yPercent: 102, duration: 0.62, ease: "expo.inOut" }, "<")
      .to(root, { autoAlpha: 0, duration: 0.12 }, "-=0.08");

    return () => {
      timeline.kill();
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Menyiapkan halaman Smong"
      className="fixed inset-0 z-[100] overflow-hidden bg-cream-50 text-purple-950"
    >
      <div ref={topCurtainRef} className="absolute inset-x-0 top-0 h-1/2 origin-bottom bg-purple-950" />
      <div ref={bottomCurtainRef} className="absolute inset-x-0 bottom-0 h-1/2 origin-top bg-purple-950" />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center text-white">
          <div ref={brandRef} className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/14 bg-white/8 px-5 py-2 font-heading text-sm font-bold uppercase tracking-[0.24em] text-yellow-100 backdrop-blur-md">
            Smong
          </div>

          <div ref={headlineRef} className="font-heading text-5xl font-bold leading-[0.95] tracking-normal md:text-7xl">
            Siaga dimulai
          </div>

          <div ref={sublineRef} className="mt-5 max-w-md font-sans text-sm font-semibold leading-relaxed text-lavender-100/88 md:text-base">
            Membuka jalur belajar yang aman, singkat, dan seru.
          </div>

          <div className="relative mt-12 w-full max-w-xl">
            <svg viewBox="0 0 520 86" className="h-24 w-full overflow-visible" aria-hidden="true">
              <path
                ref={pathRef}
                d="M14 54 C96 14 154 18 214 50 C278 84 326 74 380 34 C426 0 466 10 506 42"
                fill="none"
                stroke="#FDE68A"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <circle ref={dotRef} cx="14" cy="54" r="9" fill="#FFFFFF" />
            </svg>
            <div className="mx-auto mt-2 h-1 w-44 overflow-hidden rounded-full bg-white/16">
              <div ref={progressRef} className="h-full rounded-full bg-mint-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/28 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
    </div>
  );
}
