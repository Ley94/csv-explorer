module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/test-setup.js"],
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
