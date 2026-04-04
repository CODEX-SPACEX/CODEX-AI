
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

/**
 * 🪐 CODEX-AI INDEPENDENT LIBRARY: CONVERTER
 * Location: /Library/converter.js
 */

function ffmpeg(buffer, args = [], ext = '', res = '') {
    return new Promise(async (resolve, reject) => {
        try {
            // Path logic: Go out of /Library/ and into /tmp/
            const tmpDir = path.join(__dirname, '../tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const fileName = crypto.randomBytes(6).toString('hex');
            const tmpFile = path.join(tmpDir, `${fileName}.${ext}`);
            const outFile = `${tmpFile}.${res}`;

            await fs.promises.writeFile(tmpFile, buffer);
            
            const process = spawn('ffmpeg', [
                '-y',
                '-i', tmpFile,
                ...args,
                outFile
            ]);

            process.on('error', (err) => {
                if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
                reject(err);
            });

            process.on('close', async (code) => {
                try {
                    if (fs.existsSync(tmpFile)) await fs.promises.unlink(tmpFile);
                    if (code !== 0) return reject(new Error(`FFmpeg failed with code ${code}`));
                    
                    const data = await fs.promises.readFile(outFile);
                    if (fs.existsSync(outFile)) await fs.promises.unlink(outFile);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * 🖼️ Image/Video to WebP Sticker
 */
function toSticker(buffer, ext) {
    return ffmpeg(buffer, [
        '-vcodec', 'libwebp',
        '-vf', "scale='if(gt(iw,ih),512,-1)':'if(gt(iw,ih),-1,512)':force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(512-iw)/2:(512-ih)/2:color=#00000000",
        '-lossless', '1',
        '-loop', '0',
        '-preset', 'default',
        '-an', '-vsync', '0'
    ], ext, 'webp');
}

/**
 * 🎵 Audio Optimizer
 */
function toAudio(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'
    ], ext, 'mp3');
}

/**
 * 🎥 Video/GIF Optimizer
 */
function toVideo(buffer, ext) {
    return ffmpeg(buffer, [
        '-c:v', 'libx264', '-c:a', 'aac', '-ab', '128k', '-ar', '44100', '-crf', '28', '-preset', 'faster', '-pix_fmt', 'yuv420p'
    ], ext, 'mp4');
}

module.exports = {
    toAudio,
    toVideo,
    toSticker,
    ffmpeg
};




      
