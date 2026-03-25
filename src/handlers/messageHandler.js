
const { getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const db = require('../src/database/dbfunctions');
const { commands } = require('./CommandLoader');

/**
 * 🪐 CODEX-AI MESSAGE HANDLER
 * Location: /Handlers/MessageHandler.js
 */

module.exports = async (sock, m) => {
    try {
        if (m.key && m.key.remoteJid === 'status@broadcast') return;
        if (!m.message) return;

        // 1. Serialize Message
        m = sock.serializeM(m);
        const { chat, fromMe, isGroup, sender, body, mtype } = m;
        const pushname = m.pushName || 'User';
        const prefix = global.prefix || '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : false;
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // 2. Database Update (Users & Chats)
        db.updateUser(sender, { name: pushname });
        if (isGroup) db.updateChat(chat, { name: m.groupMetadata?.subject });

        // 3. Command Execution Logic
        if (isCmd) {
            const cmd = commands.get(command);
            
            if (cmd) {
                // Check for Owner Only commands
                if (cmd.owner && !global.owner.includes(sender.split('@')[0])) {
                    return m.reply("🚫 This command is for my Owner only.");
                }

                // Check for Group Only commands
                if (cmd.group && !isGroup) {
                    return m.reply("          This command can only be used in Groups.");
                }

                // Execute the Command
                await cmd.function(sock, m, {
                    body,
                    args,
                    text,
                    isGroup,
                    sender,
                    pushname,
                    commands,
                    db
                });
            }
        }

        // 4. Non-Command Logic (Like Auto-Read or AI Chat)
        if (global.autoread) await sock.readMessages([m.key]);

    } catch (err) {
        console.error('[ERROR] MessageHandler:', err);
    }
};



