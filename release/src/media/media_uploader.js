"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const src_1 = require("../../src");
// Define the ApiError class with proper types
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}
// Define the postUpload function with proper types
async function postUpload(url, { file, ...metadata }, { headers = {}, timeout, signal } = {}) {
    const formData = new FormData();
    // Handle different file types
    if (file instanceof File || file instanceof Blob) {
        formData.append('file', file, file instanceof File
            ? file.name
            : `file${file.type ? `.${file.type.split('/')[1]}` : ''}`);
    }
    else if (Buffer.isBuffer(file)) {
        formData.append('file', new Blob([file]), metadata.filename || 'file.bin');
    }
    else {
        throw new ApiError('Invalid file type. Expected File, Blob, or Buffer.', 400);
    }
    // Append metadata to the form data
    Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
    });
    // Handle timeout and abort signal
    const controller = timeout ? new AbortController() : undefined;
    const timeoutId = timeout ? setTimeout(() => controller === null || controller === void 0 ? void 0 : controller.abort(), timeout) : undefined;
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers,
            signal: signal || (controller === null || controller === void 0 ? void 0 : controller.signal),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new ApiError(data.message || 'Upload failed', response.status, data);
        }
        return data;
    }
    finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}
// Define the upload function with proper types
const upload = async (file) => {
    const response = await postUpload(`${src_1.LANG.API}/api/upload`, { file }, { timeout: 30000 });
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
exports.upload = upload;
