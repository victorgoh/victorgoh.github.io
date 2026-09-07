import { useState, useEffect, useRef } from 'react';

const SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Space',
  ' ',
  'Home',
  'End'
]);

/**
 * Hook that detects user inactivity and provides an active state.
 * Allows smooth scrolling while in Focus Mode without resetting the inactivity timer.
 * 
 * @param timeoutMs - Time in milliseconds before considering user inactive (default: 5000ms)
 * @returns boolean indicating if user is currently active
 */
export const useInactivityDetection = (timeoutMs: number = 5000) => {
  const [isActive, setIsActive] = useState(true);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let isTouchScrolling = false;

    const resetTimer = () => {
      setIsActive(true);
      clearTimeout(timer);
      timer = setTimeout(() => setIsActive(false), timeoutMs);
    };

    // Mark active scrolling and debounce clearing it
    const handleScrollOrWheel = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
      // NOTE: Scrolling does NOT reset timer, preserving Focus Mode dimming!
    };

    const handleMouseMove = (e: MouseEvent) => {
      // If user is scrolling via mouse wheel / trackpad, ignore mousemove
      if (isScrollingRef.current) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Only wake up controls if mouse is interacting with header/navigation controls
      // or moving near the top header bar (Y < 55px)
      const isControl = target.closest('header, .header-glass, .active-plan-banner-wrapper, .item-nav-container, button, [role="button"], input, select, textarea');
      if (isControl || e.clientY < 55) {
        resetTimer();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Keyboard scrolling (Arrow keys, Space, PageDown/Up) allows reading without undimming
      if (!isTyping && SCROLL_KEYS.has(e.key)) {
        return;
      }

      resetTimer();
    };

    const handleTouchStart = () => {
      isTouchScrolling = false;
    };

    const handleTouchMove = () => {
      isTouchScrolling = true;
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // If user was touch-scrolling through text, do NOT wake up controls
      if (isTouchScrolling) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Only tap on controls / buttons resets timer
      const isControl = target.closest('header, .header-glass, .active-plan-banner-wrapper, .item-nav-container, button, [role="button"], .collapsible-header-btn');
      if (isControl) {
        resetTimer();
      }
    };

    const handleClick = (e: MouseEvent) => {
      // If user was scrolling, ignore trailing click events
      if (isScrollingRef.current) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Clicking on controls, buttons, or header wakes up UI
      const isControl = target.closest('header, .header-glass, .active-plan-banner-wrapper, .item-nav-container, button, [role="button"], .collapsible-header-btn, input, textarea');
      if (isControl) {
        resetTimer();
      }
    };

    // Listen to scroll and wheel to maintain scroll tracking
    window.addEventListener('scroll', handleScrollOrWheel, { passive: true });
    window.addEventListener('wheel', handleScrollOrWheel, { passive: true });

    // Desktop listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    // Mobile touch listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(timer);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScrollOrWheel);
      window.removeEventListener('wheel', handleScrollOrWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [timeoutMs]);

  return isActive;
};