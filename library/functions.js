
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

/**
 * 🪐 CODEX-AI MASTER FUNCTIONS
 * Location: /Library/functions.js
 */

/**
 * Decode JID (Converts 234xxx@s.whatsapp.net to a clean number)
 */
const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return decode.user && decode.server && decode.user + '@' + decode.server || jid;
    } else return jid;
};

/**
 * Get Buffer from URL or File (For Welcome/Goodbye Images)
 */
const getBuffer = async (url, options) => {
    try {
        options ? options : {};
        const res = await axios({
            method: "get",
            url,
            headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (err) {
        return null;
    }
};

/**
 * Runtime Formatter (For @time in your Bio/Deployment message)
 */
const runtime = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
};

/**
 * Check if a User is an Admin in a Group
 */
const getGroupAdmins = (participants) => {
    let admins = [];
    for (let i of participants) {
        i.admin === "admin" || i.admin === "superadmin" ? admins.push(i.id) : "";
    }
    return admins;
};

/**
 * Format File Size (For Storage Monitoring)
 */
const formatSize = (bytes) => {
    if (bytes >= 1000000000) return (bytes / 1000000000).toFixed(2) + ' GB';
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(2) + ' MB';
    if (bytes >= 1000) return (bytes / 1000).toFixed(2) + ' KB';
    return bytes + ' bytes';
};

/**
 * Sleep / Delay Function (To prevent Spam bans)
 */
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Randomize Array (For Random Responses/Emojis)
 */
const pickRandom = (list) => {
    return list[Math.floor(list.length * Math.random())];
};

/**
 * Write Buffer to Tmp File (Essential for Media processing)
 */
const saveTmp = async (buffer, ext) => {
    const filename = path.join(__dirname, '../tmp', Date.now() + '.' + ext);
    await fs.promises.writeFile(filename, buffer);
    return filename;
};

module.exports = {
    decodeJid,
    getBuffer,
    runtime,
    getGroupAdmins,
    formatSize,
    sleep,
    pickRandom,
    saveTmp
};



