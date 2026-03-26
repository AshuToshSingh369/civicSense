/**
 * JestConfiguration
 */

module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'controllers/**/*.js',
        'models/**/*.js',
        'services/**/*.js',
        'routes/**/*.js',
        '!**/node_modules/**',
        '!**/dist/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    testTimeout: 10000,
    verbose: true
};
