import { getBuffer, getJson } from 'xstro-utils';

const AIPOINT = {
  Gemini: 'https://bk9.fun/ai/gemini?q=',
};

export async function Bk9AI(option = [''], query = '') {
  let request;
  request = query ? query : undefined;
  if (request === undefined) throw new Error('No Query for Ai found!');
  request = normalizeRequestMessage(request);
  let api_response;
  if (option[0] === 'gemini') {
    api_response = (await getJson(`${AIPOINT.Gemini}${request}`)).BK9;
    return normalizeResponseMessgae(api_response);
  } else if(option[0]==='gpt') {
  }
}

function normalizeRequestMessage(input = '') {
  if (typeof input !== 'string') return '';

  return input
    .normalize('NFKC') // Normalize Unicode
    .replace(/[\p{Emoji_Presentation}\p{Emoji}\p{Extended_Pictographic}]/gu, '') // Remove emojis
    .replace(/[^a-zA-Z0-9\s.,!?']/g, '') // Remove non-string characters except basic punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

function normalizeResponseMessgae(input) {
  if (typeof input !== 'string') return '';
  let normalized = input.normalize('NFKC');
  normalized = normalized.replace(
    /[\p{Emoji_Presentation}\p{Emoji}\p{Extended_Pictographic}]/gu,
    ''
  );
  normalized = normalized.replace(/(?<=^|[.!?]\s*)(\*\*|##)\s*/g, '');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
}
