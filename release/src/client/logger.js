"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = void 0;
exports.eventlogger = eventlogger;
const pino_1 = __importDefault(require("pino"));
function eventlogger() {
  const methods = ['error', 'warn', 'info', 'debug', 'trace'];
  methods.forEach(method => {
    console[method] = () => {};
  });
  const loggingLibraries = ['pino'];
  loggingLibraries.forEach(lib => {
    try {
      const logger = require(lib);
      if (logger && typeof logger.createLogger === 'function') {
        logger.createLogger = () => ({
          info: () => {},
          warn: () => {},
          error: () => {},
          debug: () => {},
          trace: () => {}
        });
      }
    } catch {}
  });
}
exports.logger = (0, pino_1.default)();
exports.logger.level = 'silent';