import React, { useState } from 'react';
import { CONVERSION_CATEGORIES, convertValue } from '../calculator/converters';
import { ArrowUpDown, X, Check, ArrowRight } from 'lucide-react';

interface ConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDisplayValue: string;
  onApplyConvertedValue: (val: string) => void;
}

export const ConverterModal: React.FC<ConverterModalProps> = ({
  isOpen,
  onClose,
  currentDisplayValue,
  onApplyConvertedValue,
}) => {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const category = CONVERSION_CATEGORIES[selectedCategoryIndex];

  const [fromUnitId, setFromUnitId] = useState(category.units[0].id);
  const [toUnitId, setToUnitId] = useState(category.units[1].id);

  // Parse input from calculator display or allow input here
  const rawNum = parseFloat(currentDisplayValue.replace(/,/g, '')) || 0;
  const [inputValue, setInputValue] = useState(rawNum.toString());

  if (!isOpen) return null;

  const currentVal = parseFloat(inputValue) || 0;
  const convertedResult = convertValue(currentVal, category, fromUnitId, toUnitId);

  const formattedOutput = Number.isInteger(convertedResult)
    ? convertedResult.toLocaleString()
    : parseFloat(convertedResult.toFixed(4)).toLocaleString();

  const handleCategoryChange = (idx: number) => {
    setSelectedCategoryIndex(idx);
    const cat = CONVERSION_CATEGORIES[idx];
    setFromUnitId(cat.units[0].id);
    setToUnitId(cat.units[1].id);
  };

  const handleSwapUnits = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-md transition-all duration-300"
      role="dialog"
      aria-label="Unit Converter"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose} aria-label="Close modal overlay" />

      <div
        className="relative z-10 flex max-h-[90%] w-full flex-col rounded-t-[32px] border-t border-neutral-800 bg-[#1c1c1e] text-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex w-full items-center justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-neutral-600/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-[#ff9f0a]" />
            <h2 className="text-xl font-semibold tracking-tight text-white">Convert</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-90 transition"
            aria-label="Close converter"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto px-4 py-3 gap-2 border-b border-neutral-800/50 scrollbar-none">
          {CONVERSION_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(idx)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                selectedCategoryIndex === idx
                  ? 'bg-[#ff9f0a] text-black font-semibold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Conversion Form */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* From Input Box */}
          <div className="rounded-2xl bg-neutral-850 p-4 border border-neutral-800">
            <span className="text-xs text-neutral-400 font-medium">FROM</span>
            <div className="mt-2 flex items-center justify-between gap-3">
              <input
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-full bg-transparent text-2xl font-light text-white focus:outline-none"
                placeholder="0"
                aria-label="Value to convert"
              />
              <select
                value={fromUnitId}
                onChange={e => setFromUnitId(e.target.value)}
                className="rounded-xl bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-[#ff9f0a] border border-neutral-700 focus:outline-none"
                aria-label="From unit"
              >
                {category.units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.symbol} - {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwapUnits}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 hover:text-white hover:border-[#ff9f0a] active:rotate-180 transition-all duration-200"
              title="Swap units"
              aria-label="Swap units"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* To Result Box */}
          <div className="rounded-2xl bg-neutral-850 p-4 border border-neutral-800">
            <span className="text-xs text-neutral-400 font-medium">TO</span>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-2xl font-light text-[#ff9f0a] truncate">
                {formattedOutput}
              </span>
              <select
                value={toUnitId}
                onChange={e => setToUnitId(e.target.value)}
                className="rounded-xl bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-[#ff9f0a] border border-neutral-700 focus:outline-none"
                aria-label="To unit"
              >
                {category.units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.symbol} - {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Apply button */}
          <button
            type="button"
            onClick={() => {
              onApplyConvertedValue(convertedResult.toString());
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ff9f0a] py-3 text-base font-semibold text-black hover:bg-[#e08b08] active:scale-[0.98] transition shadow-lg shadow-[#ff9f0a]/10"
          >
            <Check className="h-4 w-4" />
            Use {formattedOutput} in Calculator
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
