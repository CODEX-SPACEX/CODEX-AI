
const { 
    processTime, 
    getContentType, 
    generateWAMessageFromContent, 
    proto 
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * 🪐 CODEX-AI SIMPLE EXPANSION
 * Location: /Library/simple.js
 */

module.exports = (sock) => {

    /**
     * Clean & Decode JID
     */
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jid.split(':');
            return decode[0] + '@' + decode[1].split('@')[1] || jid;
        } else return jid;
    };

    /**
     * Simplified Reply Function
     * Usage: m.reply("text")
     */
    sock.reply = async (jid, text, quoted, options) => {
        return sock.sendMessage(jid, { 
            text: text, 
            contextInfo: { 
                externalAdReply: { 
                    title: global.botname, 
                    body: global.ownername, 
                    thumbnail: fs.existsSync('./src/assets/logo.jpg') ? fs.readFileSync('./src/assets/logo.jpg') : null,
                    sourceUrl: global.repo,
                    mediaType: 1,
                    renderLargerThumbnail: true 
                } 
            },
            ...options 
        }, { quoted });
    };

    /**
     * Send Contact Card
     */
    sock.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = [];
        for (let i of kon) {
            list.push({
                displayName: global.ownername,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.ownername}\nFN:${global.ownername}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
            });
        }
        sock.sendMessage(jid, {
            contacts: { displayName: `${list.length} Contact`, contacts: list },
            ...opts
        }, { quoted });
    };

    /**
     * Prototyping the Message Object (m)
     */
    sock.serializeM = (m) => {
        if (!m) return m;
        let M = proto.WebMessageInfo;
        if (m.key) {
            m.id = m.key.id;
            m.isBot = m.id.startsWith('BAE5') && m.id.length === 16;
            m.chat = m.key.remoteJid;
            m.fromMe = m.key.fromMe;
            m.isGroup = m.chat.endsWith('@g.us');
            m.sender = sock.decodeJid(m.fromMe ? sock.user.id : m.isGroup ? m.key.participant : m.chat);
        }
        if (m.message) {
            m.mtype = getContentType(m.message);
            m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
            m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || m.mtype || '';
            
            // Easy Reply method attached to message
            m.reply = (text, quoted, options) => sock.reply(m.chat, text, quoted || m, options);
        }
        return m;
    };

    return sock;
};





