"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Xevents = void 0;
const eval_1 = require("./eval");
const autosave_1 = require("./autosave");
const Xevents = async (messages, client) => {
  const tasks = [(0, eval_1.evaluator)(messages), (0, autosave_1.autoSaveBroadCast)(messages)];
  try {
    const results = await Promise.all(tasks.map(task => task.catch(err => {
      console.error(`Task failed:`, err);
      return null;
    })));
    return results.filter(result => result !== null);
  } catch (error) {
    console.error('Critical error in Xevents:', error);
    throw error; // Re-throw critical errors for upstream handling
  }
};
exports.Xevents = Xevents;