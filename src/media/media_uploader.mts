import { LANG } from "../../src/index.mjs";

// Define the ApiError class with proper types
class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

// Define the types for the postUpload function parameters
interface PostUploadOptions {
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
}

interface Metadata {
    [key: string]: any;
    filename?: string;
}

// Define the postUpload function with proper types
async function postUpload(url: string, { file, ...metadata }: { file: File | Blob | Buffer } & Metadata, { headers = {}, timeout, signal }: PostUploadOptions = {}): Promise<any> {
    const formData = new FormData();

    // Handle different file types
    if (file instanceof File || file instanceof Blob) {
        formData.append("file", file, file instanceof File ? file.name : `file${file.type ? `.${file.type.split("/")[1]}` : ""}`);
    } else if (Buffer.isBuffer(file)) {
        formData.append("file", new Blob([file]), metadata.filename || "file.bin");
    } else {
        throw new ApiError("Invalid file type. Expected File, Blob, or Buffer.", 400);
    }

    // Append metadata to the form data
    Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined) {
            formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
        }
    });

    // Handle timeout and abort signal
    const controller = timeout ? new AbortController() : undefined;
    const timeoutId = timeout ? setTimeout(() => controller?.abort(), timeout) : undefined;

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData,
            headers,
            signal: signal || controller?.signal,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new ApiError(data.message || "Upload failed", response.status, data);
        }
        return data;
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}

// Define the response type for the upload function
interface UploadResponse {
    success: boolean;
    fileUrl: string;
    rawUrl: string;
    expiresAt: string;
    originalname: string;
    size: number;
    type: string;
}

// Define the upload function with proper types
export const upload = async (file: File | Blob | Buffer): Promise<UploadResponse> => {
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
