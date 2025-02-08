import { LANG } from '#extension';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    Object.assign(this, { name: 'ApiError', status, data });
  }
}

async function postUpload(url, { file, ...metadata }, { headers = {}, timeout, signal } = {}) {
  const formData = new FormData();

  if (file instanceof File || file instanceof Blob) {
    formData.append(
      'file',
      file,
      file instanceof Blob && !file.name
        ? `file${file.type ? `.${file.type.split('/')[1]}` : ''}`
        : file.name
    );
  } else if (Buffer.isBuffer(file)) {
    formData.append('file', new Blob([file]), metadata.filename || 'file.bin');
  } else {
    throw new ApiError('Invalid file type. Expected File, Blob, or Buffer.', 400);
  }

  Object.entries(metadata).forEach(
    ([key, value]) =>
      value !== undefined &&
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
  );

  const controller = timeout && new AbortController();
  const timeoutId = timeout && setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
      signal: signal || controller?.signal,
    });

    const data = await response.json();
    if (!response.ok) throw new ApiError(data.message || 'Upload failed', response.status, data);
    return data;
  } finally {
    timeoutId && clearTimeout(timeoutId);
  }
}

export const upload = async (file) => {
  const response = await postUpload(`${LANG.API}/api/upload`, { file }, { timeout: 30000 });
  return {
    success: true,
    fileUrl: response.fileUrl,
    rawUrl: response.rawUrl,
    expiresAt: response.expiresAt,
    originalname: response.originalname,
    size: response.size,
    type: response.type,
  };
};
