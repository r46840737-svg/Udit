/**
 * Pure calculation logic and state machine for iOS Calculator
 */

export type Operator = '+' | '-' | '×' | '÷' | '^' | 'yroot';

export interface CalculatorState {
  display: string;
  prevValue: number | null;
  operator: Operator | null;
  waitingForOperand: boolean;
  lastOperator: Operator | null;
  lastOperand: number | null;
  memory: number;
  angleMode: 'rad' | 'deg';
  is2nd: boolean;
  parenStack: Array<{ prevValue: number | null; operator: Operator | null }>;
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export const INITIAL_STATE: CalculatorState = {
  display: '0',
  prevValue: null,
  operator: null,
  waitingForOperand: false,
  lastOperator: null,
  lastOperand: null,
  memory: 0,
  angleMode: 'rad',
  is2nd: false,
  parenStack: [],
};

// Clean floating point rounding errors, e.g. 0.1 + 0.2 = 0.3
export function formatResultNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) {
    return 'Error';
  }

  // Exact 0
  if (Object.is(num, -0)) {
    num = 0;
  }

  // If number fits nicely within 9 digits
  const abs = Math.abs(num);
  if (abs >= 1e9 || (abs > 0 && abs < 1e-7)) {
    // Scientific notation with 5 decimal precision
    const exp = num.toExponential(5);
    // Remove unnecessary trailing zeroes before e
    return exp.replace(/\.0+e/, 'e').replace(/(\.\d*?[1-9])0+e/, '$1e');
  }

  // Round to max 9 significant digits
  const str = parseFloat(num.toPrecision(9)).toString();
  return str;
}

// Format display string with commas for thousands (like iOS)
export function formatDisplayForViewer(rawDisplay: string): string {
  if (rawDisplay === 'Error') return 'Error';
  if (rawDisplay.includes('e')) return rawDisplay;

  const isNegative = rawDisplay.startsWith('-');
  const unsigned = isNegative ? rawDisplay.slice(1) : rawDisplay;

  const parts = unsigned.split('.');
  const intPart = parts[0];
  const decPart = parts.length > 1 ? parts[1] : null;

  // Add commas to intPart
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const result = (isNegative ? '-' : '') + formattedInt + (decPart !== null ? '.' + decPart : '');
  return result;
}

// Calculate basic operations
export function calculate(op: Operator, a: number, b: number): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      if (b === 0) return NaN;
      return a / b;
    case '^':
      return Math.pow(a, b);
    case 'yroot':
      if (b === 0) return NaN;
      if (a < 0 && Math.abs(b % 2) !== 1) return NaN;
      return Math.sign(a) * Math.pow(Math.abs(a), 1 / b);
  }
}

// Factorial helper
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

export function inputDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.display === 'Error') {
    return {
      ...INITIAL_STATE,
      display: digit,
    };
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: digit,
      waitingForOperand: false,
    };
  }

  if (state.display === '0') {
    return {
      ...state,
      display: digit,
    };
  }

  // Max 9 digits in standard mode (ignoring sign and decimal)
  const digitsCount = state.display.replace(/[-.]/g, '').length;
  if (digitsCount >= 9) {
    return state; // Can't add more digits
  }

  return {
    ...state,
    display: state.display + digit,
  };
}

export function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.display === 'Error') {
    return {
      ...INITIAL_STATE,
      display: '0.',
    };
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
    };
  }

  if (state.display.includes('.')) {
    return state;
  }

  return {
    ...state,
    display: state.display + '.',
  };
}

export function deleteLastDigit(state: CalculatorState): CalculatorState {
  if (state.display === 'Error' || state.waitingForOperand) {
    return state;
  }

  if (state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))) {
    return {
      ...state,
      display: '0',
    };
  }

  return {
    ...state,
    display: state.display.slice(0, -1),
  };
}

export function toggleSign(state: CalculatorState): CalculatorState {
  if (state.display === 'Error' || state.display === '0') {
    return state;
  }

  if (state.display.startsWith('-')) {
    return {
      ...state,
      display: state.display.slice(1),
    };
  }

  return {
    ...state,
    display: '-' + state.display,
  };
}

export function inputPercentage(state: CalculatorState): CalculatorState {
  if (state.display === 'Error') return state;

  const currentVal = parseFloat(state.display);
  if (isNaN(currentVal)) return state;

  // If there is a pending addition or subtraction: e.g. 100 + 10% = 100 + 10 = 110
  if (state.prevValue !== null && (state.operator === '+' || state.operator === '-')) {
    const pct = (state.prevValue * currentVal) / 100;
    return {
      ...state,
      display: formatResultNumber(pct),
    };
  }

  // Otherwise: e.g. 50% = 0.5
  const pct = currentVal / 100;
  return {
    ...state,
    display: formatResultNumber(pct),
  };
}

export function performOperation(
  state: CalculatorState,
  nextOperator: Operator,
  onHistory?: (item: HistoryItem) => void
): CalculatorState {
  if (state.display === 'Error') return state;

  const inputValue = parseFloat(state.display);

  // If already waiting for operand, just switch operator
  if (state.operator && state.waitingForOperand) {
    return {
      ...state,
      operator: nextOperator,
    };
  }

  if (state.prevValue === null) {
    return {
      ...state,
      prevValue: inputValue,
      operator: nextOperator,
      waitingForOperand: true,
      lastOperator: null,
      lastOperand: null,
    };
  }

  if (state.operator) {
    const result = calculate(state.operator, state.prevValue, inputValue);
    const formatted = formatResultNumber(result);

    if (onHistory && formatted !== 'Error') {
      onHistory({
        id: Math.random().toString(36).substring(2, 9),
        expression: `${formatResultNumber(state.prevValue)} ${state.operator} ${formatResultNumber(inputValue)}`,
        result: formatted,
        timestamp: Date.now(),
      });
    }

    if (formatted === 'Error') {
      return {
        ...INITIAL_STATE,
        display: 'Error',
      };
    }

    return {
      ...state,
      display: formatted,
      prevValue: result,
      operator: nextOperator,
      waitingForOperand: true,
      lastOperator: null,
      lastOperand: null,
    };
  }

  return {
    ...state,
    prevValue: inputValue,
    operator: nextOperator,
    waitingForOperand: true,
  };
}

export function performEquals(
  state: CalculatorState,
  onHistory?: (item: HistoryItem) => void
): CalculatorState {
  if (state.display === 'Error') return state;

  const inputValue = parseFloat(state.display);

  // If user pressed operator, then equals right away without second operand
  if (state.operator && state.prevValue !== null) {
    const op = state.operator;
    const operandB = inputValue;
    const result = calculate(op, state.prevValue, operandB);
    const formatted = formatResultNumber(result);

    if (onHistory && formatted !== 'Error') {
      onHistory({
        id: Math.random().toString(36).substring(2, 9),
        expression: `${formatResultNumber(state.prevValue)} ${op} ${formatResultNumber(operandB)}`,
        result: formatted,
        timestamp: Date.now(),
      });
    }

    return {
      ...state,
      display: formatted,
      prevValue: null,
      operator: null,
      waitingForOperand: true,
      lastOperator: op,
      lastOperand: operandB,
    };
  }

  // Repeated equals: e.g. 5 + 2 = 7; then = gives 9, then = gives 11
  if (state.lastOperator && state.lastOperand !== null) {
    const result = calculate(state.lastOperator, inputValue, state.lastOperand);
    const formatted = formatResultNumber(result);

    if (onHistory && formatted !== 'Error') {
      onHistory({
        id: Math.random().toString(36).substring(2, 9),
        expression: `${formatResultNumber(inputValue)} ${state.lastOperator} ${formatResultNumber(state.lastOperand)}`,
        result: formatted,
        timestamp: Date.now(),
      });
    }

    return {
      ...state,
      display: formatted,
      prevValue: null,
      waitingForOperand: true,
    };
  }

  return state;
}

export function clearCurrentOrAll(state: CalculatorState): CalculatorState {
  // If display is not '0', clear to '0' (C button behavior)
  if (state.display !== '0' && !state.waitingForOperand && state.display !== 'Error') {
    return {
      ...state,
      display: '0',
    };
  }

  // Otherwise All Clear (AC behavior)
  return {
    ...INITIAL_STATE,
    memory: state.memory,
    angleMode: state.angleMode,
    is2nd: state.is2nd,
  };
}

// Scientific Single-Operand Functions
export function performScientificFunc(
  state: CalculatorState,
  func: string,
  onHistory?: (item: HistoryItem) => void
): CalculatorState {
  if (state.display === 'Error') return state;

  const x = parseFloat(state.display);
  if (isNaN(x)) return state;

  let res: number = NaN;
  const isDeg = state.angleMode === 'deg';
  const toRad = (angle: number) => (isDeg ? (angle * Math.PI) / 180 : angle);
  const fromRad = (rad: number) => (isDeg ? (rad * 180) / Math.PI : rad);

  switch (func) {
    case 'x2':
      res = x * x;
      break;
    case 'x3':
      res = x * x * x;
      break;
    case '1/x':
      res = x === 0 ? NaN : 1 / x;
      break;
    case 'sqrt':
      res = x < 0 ? NaN : Math.sqrt(x);
      break;
    case 'cbrt':
      res = Math.cbrt(x);
      break;
    case 'ln':
      res = x <= 0 ? NaN : Math.log(x);
      break;
    case 'log10':
      res = x <= 0 ? NaN : Math.log10(x);
      break;
    case 'log2':
      res = x <= 0 ? NaN : Math.log2(x);
      break;
    case 'ex':
      res = Math.exp(x);
      break;
    case '10x':
      res = Math.pow(10, x);
      break;
    case '2x':
      res = Math.pow(2, x);
      break;
    case 'factorial':
      res = factorial(x);
      break;
    case 'sin':
      res = Math.sin(toRad(x));
      break;
    case 'cos':
      res = Math.cos(toRad(x));
      break;
    case 'tan':
      res = Math.tan(toRad(x));
      break;
    case 'asin':
      res = x < -1 || x > 1 ? NaN : fromRad(Math.asin(x));
      break;
    case 'acos':
      res = x < -1 || x > 1 ? NaN : fromRad(Math.acos(x));
      break;
    case 'atan':
      res = fromRad(Math.atan(x));
      break;
    case 'sinh':
      res = Math.sinh(x);
      break;
    case 'cosh':
      res = Math.cosh(x);
      break;
    case 'tanh':
      res = Math.tanh(x);
      break;
    case 'asinh':
      res = Math.asinh(x);
      break;
    case 'acosh':
      res = x < 1 ? NaN : Math.acosh(x);
      break;
    case 'atanh':
      res = x <= -1 || x >= 1 ? NaN : Math.atanh(x);
      break;
    case 'pi':
      res = Math.PI;
      break;
    case 'e':
      res = Math.E;
      break;
    case 'rand':
      res = Math.random();
      break;
    default:
      return state;
  }

  const formatted = formatResultNumber(res);
  if (onHistory && formatted !== 'Error') {
    onHistory({
      id: Math.random().toString(36).substring(2, 9),
      expression: `${func}(${formatResultNumber(x)})`,
      result: formatted,
      timestamp: Date.now(),
    });
  }

  return {
    ...state,
    display: formatted,
    waitingForOperand: true,
  };
}

// Memory Operations
export function handleMemory(state: CalculatorState, action: 'mc' | 'm+' | 'm-' | 'mr'): CalculatorState {
  if (state.display === 'Error') return state;
  const currentVal = parseFloat(state.display) || 0;

  switch (action) {
    case 'mc':
      return { ...state, memory: 0 };
    case 'm+':
      return { ...state, memory: state.memory + currentVal, waitingForOperand: true };
    case 'm-':
      return { ...state, memory: state.memory - currentVal, waitingForOperand: true };
    case 'mr':
      return { ...state, display: formatResultNumber(state.memory), waitingForOperand: true };
  }
}
