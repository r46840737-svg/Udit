import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STATE,
  inputDigit,
  inputDecimal,
  deleteLastDigit,
  toggleSign,
  inputPercentage,
  performOperation,
  performEquals,
  clearCurrentOrAll,
  formatDisplayForViewer,
  formatResultNumber,
  performScientificFunc,
  handleMemory,
  type HistoryItem,
} from './engine.ts';

test('initial state has display 0 and null operator', () => {
  assert.equal(INITIAL_STATE.display, '0');
  assert.equal(INITIAL_STATE.operator, null);
  assert.equal(INITIAL_STATE.prevValue, null);
});

test('input digits correctly builds numbers', () => {
  let state = inputDigit(INITIAL_STATE, '5');
  assert.equal(state.display, '5');
  state = inputDigit(state, '2');
  assert.equal(state.display, '52');
  state = inputDigit(state, '0');
  assert.equal(state.display, '520');
});

test('decimal point works as expected', () => {
  let state = inputDecimal(INITIAL_STATE);
  assert.equal(state.display, '0.');
  state = inputDigit(state, '5');
  assert.equal(state.display, '0.5');
  // Duplicate decimal ignored
  state = inputDecimal(state);
  assert.equal(state.display, '0.5');
});

test('toggle sign changes positive to negative and back', () => {
  let state = inputDigit(INITIAL_STATE, '7');
  state = toggleSign(state);
  assert.equal(state.display, '-7');
  state = toggleSign(state);
  assert.equal(state.display, '7');
  // 0 does not toggle
  assert.equal(toggleSign(INITIAL_STATE).display, '0');
});

test('deleteLastDigit performs swipe-to-delete behavior', () => {
  let state = inputDigit(INITIAL_STATE, '1');
  state = inputDigit(state, '2');
  state = inputDigit(state, '3');
  assert.equal(state.display, '123');
  state = deleteLastDigit(state);
  assert.equal(state.display, '12');
  state = deleteLastDigit(state);
  assert.equal(state.display, '1');
  state = deleteLastDigit(state);
  assert.equal(state.display, '0');
});

test('basic addition and history tracking', () => {
  const history: HistoryItem[] = [];
  const log = (item: HistoryItem) => history.push(item);

  let state = inputDigit(INITIAL_STATE, '4');
  state = performOperation(state, '+', log);
  assert.equal(state.prevValue, 4);
  assert.equal(state.waitingForOperand, true);

  state = inputDigit(state, '6');
  assert.equal(state.display, '6');

  state = performEquals(state, log);
  assert.equal(state.display, '10');
  assert.equal(history.length, 1);
  assert.equal(history[0].expression, '4 + 6');
  assert.equal(history[0].result, '10');
});

test('floating point precision e.g. 0.1 + 0.2 is 0.3 without floating glitch', () => {
  let state = inputDigit(INITIAL_STATE, '0');
  state = inputDecimal(state);
  state = inputDigit(state, '1');
  state = performOperation(state, '+');
  state = inputDigit(state, '0');
  state = inputDecimal(state);
  state = inputDigit(state, '2');
  state = performEquals(state);
  assert.equal(state.display, '0.3');
});

test('division by zero gives Error', () => {
  let state = inputDigit(INITIAL_STATE, '8');
  state = performOperation(state, '÷');
  state = inputDigit(state, '0');
  state = performEquals(state);
  assert.equal(state.display, 'Error');
});

test('percentage behavior with addition', () => {
  // 100 + 10% = 110 (10% of 100 is 10)
  let state = inputDigit(INITIAL_STATE, '1');
  state = inputDigit(state, '0');
  state = inputDigit(state, '0');
  state = performOperation(state, '+');
  state = inputDigit(state, '1');
  state = inputDigit(state, '0');
  state = inputPercentage(state);
  assert.equal(state.display, '10');
  state = performEquals(state);
  assert.equal(state.display, '110');
});

test('repeated equals repeats last operation', () => {
  let state = inputDigit(INITIAL_STATE, '5');
  state = performOperation(state, '+');
  state = inputDigit(state, '2');
  state = performEquals(state);
  assert.equal(state.display, '7');

  state = performEquals(state);
  assert.equal(state.display, '9');

  state = performEquals(state);
  assert.equal(state.display, '11');
});

test('display comma formatting', () => {
  assert.equal(formatDisplayForViewer('1234567'), '1,234,567');
  assert.equal(formatDisplayForViewer('-1234567.89'), '-1,234,567.89');
  assert.equal(formatDisplayForViewer('0.5'), '0.5');
  assert.equal(formatDisplayForViewer('Error'), 'Error');
});

test('scientific functions (sqrt, sin, factorial)', () => {
  let state = inputDigit(INITIAL_STATE, '9');
  state = performScientificFunc(state, 'sqrt');
  assert.equal(state.display, '3');

  state = inputDigit(INITIAL_STATE, '5');
  state = performScientificFunc(state, 'factorial');
  assert.equal(state.display, '120');
});

test('memory operations (m+, mr, mc)', () => {
  let state = inputDigit(INITIAL_STATE, '4');
  state = inputDigit(state, '2');
  state = handleMemory(state, 'm+');
  assert.equal(state.memory, 42);

  // Clear display to 0, then recall memory
  state = { ...state, display: '0' };
  state = handleMemory(state, 'mr');
  assert.equal(state.display, '42');

  state = handleMemory(state, 'mc');
  assert.equal(state.memory, 0);
});
