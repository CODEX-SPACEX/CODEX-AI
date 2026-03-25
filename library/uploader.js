
const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

/**
 * 🪐 CODEX-AI DYNAMIC UPLOADER
 * Location: /Library/uploader.js
 * Purpose: Temporary hosting for user-generated media.
 */

/**
 * Upload to Telegra.ph (Fastest for images/short videos < 5MB)
 * @param {Buffer} buffer 
 */
async function telegraph(buffer) {
    try {
        const { ext } = await fromBuffer(buffer) || { ext: 'jpg' };
        let form = new FormData();
        form.append('file', buffer, `tmp.${ext}`);
        
        const res = await axios.post('https://telegra.ph/upload', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        
        // Returns: https://telegra.ph/file/xxxxx.jpg
        return 'https://telegra.ph' + res.data[0].src;
    } catch (err) {
        throw new Error(`Telegraph Upload Failed: ${err.message}`);
    }
}

/**
 * Upload to Catbox (Best for larger files & all extensions)
 * @param {Buffer} buffer 
 */
async function catbox(buffer) {
    try {
        const { ext } = await fromBuffer(buffer) || { ext: 'bin' };
        let form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, `tmp.${ext}`);

        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        
        // Returns: https://files.catbox.moe/xxxxx.ext
        return res.data; 
    } catch (err) {
        throw new Error(`Catbox Upload Failed: ${err.message}`);
    }
}

/**
 * Upload to Quax (Alternative)
 * @param {Buffer} buffer 
 */
async function quax(buffer) {
    try {
        const { ext } = await fromBuffer(buffer) || { ext: 'bin' };
        let form = new FormData();
        form.append('files[]', buffer, `tmp.${ext}`);

        const res = await axios.post('https://qu.ax/upload.php', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        return res.data.files[0].url;
    } catch (err) {
        throw new Error(`Quax Upload Failed: ${err.message}`);
    }
}

module.exports = {
    telegraph,
    catbox,
    quax
};




  
