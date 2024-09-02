module.exports = {
    preset: 'ts-jest', // Use ts-jest preset to handle TypeScript files
    testEnvironment: 'node', // Use Node environment for testing
    transform: {
      '^.+\\.ts?$': 'ts-jest', // Transform .ts files using ts-jest
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'], // Recognize these extensions
  };
  