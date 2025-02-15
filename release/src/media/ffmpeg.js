"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSticker = exports.isAnimatedWebp = exports.cropToCircle = exports.GIFBufferToVideoBuffer = void 0;
exports.audioToBlackVideo = audioToBlackVideo;
exports.flipMedia = flipMedia;
exports.webpToImage = webpToImage;
exports.convertToMp3 = convertToMp3;
exports.toPTT = toPTT;
exports.toVideo = toVideo;
exports.resizeImage = resizeImage;
exports.convertWebPFile = convertWebPFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importStar(require("os"));
const sharp_1 = __importDefault(require("sharp"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const src_1 = require("../../src");
const crypto_1 = __importDefault(require("crypto"));
const node_webpmux_1 = __importDefault(require("node-webpmux"));
const src_2 = require("../../src");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const { writeFileSync, existsSync, readFileSync, mkdirSync } = fs_1.default;
const tempDir = path_1.default.join(os_1.default.tmpdir(), 'media-temp');
if (!existsSync(tempDir))
    mkdirSync(tempDir, { recursive: true });
function temp(ext) {
    return path_1.default.join(tempDir, `${Date.now()}.${ext}`);
}
async function saveInputFile(buffer) {
    const fileType = await (0, src_1.FileTypeFromBuffer)(buffer);
    if (!fileType)
        throw new Error('Unknown file type');
    const inputPath = temp(fileType);
    writeFileSync(inputPath, buffer);
    return inputPath;
}
const GIFBufferToVideoBuffer = async (image) => {
    const gifPath = temp('gif');
    const mp4Path = temp('mp4');
    writeFileSync(gifPath, image);
    try {
        await execAsync(`ffmpeg -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -f mp4 "${mp4Path}"`);
        const buffer = readFileSync(mp4Path);
        fs_1.default.unlinkSync(mp4Path);
        fs_1.default.unlinkSync(gifPath);
        return buffer;
    }
    catch (error) {
        if (existsSync(mp4Path))
            fs_1.default.unlinkSync(mp4Path);
        if (existsSync(gifPath))
            fs_1.default.unlinkSync(gifPath);
        throw error;
    }
};
exports.GIFBufferToVideoBuffer = GIFBufferToVideoBuffer;
async function audioToBlackVideo(input) {
    const inputFile = await saveInputFile(input);
    const video = temp('mp4');
    try {
        await execAsync(`ffmpeg -f lavfi -i "color=black:s=1920x1080:r=30" -i "${inputFile}" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -b:a 128k -map 0:v -map 1:a -shortest "${video}"`);
        const buffer = readFileSync(video);
        fs_1.default.unlinkSync(video);
        fs_1.default.unlinkSync(inputFile);
        return buffer;
    }
    catch (error) {
        if (existsSync(video))
            fs_1.default.unlinkSync(video);
        if (existsSync(inputFile))
            fs_1.default.unlinkSync(inputFile);
        throw error;
    }
}
async function flipMedia(input, direction) {
    const inputFile = await saveInputFile(input);
    const fileType = await (0, src_1.FileTypeFromBuffer)(input);
    const outputFile = temp(fileType);
    const validDirections = {
        left: 'transpose=2',
        right: 'transpose=1',
        vertical: 'vflip',
        horizontal: 'hflip',
    };
    try {
        await execAsync(`ffmpeg -i "${inputFile}" -vf "${validDirections[direction]}" "${outputFile}"`);
        const buffer = readFileSync(outputFile);
        fs_1.default.unlinkSync(outputFile);
        fs_1.default.unlinkSync(inputFile);
        return buffer;
    }
    catch (error) {
        if (existsSync(outputFile))
            fs_1.default.unlinkSync(outputFile);
        if (existsSync(inputFile))
            fs_1.default.unlinkSync(inputFile);
        throw error;
    }
}
async function webpToImage(input) {
    const inputFile = temp('webp');
    const outputImage = temp('jpg');
    writeFileSync(inputFile, input);
    try {
        await execAsync(`ffmpeg -i "${inputFile}" "${outputImage}"`);
        const buffer = readFileSync(outputImage);
        fs_1.default.unlinkSync(outputImage);
        fs_1.default.unlinkSync(inputFile);
        return buffer;
    }
    catch (error) {
        if (existsSync(outputImage))
            fs_1.default.unlinkSync(outputImage);
        if (existsSync(inputFile))
            fs_1.default.unlinkSync(inputFile);
        throw error;
    }
}
async function convertToMp3(input) {
    const inputFile = await saveInputFile(input);
    const outputAudio = temp('mp3');
    try {
        await execAsync(`ffmpeg -i "${inputFile}" -c:a libmp3lame -b:a 192k "${outputAudio}"`);
        const buffer = readFileSync(outputAudio);
        fs_1.default.unlinkSync(outputAudio);
        fs_1.default.unlinkSync(inputFile);
        return buffer;
    }
    catch (error) {
        if (existsSync(outputAudio))
            fs_1.default.unlinkSync(outputAudio);
        if (existsSync(inputFile))
            fs_1.default.unlinkSync(inputFile);
        throw error;
    }
}
async function toPTT(input) {
    const inputFile = await saveInputFile(input);
    const outputAudio = temp('opus');
    try {
        await execAsync(`ffmpeg -i "${inputFile}" -c:a libopus -ac 1 -ar 48000 -b:a 128k -application voip "${outputAudio}"`);
        const buffer = readFileSync(outputAudio);
        fs_1.default.unlinkSync(outputAudio);
        fs_1.default.unlinkSync(inputFile);
        return buffer;
    }
    catch (error) {
        if (existsSync(outputAudio))
            fs_1.default.unlinkSync(outputAudio);
        if (existsSync(inputFile))
            fs_1.default.unlinkSync(inputFile);
        throw error;
    }
}
async function toVideo(input) {
    const inputFile = await saveInputFile(input);
    const outputVideo = temp('mp4');
    try {
        await execAsync(`ffmpeg -i "${inputFile}" -c:v libx264 -crf 32 -preset slow -c:a aac -b:a 128k -ar 44100 "${outputVideo}"`);
        const buffer = readFileSync(outputVideo);
        fs_1.default.unlinkSync(outputVideo);
        fs_1.default.unlinkSync(inputFile);
        return buffer;
    }
    catch (error) {
        if (existsSync(outputVideo))
            fs_1.default.unlinkSync(outputVideo);
        if (existsSync(inputFile))
            fs_1.default.unlinkSync(inputFile);
        throw error;
    }
}
const cropToCircle = async (input) => {
    try {
        const image = (0, sharp_1.default)(input);
        const { width, height } = await image.metadata();
        const circleMask = Buffer.from(`<svg width="${width}" height="${height}">
		<circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2}" fill="white"/>
	  </svg>`);
        const croppedImage = await image
            .composite([{ input: circleMask, blend: 'dest-in' }])
            .toFormat('webp', { quality: 50 })
            .toBuffer();
        return croppedImage;
    }
    catch (error) {
        console.error('Error cropping image to circle:', error);
        throw error;
    }
};
exports.cropToCircle = cropToCircle;
async function resizeImage(imageBuffer, width, height) {
    if (!Buffer.isBuffer(imageBuffer)) {
        throw new Error('The imageBuffer parameter must be a valid Buffer.');
    }
    return (0, sharp_1.default)(imageBuffer)
        .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
    })
        .toBuffer();
}
const isAnimatedWebp = (filePath) => {
    return new Promise((resolve, reject) => {
        (0, sharp_1.default)(filePath)
            .metadata()
            .then((metadata) => {
            resolve((metadata === null || metadata === void 0 ? void 0 : metadata.pages) > 1); // If pages > 1, it's animated
        })
            .catch((error) => {
            reject(error);
        });
    });
};
exports.isAnimatedWebp = isAnimatedWebp;
async function convertWebPFile(media) {
    try {
        const tempDir = path_1.default.join('temp_frames');
        const tempOutput = path_1.default.join(tempDir, 'output.mp4');
        await fs_1.default.promises.mkdir(tempDir, { recursive: true });
        const metadata = await (0, sharp_1.default)(media).metadata();
        if (!metadata.pages)
            throw new Error('Input file is not an animated WebP');
        for (let i = 0; i < metadata.pages; i++) {
            const frame = await (0, sharp_1.default)(media, { page: i }).jpeg({ quality: 90 }).toBuffer();
            await fs_1.default.promises.writeFile(path_1.default.join(tempDir, `frame_${String(i).padStart(5, '0')}.jpg`), frame);
        }
        const ffmpegCommand = `ffmpeg -framerate ${30} -i "${path_1.default.join(tempDir, 'frame_%05d.jpg')}" \
            -c:v libx264 -pix_fmt yuv420p -y "${tempOutput}"`;
        await execAsync(ffmpegCommand);
        const buffer = await fs_1.default.promises.readFile(tempOutput);
        await fs_1.default.promises.rm(tempDir, { recursive: true });
        return buffer;
    }
    catch (error) {
        try {
            await fs_1.default.promises.rm('temp_frames', { recursive: true, force: true });
        }
        catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
        console.error('Error during conversion:', error);
        throw error;
    }
}
async function imageToWebp(media) {
    const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`);
    fs_1.default.writeFileSync(tmpFileIn, media);
    const ffmpegCommand = `ffmpeg -i "${tmpFileIn}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -quality 60 "${tmpFileOut}"`;
    try {
        const { stderr } = await execAsync(ffmpegCommand);
        if (stderr)
            console.error('FFmpeg stderr:', stderr);
        const buff = fs_1.default.readFileSync(tmpFileOut);
        fs_1.default.unlinkSync(tmpFileOut);
        fs_1.default.unlinkSync(tmpFileIn);
        return buff;
    }
    catch (error) {
        if (fs_1.default.existsSync(tmpFileIn))
            fs_1.default.unlinkSync(tmpFileIn);
        if (fs_1.default.existsSync(tmpFileOut))
            fs_1.default.unlinkSync(tmpFileOut);
        throw new Error(`FFmpeg conversion failed: ${error.message}`);
    }
}
async function videoToWebp(media) {
    const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);
    fs_1.default.writeFileSync(tmpFileIn, media);
    const ffmpegCommand = `ffmpeg -i "${tmpFileIn}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -c:v libwebp -loop 0 -preset picture -t 00:00:05 -quality 60 "${tmpFileOut}"`;
    try {
        const { stderr } = await execAsync(ffmpegCommand);
        if (stderr)
            console.error('FFmpeg stderr:', stderr);
        const buff = fs_1.default.readFileSync(tmpFileOut);
        fs_1.default.unlinkSync(tmpFileOut);
        fs_1.default.unlinkSync(tmpFileIn);
        return buff;
    }
    catch (error) {
        if (fs_1.default.existsSync(tmpFileIn))
            fs_1.default.unlinkSync(tmpFileIn);
        if (fs_1.default.existsSync(tmpFileOut))
            fs_1.default.unlinkSync(tmpFileOut);
        throw new Error(`FFmpeg conversion failed: ${error.message}`);
    }
}
async function writeExifImg(media, metadata = {}) {
    const wMedia = await imageToWebp(media);
    const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    try {
        fs_1.default.writeFileSync(tmpFileIn, wMedia);
        const img = new node_webpmux_1.default.Image();
        await img.load(tmpFileIn);
        if (metadata.packname || metadata.author) {
            const json = {
                'sticker-pack-id': `https://github.com/AstroX11/Xstro`,
                'sticker-pack-name': metadata.packname,
                'sticker-pack-publisher': metadata.author,
                emojis: metadata.categories ? metadata.categories : [''],
            };
            const exifAttr = Buffer.from([
                0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
            ]);
            const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
            const exif = Buffer.concat([exifAttr, jsonBuff]);
            exif.writeUIntLE(jsonBuff.length, 14, 4);
            img.exif = exif;
        }
        await img.save(tmpFileOut);
        const buff = fs_1.default.readFileSync(tmpFileOut);
        fs_1.default.unlinkSync(tmpFileOut);
        fs_1.default.unlinkSync(tmpFileIn);
        return buff;
    }
    catch (error) {
        if (fs_1.default.existsSync(tmpFileIn))
            fs_1.default.unlinkSync(tmpFileIn);
        if (fs_1.default.existsSync(tmpFileOut))
            fs_1.default.unlinkSync(tmpFileOut);
        throw error;
    }
}
async function writeExifVid(media, metadata = {}) {
    const wMedia = await videoToWebp(media);
    const tmpFileIn = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileOut = path_1.default.join((0, os_1.tmpdir)(), `${crypto_1.default.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    try {
        fs_1.default.writeFileSync(tmpFileIn, wMedia);
        const img = new node_webpmux_1.default.Image();
        await img.load(tmpFileIn);
        if (metadata.packname || metadata.author) {
            const json = {
                'sticker-pack-id': `https://github.com/AstroX11/Xstro`,
                'sticker-pack-name': metadata.packname,
                'sticker-pack-publisher': metadata.author,
                emojis: metadata.categories ? metadata.categories : [''],
            };
            const exifAttr = Buffer.from([
                0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
            ]);
            const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
            const exif = Buffer.concat([exifAttr, jsonBuff]);
            exif.writeUIntLE(jsonBuff.length, 14, 4);
            img.exif = exif;
        }
        await img.save(tmpFileOut);
        const buff = fs_1.default.readFileSync(tmpFileOut);
        fs_1.default.unlinkSync(tmpFileOut);
        fs_1.default.unlinkSync(tmpFileIn);
        return buff;
    }
    catch (error) {
        if (fs_1.default.existsSync(tmpFileIn))
            fs_1.default.unlinkSync(tmpFileIn);
        if (fs_1.default.existsSync(tmpFileOut))
            fs_1.default.unlinkSync(tmpFileOut);
        throw error;
    }
}
const createSticker = async (buffer, author, packname) => {
    const mime = await (0, src_1.getMimeType)(buffer);
    let res;
    const options = {
        packname: packname || src_2.LANG.STICKER_META.split(';')[0],
        author: author || src_2.LANG.STICKER_META.split(';')[1],
    };
    try {
        if (mime.startsWith('image/')) {
            res = await writeExifImg(buffer, options);
        }
        else if (mime.startsWith('video/')) {
            res = await writeExifVid(buffer, options);
        }
        else {
            throw new Error('Only images and videos are supported');
        }
        return res;
    }
    catch (error) {
        console.error('Sticker creation error:', error);
        throw new Error(`Sticker creation failed: ${error.message}`);
    }
};
exports.createSticker = createSticker;
