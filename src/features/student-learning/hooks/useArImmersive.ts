"use client";

import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export function useArImmersive(isActive: boolean) {
  const isMobile = useIsMobile();
  const isImmersive = isActive && isMobile;

  useEffect(() => {
    if (!isMobile) return;

    if (isActive) {
      document.body.classList.add("ar-active");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("ar-active");
      document.body.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("ar-active");
      document.body.style.overflow = "";
    };
  }, [isActive, isMobile]);

  return { isMobile, isImmersive };
}