/**
 * Web Audio API synthesized tactile click sound
 */

let audioCtx: AudioContext | null = null;

export function playKeyClick(type: 'number' | 'operator' | 'function' | 'clear' = 'number') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = 'bandpass';

    if (type === 'operator') {
      osc.frequency.setValueAtTime(320, now);
      filter.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    } else if (type === 'clear') {
      osc.frequency.setValueAtTime(240, now);
      filter.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    } else {
      osc.frequency.setValueAtTime(400, now);
      filter.frequency.setValueAtTime(1600, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.06);

    // Also trigger mobile vibration haptic if available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // Ignore vibration failure
      }
    }
  } catch {
    // Graceful fallback if audio is not permitted
  }
}
