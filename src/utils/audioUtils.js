/**
 * Audio utility functions for workout timer
 */

// Create and play a lyre-like sound using Web Audio API
export const playLyreSound = () => {
  try {
    // Create or reuse audio context
    const audioContext = getAudioContext();

    // Create and play the lyre sound
    playLyreOscillators(audioContext);

  } catch (error) {
    console.error('Error playing lyre sound:', error);
  }
};

// Get or create audio context (singleton pattern)
const getAudioContext = () => {
  if (!window._audioContext) {
    window._audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window._audioContext;
};

// Play lyre oscillators with proper cleanup
const playLyreOscillators = (audioContext) => {
  // Create oscillator for the main note
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Lyre-like sound parameters
  oscillator.type = 'sine'; // Sine wave for a smooth, string-like sound
  oscillator.frequency.value = 880; // A5 note (880 Hz) - bright and clear

  // Envelope for natural decay
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2); // Gentle decay

  // Start and stop the oscillator with cleanup
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 2);

  // Play a lower octave note for a richer sound
  const oscillator2 = audioContext.createOscillator();
  const gainNode2 = audioContext.createGain();

  oscillator2.connect(gainNode2);
  gainNode2.connect(audioContext.destination);

  oscillator2.type = 'sine';
  oscillator2.frequency.value = 440; // A4 note (440 Hz) - fundamental frequency

  gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
  gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.5);

  oscillator2.start(audioContext.currentTime);
  oscillator2.stop(audioContext.currentTime + 2.5);
};

// Check if audio can be played
export const canPlayAudio = () => {
  return !!(window.AudioContext || window.webkitAudioContext);
};

// Cleanup audio context when page unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (window._audioContext) {
      window._audioContext.close();
      delete window._audioContext;
    }
  });
}