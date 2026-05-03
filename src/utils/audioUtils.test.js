import { playLyreSound, canPlayAudio } from './audioUtils';

// Mock AudioContext for testing
const mockAudioContext = {
  createOscillator: () => ({
    type: 'sine',
    frequency: { value: 880 },
    connect: () => {},
    start: () => {},
    stop: () => {}
  }),
  createGain: () => ({
    gain: {
      setValueAtTime: () => {},
      linearRampToValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {}
    },
    connect: () => {}
  }),
  destination: {},
  currentTime: 0
};

// Mock AudioContext constructor
window.AudioContext = jest.fn(() => mockAudioContext);
window.webkitAudioContext = jest.fn(() => mockAudioContext);

describe('AudioUtils', () => {
  beforeEach(() => {
    // Mock console.error to prevent test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should play lyre sound without errors', () => {
    expect(() => {
      playLyreSound();
    }).not.toThrow();
  });

  test('should check if audio can be played', () => {
    expect(canPlayAudio()).toBe(true);
  });
});