import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';

interface IPhoneFrameProps {
  children: React.ReactNode;
  isFrameEnabled: boolean;
  onToggleFrame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isScientific: boolean;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  isFrameEnabled,
  onToggleFrame,
  soundEnabled,
  onToggleSound,
  isScientific,
}) => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isFrameEnabled || isScientific) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-black text-white">
        {/* Top Floating Controls Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-black/80 backdrop-blur border-b border-neutral-900 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">iOS Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              className="flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-neutral-300 hover:text-white border border-neutral-800 transition active:scale-95"
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-neutral-200" /> : <VolumeX className="h-3.5 w-3.5 text-neutral-500" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>
            <button
              type="button"
              onClick={onToggleFrame}
              className="flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-neutral-300 hover:text-white border border-neutral-800 transition active:scale-95"
              title="Toggle iPhone frame"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Phone Frame</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
          {children}
        </main>
      </div>
    );
  }

  // Authentic iPhone 16 Pro mockup frame
  return (
    <div className="min-h-screen w-full bg-[#111113] flex flex-col items-center justify-center p-1 sm:p-6 text-white select-none overflow-x-hidden">
      {/* Top Bar for frame utilities */}
      <div className="mb-2 flex items-center gap-3 text-xs text-neutral-400">
        <button
          type="button"
          onClick={onToggleSound}
          className="flex items-center gap-1.5 rounded-full bg-neutral-900/90 px-3 py-1.5 border border-neutral-800 hover:text-white transition active:scale-95"
          title={soundEnabled ? 'Mute click audio' : 'Enable click audio'}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-[#ff9f0a]" /> : <VolumeX className="h-3.5 w-3.5 text-neutral-500" />}
          <span>{soundEnabled ? 'Audio Click' : 'Muted'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 rounded-full bg-neutral-900/90 px-3 py-1.5 border border-neutral-800 hover:text-white transition active:scale-95"
          title="Switch to full screen / mobile mode"
        >
          <Monitor className="h-3.5 w-3.5 text-neutral-300" />
          <span>Full Screen</span>
        </button>
      </div>

      {/* iPhone Outer Chassis */}
      <div className="relative w-full max-w-[390px] h-[780px] sm:h-[830px] rounded-[44px] sm:rounded-[54px] bg-[#1a1a1a] p-1.5 sm:p-[10px] shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_4px_rgba(255,255,255,0.2)]">
        {/* Side physical buttons styling */}
        <div className="hidden sm:block absolute -left-[13px] top-[115px] h-[26px] w-[3px] rounded-l-sm bg-neutral-700/80" />
        <div className="hidden sm:block absolute -left-[13px] top-[160px] h-[50px] w-[3px] rounded-l-sm bg-neutral-700/80" />
        <div className="hidden sm:block absolute -left-[13px] top-[225px] h-[50px] w-[3px] rounded-l-sm bg-neutral-700/80" />
        <div className="hidden sm:block absolute -right-[13px] top-[170px] h-[75px] w-[3px] rounded-r-sm bg-neutral-700/80" />

        {/* Screen bezel & display */}
        <div className="relative h-full w-full rounded-[38px] sm:rounded-[44px] bg-black overflow-hidden flex flex-col justify-between border border-neutral-900/50">
          {/* iOS Status Bar */}
          <div className="relative z-20 flex h-12 w-full items-center justify-between px-7 pt-3 text-white text-xs font-semibold">
            {/* Clock */}
            <span>{timeStr}</span>

            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-2.5 -translate-x-1/2 flex items-center justify-center h-[28px] w-[105px] rounded-full bg-black border border-neutral-800/40 shadow-inner">
              <div className="h-3 w-3 rounded-full bg-[#0a0a0a] mr-2" />
              <div className="h-2 w-2 rounded-full bg-[#151525]" />
            </div>

            {/* Icons: 5G, Wifi, Battery */}
            <div className="flex items-center gap-1.5 text-neutral-200">
              <span className="text-[10px] font-bold tracking-tighter">5G</span>
              <Wifi className="h-3.5 w-3.5" />
              <div className="flex items-center gap-0.5">
                <div className="h-3 w-5 rounded-[4px] border border-white/80 p-0.5 flex items-center">
                  <div className="h-full w-3/4 rounded-[2px] bg-white" />
                </div>
                <div className="h-1.5 w-0.5 rounded-r-[1px] bg-white/80" />
              </div>
            </div>
          </div>

          {/* Calculator Screen Inner Body */}
          <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="flex w-full items-center justify-center pb-2 pt-1">
            <div className="h-1 w-32 rounded-full bg-neutral-600/70" />
          </div>
        </div>
      </div>
    </div>
  );
};
