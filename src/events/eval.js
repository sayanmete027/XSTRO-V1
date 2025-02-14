import util from 'util';

export async function evaluator(message) {
  if (!message.text) return;

  if (message.text.startsWith('$ ')) {
    try {
      const code = message.text.slice(2);
      const result = await eval(`(async () => { ${code} })()`);
      await message.send(util.inspect(result, { depth: 5 }));
    } catch (error) {
      await message.send('Error: ' + error.message);
    }
  }
}
