module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.test.json",
      isolatedModules: true,
    },
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  testPathIgnorePatterns: ["<rootDir>/lib"],
  collectCoverageFrom: ["**/*.ts", "**/*.tsx"],
  coverageReporters: ["cobertura", "text", "html"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transformIgnorePatterns: ["node_modules"],
  modulePathIgnorePatterns: [
    "<rootDir>[/\\\\](dist|docs|lib|node_modules)[/\\\\]",
  ],
  setupFiles: ["<rootDir>/test-setup/setupJest.js"],
  testEnvironment: "jest-environment-jsdom-global",
};
