<<<<<<< HEAD
import { runCommand, saveMessage, serialize } from "#default";
import { Initator } from "./initator.mjs";
import { WASocket } from "baileys";
=======
import { evaluator } from './eval.mjs';
import { autoSaveBroadCast } from './autosave.mjs';
import { WASocket } from 'baileys';
import { Message } from 'index.mjs';
import { LoggerMsg } from './loggers.mjs';
>>>>>>> parent of 10ae71d (test)

export const Xevents = async (messages: Message, client: WASocket) => {
    const tasks = [evaluator(messages), autoSaveBroadCast(messages),LoggerMsg(messages)];

<<<<<<< HEAD
        await Promise.all([runCommand(msg, client), Initator(msg, client), saveMessage(msg)]);
=======
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
>>>>>>> parent of 10ae71d (test)
    }
};