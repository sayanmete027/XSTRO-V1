import { getAntiCall, isSudo } from '#sql';
import { toJid } from '#utils';
import { delay } from '#libary';

export const AntiCall = async (calls, client) => {
  for (const call of calls) {
    const { id, from, status, isGroup } = call;

    if (isGroup || isSudo(from)) continue;

    const antiCallConfig = await getAntiCall();
    if (antiCallConfig.status !== 'on' || status !== 'offer') return;

    await client.rejectCall(id, from);

    if (antiCallConfig.action === 'block') {
      await client.sendMessage(from, { text: 'You have been blocked for Calling' });
      await delay(3000);
      await client.updateBlockStatus(toJid(from), 'block');
    } else {
      await client.sendMessage(from, {
        text: 'Your Call has been Automatically Declined, No Calls Allowed',
      });
    }
  }
};
