import React from 'react';
import { Operator } from '../calculator/engine';

interface KeypadProps {
  isScientific: boolean;
  activeOperator: Operator | null;
  displayHasValue: boolean;
  angleMode: 'rad' | 'deg';
  is2nd: boolean;
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onClear: () => void;
  onToggleSign: () => void;
  onPercent: () => void;
  onOperator: (op: Operator) => void;
  onEquals: () => void;
  onScientificFunc: (func: string) => void;
  onToggleAngleMode: () => void;
  onToggle2nd: () => void;
  onMemory: (action: 'mc' | 'm+' | 'm-' | 'mr') => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  isScientific,
  activeOperator,
  displayHasValue,
  angleMode,
  is2nd,
  onDigit,
  onDecimal,
  onClear,
  onToggleSign,
  onPercent,
  onOperator,
  onEquals,
  onScientificFunc,
  onToggleAngleMode,
  onToggle2nd,
  onMemory,
}) => {
  // Button base styles
  const btnBase =
    'flex items-center justify-center font-medium rounded-full select-none cursor-pointer transition-all active:brightness-125 transition-transform active:scale-95 duration-150 outline-none';

  // Portrait standard button sizes
  const standardBtnSize = 'h-16 w-16 sm:h-20 sm:w-20 text-3xl sm:text-4xl';

  // Scientific small button sizes
  const sciBtnSize = 'h-11 w-14 sm:h-12 sm:w-16 text-sm sm:text-base';

  // Color classes
  const darkGrayBtn = 'bg-[#333333] text-white hover:bg-[#3d3d3d] active:bg-[#525252]';
  const lightGrayBtn = 'bg-[#a5a5a5] text-black hover:bg-[#b5b5b5] active:bg-[#d4d4d4] font-normal';
  const sciGrayBtn = 'bg-[#212121] text-neutral-200 hover:bg-[#2b2b2b] active:bg-[#3a3a3a] text-xs sm:text-sm font-normal';

  // Orange operator buttons with iOS inversion when active
  const getOperatorClass = (op: Operator) => {
    const isActive = activeOperator === op;
    if (isActive) {
      return 'bg-white text-[#ff9f0a] font-bold shadow-md';
    }
    return 'bg-[#ff9f0a] text-white hover:bg-[#ffaa26] active:bg-[#fca311]';
  };

  if (isScientific) {
    // 10 columns x 5 rows landscape scientific keypad
    return (
      <div className="grid grid-cols-10 gap-2 sm:gap-2.5 w-full max-w-4xl mx-auto px-2">
        {/* Row 1 */}
        <button type="button" onClick={() => onScientificFunc('(')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          (
        </button>
        <button type="button" onClick={() => onScientificFunc(')')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          )
        </button>
        <button type="button" onClick={() => onMemory('mc')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          mc
        </button>
        <button type="button" onClick={() => onMemory('m+')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          m+
        </button>
        <button type="button" onClick={() => onMemory('m-')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          m-
        </button>
        <button type="button" onClick={() => onMemory('mr')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          mr
        </button>
        <button type="button" onClick={onClear} className={`${btnBase} ${sciBtnSize} ${lightGrayBtn}`}>
          {displayHasValue ? 'C' : 'AC'}
        </button>
        <button type="button" onClick={onToggleSign} className={`${btnBase} ${sciBtnSize} ${lightGrayBtn}`}>
          ±
        </button>
        <button type="button" onClick={onPercent} className={`${btnBase} ${sciBtnSize} ${lightGrayBtn}`}>
          %
        </button>
        <button type="button" onClick={() => onOperator('÷')} className={`${btnBase} ${sciBtnSize} ${getOperatorClass('÷')}`}>
          ÷
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={onToggle2nd}
          className={`${btnBase} ${sciBtnSize} ${is2nd ? 'bg-neutral-400 text-black font-semibold' : sciGrayBtn}`}
        >
          2nd
        </button>
        <button type="button" onClick={() => onScientificFunc('x2')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          x²
        </button>
        <button type="button" onClick={() => onScientificFunc('x3')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          x³
        </button>
        <button type="button" onClick={() => onOperator('^')} className={`${btnBase} ${sciBtnSize} ${getOperatorClass('^')}`}>
          xʸ
        </button>
        <button type="button" onClick={() => onScientificFunc(is2nd ? '2x' : 'ex')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          {is2nd ? '2ˣ' : 'eˣ'}
        </button>
        <button type="button" onClick={() => onScientificFunc('10x')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          10ˣ
        </button>
        <button type="button" onClick={() => onDigit('7')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          7
        </button>
        <button type="button" onClick={() => onDigit('8')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          8
        </button>
        <button type="button" onClick={() => onDigit('9')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          9
        </button>
        <button type="button" onClick={() => onOperator('×')} className={`${btnBase} ${sciBtnSize} ${getOperatorClass('×')}`}>
          ×
        </button>

        {/* Row 3 */}
        <button type="button" onClick={() => onScientificFunc('1/x')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          1/x
        </button>
        <button type="button" onClick={() => onScientificFunc('sqrt')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          ²√x
        </button>
        <button type="button" onClick={() => onScientificFunc('cbrt')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          ³√x
        </button>
        <button type="button" onClick={() => onOperator('yroot')} className={`${btnBase} ${sciBtnSize} ${getOperatorClass('yroot')}`}>
          ʸ√x
        </button>
        <button type="button" onClick={() => onScientificFunc(is2nd ? 'log2' : 'ln')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          {is2nd ? 'log₂' : 'ln'}
        </button>
        <button type="button" onClick={() => onScientificFunc('log10')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          log₁₀
        </button>
        <button type="button" onClick={() => onDigit('4')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          4
        </button>
        <button type="button" onClick={() => onDigit('5')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          5
        </button>
        <button type="button" onClick={() => onDigit('6')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          6
        </button>
        <button type="button" onClick={() => onOperator('-')} className={`${btnBase} ${sciBtnSize} ${getOperatorClass('-')}`}>
          −
        </button>

        {/* Row 4 */}
        <button type="button" onClick={() => onScientificFunc('factorial')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          x!
        </button>
        <button type="button" onClick={() => onScientificFunc(is2nd ? 'asin' : 'sin')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          {is2nd ? 'sin⁻¹' : 'sin'}
        </button>
        <button type="button" onClick={() => onScientificFunc(is2nd ? 'acos' : 'cos')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          {is2nd ? 'cos⁻¹' : 'cos'}
        </button>
        <button type="button" onClick={() => onScientificFunc(is2nd ? 'atan' : 'tan')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          {is2nd ? 'tan⁻¹' : 'tan'}
        </button>
        <button type="button" onClick={() => onScientificFunc('e')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          e
        </button>
        <button type="button" onClick={() => onScientificFunc('rand')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          Rand
        </button>
        <button type="button" onClick={() => onDigit('1')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          1
        </button>
        <button type="button" onClick={() => onDigit('2')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          2
        </button>
        <button type="button" onClick={() => onDigit('3')} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          3
        </button>
        <button type="button" onClick={() => onOperator('+')} className={`${btnBase} ${sciBtnSize} ${getOperatorClass('+')}`}>
          +
        </button>

        {/* Row 5 */}
        <button type="button" onClick={onToggleAngleMode} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn} uppercase`}>
          {angleMode}
        </button>
        <button type="button" onClick={() => onScientificFunc(is2nd ? 'asinh' : 'sinh')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          {is2nd ? 'sinh⁻¹' : 'sinh'}
        </button>
        <button type="button" onClick={() => onScientificFunc(is2nd ? 'acosh' : 'cosh')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          {is2nd ? 'cosh⁻¹' : 'cosh'}
        </button>
        <button type="button" onClick={() => onScientificFunc(is2nd ? 'atanh' : 'tanh')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          {is2nd ? 'tanh⁻¹' : 'tanh'}
        </button>
        <button type="button" onClick={() => onScientificFunc('pi')} className={`${btnBase} ${sciBtnSize} ${sciGrayBtn}`}>
          π
        </button>
        <button
          type="button"
          onClick={() => onDigit('0')}
          className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}
        >
          00
        </button>
        <button
          type="button"
          onClick={() => onDigit('0')}
          className={`${btnBase} ${sciBtnSize} ${darkGrayBtn} col-span-2`}
        >
          0
        </button>
        <button type="button" onClick={onDecimal} className={`${btnBase} ${sciBtnSize} ${darkGrayBtn}`}>
          .
        </button>
        <button type="button" onClick={onEquals} className={`${btnBase} ${sciBtnSize} bg-[#ff9f0a] text-white hover:bg-[#ffaa26]`}>
          =
        </button>
      </div>
    );
  }

  // Portrait Standard 4x5 Keypad
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-[340px] sm:max-w-[360px] mx-auto w-full px-2">
      {/* Row 1: AC/C, ±, %, ÷ */}
      <button
        type="button"
        onClick={onClear}
        className={`${btnBase} ${standardBtnSize} ${lightGrayBtn}`}
        aria-label={displayHasValue ? 'Clear' : 'All Clear'}
      >
        {displayHasValue ? 'C' : 'AC'}
      </button>

      <button
        type="button"
        onClick={onToggleSign}
        className={`${btnBase} ${standardBtnSize} ${lightGrayBtn}`}
        aria-label="Plus Minus"
      >
        ±
      </button>

      <button
        type="button"
        onClick={onPercent}
        className={`${btnBase} ${standardBtnSize} ${lightGrayBtn}`}
        aria-label="Percent"
      >
        %
      </button>

      <button
        type="button"
        onClick={() => onOperator('÷')}
        className={`${btnBase} ${standardBtnSize} ${getOperatorClass('÷')}`}
        aria-label="Divide"
      >
        ÷
      </button>

      {/* Row 2: 7, 8, 9, × */}
      <button
        type="button"
        onClick={() => onDigit('7')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="7"
      >
        7
      </button>
      <button
        type="button"
        onClick={() => onDigit('8')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="8"
      >
        8
      </button>
      <button
        type="button"
        onClick={() => onDigit('9')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="9"
      >
        9
      </button>
      <button
        type="button"
        onClick={() => onOperator('×')}
        className={`${btnBase} ${standardBtnSize} ${getOperatorClass('×')}`}
        aria-label="Multiply"
      >
        ×
      </button>

      {/* Row 3: 4, 5, 6, − */}
      <button
        type="button"
        onClick={() => onDigit('4')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="4"
      >
        4
      </button>
      <button
        type="button"
        onClick={() => onDigit('5')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="5"
      >
        5
      </button>
      <button
        type="button"
        onClick={() => onDigit('6')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="6"
      >
        6
      </button>
      <button
        type="button"
        onClick={() => onOperator('-')}
        className={`${btnBase} ${standardBtnSize} ${getOperatorClass('-')}`}
        aria-label="Subtract"
      >
        −
      </button>

      {/* Row 4: 1, 2, 3, + */}
      <button
        type="button"
        onClick={() => onDigit('1')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="1"
      >
        1
      </button>
      <button
        type="button"
        onClick={() => onDigit('2')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="2"
      >
        2
      </button>
      <button
        type="button"
        onClick={() => onDigit('3')}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="3"
      >
        3
      </button>
      <button
        type="button"
        onClick={() => onOperator('+')}
        className={`${btnBase} ${standardBtnSize} ${getOperatorClass('+')}`}
        aria-label="Add"
      >
        +
      </button>

      {/* Row 5: 0 (wide pill button), ., = */}
      <button
        type="button"
        onClick={() => onDigit('0')}
        className={`col-span-2 flex items-center justify-start pl-7 sm:pl-8 h-16 sm:h-20 rounded-full select-none cursor-pointer transition-all active:brightness-125 transition-transform active:scale-95 duration-150 outline-none text-3xl sm:text-4xl ${darkGrayBtn}`}
        aria-label="0"
      >
        0
      </button>

      <button
        type="button"
        onClick={onDecimal}
        className={`${btnBase} ${standardBtnSize} ${darkGrayBtn}`}
        aria-label="Decimal"
      >
        .
      </button>

      <button
        type="button"
        onClick={onEquals}
        className={`${btnBase} ${standardBtnSize} bg-[#ff9f0a] text-white hover:bg-[#ffaa26] active:bg-[#fca311]`}
        aria-label="Equals"
      >
        =
      </button>
    </div>
  );
};
