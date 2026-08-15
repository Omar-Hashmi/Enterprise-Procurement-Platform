const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Default export (function) for `const catchAsync = require(...)`
module.exports = catchAsync;

// Named export support for `const { catchAsync } = require(...)`
module.exports.catchAsync = catchAsync;

// Compatibility for transpiled ESM imports `import { catchAsync } from './catchAsync.js'`
module.exports.default = catchAsync;