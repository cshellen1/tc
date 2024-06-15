module.exports = {
  testEnvironmentOptions: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.vue$': 'vite-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
};
