import '@testing-library/jest-dom';

// Add missing globals for React Router
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Spy on console.error globally so tests can assert on it with
// expect(console.error).toHaveBeenCalledWith(...) without having to
// set up the spy themselves.
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  if (typeof console.error.mockRestore === 'function') {
    console.error.mockRestore();
  }
});
