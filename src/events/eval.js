import util from 'util';

export async function evaluator(message) {
  if (!message.body) return;

  if (message.body.startsWith('$ ')) {
    try {
      const code = message.body.slice(2);
      const result = await eval(`(async () => { ${code} })()`);
      await message.send(util.inspect(result, { depth: 0 }));
    } catch (error) {
      await message.send('Error: ' + error.message);
    }
  }
}
