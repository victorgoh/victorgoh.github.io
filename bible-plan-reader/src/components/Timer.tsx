import React, { useState, useEffect, useRef } from 'react';
import { translate } from '../utils/i18n';
import type { LanguageCode } from '../utils/i18n';
import { Timer as TimerIcon } from 'lucide-react';


interface TimerProps {
  lang: LanguageCode;
}

export const Timer: React.FC<TimerProps> = ({ lang }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [initialCountdownSeconds, setInitialCountdownSeconds] = useState(300); // 5 min default

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setSeconds((prev) => prev + 1);
        } else {
          setSeconds((prev) => {
            if (prev <= 1) {
              setIsActive(false);
              if (timerRef.current) clearInterval(timerRef.current);
              // Play a subtle alert sound or trigger vibration
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
              } catch (e) {
                console.log('Audio Context not allowed yet', e);
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'stopwatch') {
      setSeconds(0);
    } else {
      setSeconds(initialCountdownSeconds);
    }
  };

  const selectPreset = (mins: number) => {
    setIsActive(false);
    setMode('countdown');
    const secs = mins * 60;
    setInitialCountdownSeconds(secs);
    setSeconds(secs);
  };

  const selectStopwatch = () => {
    setIsActive(false);
    setMode('stopwatch');
    setSeconds(0);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress for ring indicator
  const progressPercent = mode === 'countdown' 
    ? Math.max(0, Math.min(100, (seconds / initialCountdownSeconds) * 100))
    : 100;

  return (
    <div className="timer-card">
      <h3 className="timer-title">{translate(lang, 'timer.title')}</h3>
      
      <div className="timer-modes">
        <button 
          className={`mode-btn ${mode === 'stopwatch' ? 'active' : ''}`}
          onClick={selectStopwatch}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
        >
          <TimerIcon size={14} /> Stopwatch
        </button>
        <button 
          className={`mode-btn ${mode === 'countdown' && initialCountdownSeconds === 60 ? 'active' : ''}`}
          onClick={() => selectPreset(1)}
        >
          1m
        </button>
        <button 
          className={`mode-btn ${mode === 'countdown' && initialCountdownSeconds === 300 ? 'active' : ''}`}
          onClick={() => selectPreset(5)}
        >
          5m
        </button>
        <button 
          className={`mode-btn ${mode === 'countdown' && initialCountdownSeconds === 600 ? 'active' : ''}`}
          onClick={() => selectPreset(10)}
        >
          10m
        </button>
        <button 
          className={`mode-btn ${mode === 'countdown' && initialCountdownSeconds === 900 ? 'active' : ''}`}
          onClick={() => selectPreset(15)}
        >
          15m
        </button>
      </div>

      <div className="timer-display-container">
        <svg className="timer-svg" viewBox="0 0 100 100">
          <circle className="timer-ring-bg" cx="50" cy="50" r="45" />
          <circle 
            className="timer-ring-fg" 
            cx="50" 
            cy="50" 
            r="45" 
            style={{
              strokeDasharray: 282.7,
              strokeDashoffset: 282.7 - (282.7 * progressPercent) / 100
            }}
          />
        </svg>
        <div className="timer-time">{formatTime(seconds)}</div>
      </div>

      <div className="timer-controls">
        <button 
          className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`} 
          onClick={toggleTimer}
        >
          {isActive ? translate(lang, 'timer.pause') : translate(lang, 'timer.start')}
        </button>
        <button className="btn btn-secondary" onClick={resetTimer}>
          {translate(lang, 'timer.reset')}
        </button>
      </div>
    </div>
  );
};
