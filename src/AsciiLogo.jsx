import { useEffect, useRef } from "react";
import art from "./lib/ascii-art.txt?raw";
import { parseArt, buildModel, renderFrame } from "./lib/ascii3d";

const FRAME_MS = 1000 / 30;
const MAX_STEP_MS = 100;
const STATIC_FRAME_T = 0.6;

export default function AsciiLogo() {
  const stage = useRef(null);

  useEffect(() => {
    const el = stage.current;
    const model = buildModel(parseArt(art));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = renderFrame(model, STATIC_FRAME_T);
      return;
    }

    let t = 0;
    let lastNow = null;
    let rafId = 0;
    let onScreen = false;

    const tick = (now) => {
      rafId = requestAnimationFrame(tick);
      if (lastNow === null) lastNow = now;
      const dt = now - lastNow;
      if (dt < FRAME_MS) return;
      lastNow = now;
      t += Math.min(dt, MAX_STEP_MS);
      el.textContent = renderFrame(model, t / 1000);
    };

    const play = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const pause = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      lastNow = null;
    };

    const onVisibility = () => {
      if (document.hidden) pause();
      else if (onScreen) play();
    };

    const observer = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      if (onScreen && !document.hidden) play();
      else pause();
    });

    document.addEventListener("visibilitychange", onVisibility);
    observer.observe(el);

    return () => {
      pause();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="hero-logo" aria-hidden="true">
      <pre ref={stage} />
    </div>
  );
}
