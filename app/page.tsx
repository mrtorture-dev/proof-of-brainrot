'use client';

import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { AlertTriangle, Zap, Skull, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'mining' | 'slashed' | 'success'>('idle');
  const [balance, setBalance] = useState(0);
  const [timeLeft, setTimeLeft] = useState(367); // 6 mins 7 secs = 367 seconds
  const [aura, setAura] = useState(100);
  const [walletConnected, setWalletConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Shortens time to 15s for demo

  // Refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const motionThreshold = 1.5; // Sensitivity to movement

  // Brainrot Phrases for TTS
  const brainrotPhrases = [
    "SIX SEVEN!",
    "TUNG TUNG SAHUR!",
    "MAMMA MIA GABAGOOL!",
    "SKIBIDI TOILET RIZZ!",
    "NEGATIVE AURA DETECTED!",
    "BOMBARDIRO CROCODILO!",
    "SIX SEVEN, SIX SEVEN!",
    "WHAT THE SIGMA!"
  ];

  const triggerBrainrotEvent = () => {
    // 1. Visual Chaos (Anime.js)
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        translateX: () => anime.random(-30, 30),
        translateY: () => anime.random(-30, 30),
        rotate: () => anime.random(-10, 10),
        duration: 200,
        easing: 'easeInOutSine',
        direction: 'alternate',
        loop: 3
      });
    }

    if (textRef.current) {
      anime({
        targets: textRef.current,
        scale: [1, 1.8, 1],
        color: ['#10B981', '#EF4444', '#3B82F6', '#10B981'],
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      });
    }

    // 2. Audio Attack (Web Speech API / TTS for max cringe)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const phrase = brainrotPhrases[Math.floor(Math.random() * brainrotPhrases.length)];
      const utterance = new SpeechSynthesisUtterance(phrase);
      
      // Randomize voice for maximum chaos
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const weirdVoice = voices.find(v => v.lang.includes('it') || v.name.includes('Google'));
        utterance.voice = weirdVoice || voices[Math.floor(Math.random() * voices.length)];
      }
      
      utterance.pitch = Math.random() > 0.5 ? 2 : 0.1; // extreme pitch
      utterance.rate = 1.2 + Math.random() * 1.5; 
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    if (status !== 'mining') return;

    const { x, y, z } = event.acceleration || {};
    
    // Calculate total acceleration magnitude
    const magnitude = Math.sqrt((x || 0)**2 + (y || 0)**2 + (z || 0)**2);
    
    // Note: If physical device is not moving, magnitude is ~0. 
    // Gravity is excluded by 'acceleration' (vs accelerationIncludingGravity)
    if (magnitude > motionThreshold) {
      handleSlash();
    }
  };

  const handleSlash = () => {
    setStatus('slashed');
    setAura(prev => Math.max(0, prev - 50));
    setBalance(0);
    cleanupIntervals();
    
    // Slash Animation
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        backgroundColor: ['#000', '#EF4444', '#000'],
        duration: 1000,
        easing: 'linear'
      });
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const slashSpeech = new SpeechSynthesisUtterance("SLASHED! ZERO AURA!");
      slashSpeech.pitch = 0.1;
      slashSpeech.rate = 0.8;
      window.speechSynthesis.speak(slashSpeech);
    }
  };

  const startMining = () => {
    if (!walletConnected) {
      alert("Conecta tu wallet primero, degen.");
      return;
    }

    // iOS requires permission for motion
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            initiateMiningSequence();
          } else {
            alert("Necesitamos acceso a tus sensores para el Proof-of-Brainrot.");
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS
      initiateMiningSequence();
    }
  };

  const initiateMiningSequence = () => {
    setStatus('mining');
    setTimeLeft(demoMode ? 15 : 367); // Demo: 15 seconds. Real: 6:07
    
    window.addEventListener('devicemotion', handleMotion);

    // Random brainrot events
    const scheduleNextEvent = () => {
      const nextTime = 1000 + Math.random() * 2000;
      audioIntervalRef.current = setTimeout(() => {
        // Double check status in case it changed
        setStatus(currentStatus => {
          if (currentStatus === 'mining') {
            triggerBrainrotEvent();
            scheduleNextEvent();
          }
          return currentStatus;
        });
      }, nextTime);
    };
    
    // Initial scream
    triggerBrainrotEvent();
    scheduleNextEvent();

    // Mining loop (Update balance and timer)
    miningIntervalRef.current = setInterval(() => {
      setBalance(prev => prev + 6.7);
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSuccess = () => {
    setStatus('success');
    cleanupIntervals();
    
    if (textRef.current) {
      anime({
        targets: textRef.current,
        scale: [1, 2],
        rotate: '1turn',
        color: '#10B981',
        duration: 1500
      });
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("INFINITE AURA ACHIEVED! MATCHING SIX SEVEN!"));
    }
  };

  const cleanupIntervals = () => {
    if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
    if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleMotion);
    }
  };

  useEffect(() => {
    return () => cleanupIntervals(); // Cleanup on unmount
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      onClick={() => { if (status === 'mining') handleSlash(); }}
      className={`min-h-screen flex flex-col items-center justify-center p-6 text-white font-mono transition-colors duration-300 ${
        status === 'slashed' ? 'bg-red-950' : status === 'success' ? 'bg-green-950' : 'bg-black'
      }`}
    >
      <div className="absolute top-4 right-4 flex gap-4">
        <label className="flex items-center gap-2 text-xs">
          <input 
            type="checkbox" 
            checked={demoMode} 
            onChange={(e) => setDemoMode(e.target.checked)} 
            className="accent-green-500"
          />
          Demo Mode (15s)
        </label>
        <button 
          onClick={() => setWalletConnected(!walletConnected)}
          className={`px-4 py-2 text-sm font-bold border-2 rounded ${walletConnected ? 'border-green-500 text-green-500' : 'border-zinc-500 text-zinc-500 hover:border-white hover:text-white'}`}
        >
          {walletConnected ? '0x67...bRaIn' : 'Connect Wallet'}
        </button>
      </div>

      <div className="max-w-md w-full flex flex-col items-center gap-8">
        
        <div className="text-center">
          <h1 className="text-5xl font-black mb-2 tracking-tighter" ref={textRef}>
            PoB: 6-7
          </h1>
          <p className="text-zinc-400 text-sm">Proof-of-Brainrot Protocol</p>
        </div>

        <div className="w-full bg-zinc-900 border-2 border-zinc-800 p-6 rounded-xl flex flex-col items-center relative overflow-hidden">
          <div className="flex justify-between w-full mb-6 text-sm">
            <span className="flex items-center gap-1 text-zinc-400">
              <Zap size={16} className="text-yellow-400" /> Aura: {aura}
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <ShieldCheck size={16} className="text-green-400" /> Net: Sepolia
            </span>
          </div>

          <div className="text-center mb-8">
            <p className="text-zinc-500 mb-1">Mined $67</p>
            <p className="text-6xl font-black text-green-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              {balance.toFixed(2)}
            </p>
          </div>

          {status === 'idle' && (
            <button 
              onClick={startMining}
              className="w-full py-4 bg-white text-black font-black text-xl hover:bg-green-400 hover:scale-105 transition-all uppercase tracking-widest"
            >
              Start Mining
            </button>
          )}

          {status === 'mining' && (
            <div className="text-center flex flex-col items-center">
              <AlertTriangle size={48} className="text-yellow-500 mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-red-500 mb-2 uppercase">Do Not Move Device</h2>
              <p className="text-4xl font-black mb-2">{formatTime(timeLeft)}</p>
              <p className="text-xs text-zinc-400">Resist the Brainrot. Maintain Aura.</p>
            </div>
          )}

          {status === 'slashed' && (
            <div className="text-center flex flex-col items-center">
              <Skull size={64} className="text-red-500 mb-4 animate-bounce" />
              <h2 className="text-4xl font-black text-red-500 mb-2 uppercase">Slashed!</h2>
              <p className="text-sm text-red-300 mb-6">You moved. Negative Rizz detected.</p>
              <button 
                onClick={() => { setStatus('idle'); setBalance(0); setTimeLeft(demoMode ? 15 : 367); }}
                className="px-6 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold uppercase"
              >
                Try Again
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center flex flex-col items-center">
              <Zap size={64} className="text-green-500 mb-4" />
              <h2 className="text-4xl font-black text-green-500 mb-2 uppercase">Sigma Aura!</h2>
              <p className="text-sm text-green-300 mb-6">You survived the 6-7 protocol.</p>
              <button 
                onClick={() => { setStatus('idle'); setBalance(0); setTimeLeft(demoMode ? 15 : 367); }}
                className="px-6 py-2 bg-green-500 text-black font-bold uppercase"
              >
                Mine Again
              </button>
            </div>
          )}

        </div>

      </div>
      
      {/* Dev notes at the bottom for demo presentation */}
      <div className="fixed bottom-2 text-[10px] text-zinc-700 max-w-sm text-center">
        Demo Tip: Needs physical device (accelerometer) or Chrome DevTools (Sensors) to trigger slash. Volume UP for max cringe. Make sure to allow Audio on your browser.
      </div>
    </div>
  );
}
