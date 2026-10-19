import React, { useState } from 'react';
import { HistoryItem } from '../calculator/engine';
import { Clock, Trash2, Copy, Check, ArrowDownLeft, X, Search } from 'lucide-react';

interface HistoryTapeProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectResult: (val: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryTape: React.FC<HistoryTapeProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredHistory = history.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.expression.toLowerCase().includes(q) || item.result.toLowerCase().includes(q);
  });

  const formatTimestamp = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md transition-all duration-300"
      onTouchStart={e => setTouchStart(e.targetTouches[0].clientY)}
      onTouchMove={e => {
        if (touchStart !== null && e.targetTouches[0].clientY - touchStart > 80) {
          onClose();
          setTouchStart(null);
        }
      }}
      onTouchEnd={() => setTouchStart(null)}
      role="dialog"
      aria-label="Calculation History"
      aria-modal="true"
    >
      {/* Backdrop overlay tap to close */}
      <div className="absolute inset-0" onClick={onClose} aria-label="Close modal overlay" />

      {/* Slide-up iOS Drawer Container */}
      <div
        className="relative z-10 flex max-h-[85%] w-full flex-col rounded-t-[32px] border-t border-neutral-800 bg-[#1c1c1e] text-white shadow-2xl transition-transform"
        onClick={e => e.stopPropagation()}
      >
        {/* iOS Drag Handle */}
        <div className="flex w-full items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 rounded-full bg-neutral-600/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#ff9f0a]" />
            <h2 className="text-xl font-semibold tracking-tight text-white">History Tape</h2>
            <span className="ml-1 rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400 font-mono">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition active:scale-95"
                title="Clear all history"
                aria-label="Clear all history"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-90 transition"
              aria-label="Close history"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar if history is not empty */}
        {history.length > 2 && (
          <div className="px-5 pt-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search calculations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-neutral-800/90 py-2 pl-9 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#ff9f0a]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 overscroll-contain">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800/80">
                <Clock className="h-7 w-7 text-neutral-500" />
              </div>
              <p className="text-base font-medium text-neutral-300">No Calculations Yet</p>
              <p className="mt-1 max-w-[240px] text-xs text-neutral-500">
                Calculations you perform in portrait or scientific mode will be logged here.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-400">
              No calculations found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredHistory.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectResult(item.result);
                  onClose();
                }}
                className="group relative flex flex-col rounded-2xl bg-neutral-850/80 p-3.5 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60 transition cursor-pointer active:scale-[0.99]"
                role="button"
                tabIndex={0}
                aria-label={`Calculation ${item.expression} equals ${item.result}. Tap to use in calculator`}
              >
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono tracking-wider">{item.expression}</span>
                  <span className="text-[11px] text-neutral-500">{formatTimestamp(item.timestamp)}</span>
                </div>

                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-2xl font-light tracking-tight text-white">
                    = {item.result}
                  </span>

                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={e => handleCopy(item.result, item.id, e)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-700/60 text-neutral-300 hover:bg-neutral-600 active:scale-90 transition"
                      title="Copy result"
                      aria-label="Copy result"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item.id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-700/60 text-neutral-400 hover:bg-red-500/20 hover:text-red-400 active:scale-90 transition"
                      title="Delete calculation"
                      aria-label="Delete calculation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="hidden sm:flex items-center gap-1 rounded-lg bg-[#ff9f0a]/20 px-2 py-1 text-[11px] font-medium text-[#ff9f0a]">
                      <ArrowDownLeft className="h-3 w-3" />
                      Use
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer tip */}
        <div className="px-5 py-2.5 border-t border-neutral-800 text-center text-[11px] text-neutral-500">
          Tap any card to load result back into the display • Swipe down to close
        </div>
      </div>
    </div>
  );
};
