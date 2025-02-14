import { evaluator } from './eval.js';
import { autoSaveBroadCast } from './autosave.js';

export const Xevents = async (messages, client) => {
  const tasks = [evaluator(messages, client), autoSaveBroadCast(messages, client)];

  try {
    const results = await Promise.all(
      tasks.map((task) =>
        task.catch((err) => {
          console.error(`Task failed:`, err);
          return null;
        })
      )
    );
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error('Critical error in Xevents:', error);
    throw error; // Re-throw critical errors for upstream handling
  }
};
