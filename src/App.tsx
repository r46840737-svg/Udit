/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  INITIAL_STATE,
  CalculatorState,
  Operator,
  HistoryItem,
  inputDigit,
  inputDecimal,
  deleteLastDigit,
  toggleSign,
  inputPercentage,
  performOperation,
  performEquals,
  clearCurrentOrAll,
  formatDisplayForViewer,
  performScientificFunc,
  handleMemory,
} from './calculator/engine';
import { Keypad } from './components/Keypad';
import { HistoryTape } from './components/HistoryTape';
import { ConverterModal } from './components/ConverterModal';
import { IPhoneFrame } from './components/IPhoneFrame';
import { playKeyClick } from './utils/audio';
import {
  RotateCcw,
  Clock,
  ArrowUpDown,
  Copy,
  ClipboardPaste,
  ChevronDown,
} from 'lucide-react';

const STORAGE_KEY_HISTORY = 'ios_calculator_history_v1';

// Seed demo history if storage is completely empty so user immediately discovers history capability
const INITIAL_DEMO_HISTORY: HistoryItem[] = [
  {
    id: 'demo-1',
    expression: '1,250 × 8',
    result: '10,000',
    timestamp: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'demo-2',
    expression: '250 + 15%',
    result: '287.5',
    timestamp: Date.now() - 1000 * 60 * 42,
  },
  {
    id: 'demo-3',
    expression: '45 ÷ 3',
    result: '15',
    timestamp: Date.now() - 1000 * 60 * 120,
  },
];

export default function App() {
  const [calcState, setCalcState] = useState<CalculatorState>(INITIAL_STATE);
  const [isScientific, setIsScientific] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFrameEnabled, setIsFrameEnabled] = useState(true);
  const [showCopyPaste, setShowCopyPaste] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // History state with localStorage persistence
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_DEMO_HISTORY;
  });

  const saveHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, []);

  const addHistoryItem = useCallback(
    (item: HistoryItem) => {
      saveHistory([item, ...history.slice(0, 49)]); // keep latest 50
    },
    [history, saveHistory]
  );

  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  const deleteHistoryItem = useCallback(
    (id: string) => {
      saveHistory(history.filter(h => h.id !== id));
    },
    [history, saveHistory]
  );

  // Audio trigger helper
  const triggerAudio = (type: 'number' | 'operator' | 'function' | 'clear' = 'number') => {
    if (soundEnabled) {
      playKeyClick(type);
    }
  };

  // Calculator action handlers
  const handleDigit = (digit: string) => {
    triggerAudio('number');
    setShowCopyPaste(false);
    setCalcState(prev => inputDigit(prev, digit));
  };

  const handleDecimal = () => {
    triggerAudio('number');
    setShowCopyPaste(false);
    setCalcState(prev => inputDecimal(prev));
  };

  const handleClear = () => {
    triggerAudio('clear');
    setShowCopyPaste(false);
    setCalcState(prev => clearCurrentOrAll(prev));
  };

  const handleToggleSign = () => {
    triggerAudio('function');
    setCalcState(prev => toggleSign(prev));
  };

  const handlePercent = () => {
    triggerAudio('function');
    setCalcState(prev => inputPercentage(prev));
  };

  const handleOperator = (op: Operator) => {
    triggerAudio('operator');
    setShowCopyPaste(false);
    setCalcState(prev => performOperation(prev, op, addHistoryItem));
  };

  const handleEquals = () => {
    triggerAudio('operator');
    setShowCopyPaste(false);
    setCalcState(prev => performEquals(prev, addHistoryItem));
  };

  const handleScientificFunc = (func: string) => {
    triggerAudio('function');
    setShowCopyPaste(false);
    setCalcState(prev => performScientificFunc(prev, func, addHistoryItem));
  };

  const handleToggleAngleMode = () => {
    triggerAudio('function');
    setCalcState(prev => ({
      ...prev,
      angleMode: prev.angleMode === 'rad' ? 'deg' : 'rad',
    }));
  };

  const handleToggle2nd = () => {
    triggerAudio('function');
    setCalcState(prev => ({
      ...prev,
      is2nd: !prev.is2nd,
    }));
  };

  const handleMemoryOp = (action: 'mc' | 'm+' | 'm-' | 'mr') => {
    triggerAudio('function');
    setCalcState(prev => handleMemory(prev, action));
  };

  // Swipe to delete gesture handling on the display
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Swipe down on display opens History tape!
    if (deltaY > 60 && Math.abs(deltaY) > Math.abs(deltaX)) {
      setIsHistoryOpen(true);
      triggerAudio('function');
    }
    // Horizontal swipe on display deletes last digit
    else if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      triggerAudio('clear');
      setCalcState(prev => deleteLastDigit(prev));
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Mouse drag simulation for desktop swipe
  const mouseStartXRef = useRef<number | null>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    mouseStartXRef.current = e.clientX;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseStartXRef.current === null) return;
    const deltaX = e.clientX - mouseStartXRef.current;
    if (Math.abs(deltaX) > 40) {
      triggerAudio('clear');
      setCalcState(prev => deleteLastDigit(prev));
    }
    mouseStartXRef.current = null;
  };

  // Copy & Paste on Display
  const handleCopyDisplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(calcState.display);
    setShowCopyPaste(false);
    setCopyToast('Copied to clipboard');
    setTimeout(() => setCopyToast(null), 1800);
  };

  const handlePasteDisplay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const text = await navigator.clipboard?.readText();
      if (text) {
        const clean = text.replace(/,/g, '').trim();
        const num = parseFloat(clean);
        if (!isNaN(num)) {
          setCalcState(prev => ({
            ...prev,
            display: clean,
            waitingForOperand: false,
          }));
          setCopyToast('Pasted');
          setTimeout(() => setCopyToast(null), 1500);
        }
      }
    } catch {
      // Permission denied
    }
    setShowCopyPaste(false);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input (like search or converter input)
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+' || e.key === '-') {
        handleOperator(e.key as Operator);
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setCalcState(prev => deleteLastDigit(prev));
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleClear();
      } else if (e.key === '%') {
        handlePercent();
      } else if (e.key.toLowerCase() === 'h') {
        setIsHistoryOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calcState, history, soundEnabled]);

  // Dynamic text size based on character count
  const formattedDisplay = formatDisplayForViewer(calcState.display);
  const charLength = formattedDisplay.length;

  const getFontSize = () => {
    if (isScientific) {
      if (charLength > 16) return 'text-2xl sm:text-3xl';
      if (charLength > 12) return 'text-3xl sm:text-4xl';
      return 'text-4xl sm:text-5xl';
    }
    if (charLength > 11) return 'text-3xl sm:text-4xl';
    if (charLength > 8) return 'text-4xl sm:text-5xl';
    if (charLength > 6) return 'text-5xl sm:text-6xl';
    return 'text-6xl sm:text-7xl';
  };

  return (
    <IPhoneFrame
      isFrameEnabled={isFrameEnabled}
      onToggleFrame={() => setIsFrameEnabled(prev => !prev)}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(prev => !prev)}
      isScientific={isScientific}
    >
      <div className="relative flex-1 flex flex-col justify-between w-full h-full pb-3 px-3 sm:px-4">
        {/* Top iOS Utility & Navigation Row */}
        <div className="flex items-center justify-between pt-2 pb-1 z-20">
          {/* History Button (iOS 18 tape icon) */}
          <button
            type="button"
            onClick={() => {
              triggerAudio('function');
              setIsHistoryOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 active:scale-95 transition"
            title="Open calculation history (or swipe down)"
            aria-label="Open calculation history"
          >
            <Clock className="h-3.5 w-3.5 text-[#ff9f0a]" />
            <span>History</span>
            {history.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff9f0a] text-[10px] font-bold text-black">
                {history.length > 9 ? '9+' : history.length}
              </span>
            )}
          </button>

          {/* Center hint: swipe down indicator */}
          <div
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-400 cursor-pointer"
            title="Swipe down on display for history"
          >
            <ChevronDown className="h-3 w-3 animate-pulse text-[#ff9f0a]/70" />
            <span className="hidden sm:inline">Swipe down for tape</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Unit Converter Button (iOS 18) */}
            <button
              type="button"
              onClick={() => {
                triggerAudio('function');
                setIsConverterOpen(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 active:scale-95 transition"
              title="Unit & currency converter"
              aria-label="Unit converter"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-[#ff9f0a]" />
            </button>

            {/* Scientific / Rotate Layout Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerAudio('function');
                setIsScientific(prev => !prev);
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition active:scale-95 ${
                isScientific
                  ? 'bg-[#ff9f0a] text-black border-[#ff9f0a]'
                  : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
              title={isScientific ? 'Switch to Portrait' : 'Switch to Scientific Keypad'}
              aria-label="Toggle scientific calculator layout"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isScientific ? 'Portrait' : 'Sci'}</span>
            </button>
          </div>
        </div>

        {/* Display Area (with Swipe to delete, Copy/Paste, and Dynamic Font Shrinking) */}
        <div
          className="relative flex-1 flex flex-col justify-end items-end px-3 py-3 select-none cursor-pointer group"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onClick={() => setShowCopyPaste(prev => !prev)}
          title="Click to copy/paste • Swipe left or right to delete last digit • Swipe down for history"
          role="region"
          aria-label="Calculator display screen"
        >
          {/* Subtle gesture instruction hint that fades out */}
          <div className="text-[10px] text-neutral-600 mb-1 font-mono tracking-tight group-hover:text-neutral-500 transition">
            {calcState.prevValue !== null && calcState.operator && (
              <span className="mr-2 text-neutral-400">
                {formatDisplayForViewer(calcState.prevValue.toString())} {calcState.operator}
              </span>
            )}
            <span className="opacity-70">swipe ← / → to backspace</span>
          </div>

          {/* Primary numbers display */}
          <div
            className={`font-light tracking-tight text-white transition-all duration-100 break-all text-right select-text ${getFontSize()}`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            {formattedDisplay}
          </div>

          {/* Floating iOS Copy / Paste Callout Bubble */}
          {showCopyPaste && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-1 rounded-xl bg-neutral-800/95 px-2 py-1.5 text-xs text-white shadow-2xl backdrop-blur border border-neutral-700 animate-in fade-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleCopyDisplay}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 hover:bg-neutral-700 active:scale-95 transition"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </button>
              <div className="h-3.5 w-px bg-neutral-600" />
              <button
                type="button"
                onClick={handlePasteDisplay}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 hover:bg-neutral-700 active:scale-95 transition"
              >
                <ClipboardPaste className="h-3 w-3" />
                <span>Paste</span>
              </button>
            </div>
          )}

          {/* Copied Toast */}
          {copyToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-neutral-800/90 px-3.5 py-1 text-xs text-white border border-neutral-700 shadow-lg">
              {copyToast}
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="w-full flex justify-center pb-2">
          <Keypad
            isScientific={isScientific}
            activeOperator={calcState.waitingForOperand ? calcState.operator : null}
            displayHasValue={calcState.display !== '0' && calcState.display !== 'Error'}
            angleMode={calcState.angleMode}
            is2nd={calcState.is2nd}
            onDigit={handleDigit}
            onDecimal={handleDecimal}
            onClear={handleClear}
            onToggleSign={handleToggleSign}
            onPercent={handlePercent}
            onOperator={handleOperator}
            onEquals={handleEquals}
            onScientificFunc={handleScientificFunc}
            onToggleAngleMode={handleToggleAngleMode}
            onToggle2nd={handleToggle2nd}
            onMemory={handleMemoryOp}
          />
        </div>

        {/* Calculation History Tape Drawer */}
        <HistoryTape
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectResult={res => {
            setCalcState(prev => ({
              ...prev,
              display: res.replace(/,/g, ''),
              waitingForOperand: true,
            }));
            triggerAudio('function');
          }}
          onClearHistory={clearHistory}
          onDeleteHistoryItem={deleteHistoryItem}
        />

        {/* iOS 18 Style Converter Modal */}
        <ConverterModal
          isOpen={isConverterOpen}
          onClose={() => setIsConverterOpen(false)}
          currentDisplayValue={calcState.display}
          onApplyConvertedValue={val => {
            setCalcState(prev => ({
              ...prev,
              display: val,
              waitingForOperand: true,
            }));
            triggerAudio('function');
          }}
        />
      </div>
    </IPhoneFrame>
  );
}
