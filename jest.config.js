export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock FoodSearch because it uses import.meta.env which Babel/Jest can't parse
    '^.*/FoodSearch(\\.jsx)?$': '<rootDir>/src/components/__mocks__/FoodSearch.jsx'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
