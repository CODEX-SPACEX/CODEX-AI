const { getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const { applyFont } = require('./fontEngine');

class MessageHandler {
    constructor(bot) {
        this.bot = bot;
    }

    async handle(msg) {
        try {
            const m = this.smsg(msg);
            if (!m) return;

            const jid    = m.chat;
            const sender = m.sender;
            const text   = m.text || '';

            // Debug logging
            console.log(`[Message] From: ${sender} in ${jid} | Text: ${text.substring(0, 50)}`);

            // Ignore broadcast
            if (jid === 'status@broadcast') {
                // Handle status mentions for anti-group mention
                await this._handleStatusMention(m);
                return;
            }

            // Check if this is owner's DM - ALWAYS allow
            const isOwnerDM = jid === this.bot.config.owner.number;
            const isOwner = this.bot.permission.isOwner(sender);
            
            console.log(`[Message] isOwnerDM: ${isOwnerDM}, isOwner: ${isOwner}`);

            // ── MODE CHECK ─────────────────────────────────────────────────────
            // In private mode, ONLY owner/mod/sudo can interact with the bot at all.
            if ((this.bot.config.mode || 'public') === 'private') {
                if (!isOwner && !this.bot.permission.isMod(sender) && !this.bot.permission.isSudo(sender)) {
                    console.log(`[Message] Blocked: Private mode and not authorized`);
                    return;
                }
            }

            // ── MUTE CHECK ──────────────────────────────────────────────────────
            let muteDb = {};
            try { muteDb = JSON.parse(fs.readFileSync('./database/muteusers.json', 'utf8')); } catch {}
            const muteEntry = muteDb[this.bot.permission._clean(sender)];
            if (muteEntry) {
                if (!muteEntry.stickersOnly) {
                    console.log(`[Message] Blocked: User is muted`);
                    return;
                }
                if (m.type === 'stickerMessage') {
                    console.log(`[Message] Blocked: Stickers only mode`);
                    return;
                }
            }

            // ── AFK ─────────────────────────────────────────────────────────────
            await this.bot.afkSystem.checkAFK(m);

            // ── AUTO REACT ──────────────────────────────────────────────────────
            const arCfg = this.bot.config.autoReact;
            if (arCfg?.enabled && text && !m.key.fromMe) {
                await this.bot.sock.sendMessage(jid, {
                    react: { text: arCfg.emoji || '❤️', key: m.key }
                }).catch(() => {});
            }

            // ── MENTION REACT ───────────────────────────────────────────────────
            const mrCfg = this.bot.config.mentionReact;
            if (mrCfg?.enabled && !m.key.fromMe) {
                const botClean = this.bot.permission._clean(this.bot.sock.user?.id || '');
                const mentioned = (m.mentions || []).some(x => this.bot.permission._clean(x) === botClean);
                if (mentioned) {
                    await this.bot.sock.sendMessage(jid, {
                        react: { text: mrCfg.emoji || '❤️', key: m.key }
                    }).catch(() => {});
                }
            }

            // ── ANTI-SYSTEMS (groups only, non-privileged) ──────────────────────
            if (m.isGroup) {
                const priv = isOwner || this.bot.permission.isMod(sender);
                const adm  = priv || await this.bot.permission.isAdmin(jid, sender);
                if (!adm) {
                    const blocked = await this.bot.antiSystems.checkAll(m);
                    if (blocked) return;
                }
            }

            // ── STICKER CMD ─────────────────────────────────────────────────────
            if (m.type === 'stickerMessage' && m.msg?.fileSha256) {
                await this._handleStickerCommand(m);
                return;
            }

            // ── #notename shorthand ─────────────────────────────────────────────
            if (text.startsWith('#') && text.length > 1) {
                const name = text.slice(1).trim().toLowerCase();
                let db = {};
                try { db = JSON.parse(fs.readFileSync('./database/notes.json', 'utf8')); } catch {}
                const note = db[jid]?.[name];
                if (note) {
                    await this.bot.sendMessage(jid, { text: `📌 *${name.toUpperCase()}*\n\n${note.text}` });
                    return;
                }
            }

            // ── PREFIX CHECK ─────────────────────────────────────────────────────
            if (!text.startsWith(this.bot.prefix)) return;

            const args        = text.slice(this.bot.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command     = this.bot.commandHandler.getCommand(commandName);
            
            if (!command) {
                console.log(`[Command] Not found: ${commandName}`);
                return;
            }

            console.log(`[Command] Found: ${commandName}, ownerOnly: ${command.ownerOnly}, modOnly: ${command.modOnly}`);

            // ── PERMISSIONS ─────────────────────────────────────────────────────
            const isMod   = this.bot.permission.isMod(sender);
            const isSudo  = this.bot.permission.isSudo(sender);
            const isAdmin = m.isGroup ? await this.bot.permission.isAdmin(jid, sender) : false;

            console.log(`[Permissions] Owner: ${isOwner}, Mod: ${isMod}, Sudo: ${isSudo}, Admin: ${isAdmin}`);

            // Permission checks removed - all commands accessible in DMs and bot DMs
            
            // Group only check
            if (command.groupOnly && !m.isGroup) {
                return await m.reply('❌ *This command only works in groups!*');
            }
            
            // Admin only check
            if (command.adminOnly && !isAdmin && !isOwner && !isMod) {
                return await m.reply('❌ *Admin only command!*');
            }

            try {
                console.log(`[Execute] Running command: ${commandName}`);

                // ── CMD Typing / Recording presence ───────────────────────────
                const ctCfg   = this.bot.config.cmdTyping    || {};
                const crecCfg = this.bot.config.cmdRecording || {};
                if (ctCfg.enabled) {
                    await this.bot.sock.sendPresenceUpdate('composing', jid).catch(() => {});
                    await new Promise(r => setTimeout(r, 800));
                }
                if (crecCfg.enabled) {
                    await this.bot.sock.sendPresenceUpdate('recording', jid).catch(() => {});
                    await new Promise(r => setTimeout(r, 800));
                }

                // ── CMD React (react before execute) ──────────────────────────
                const crCfg = this.bot.config.cmdReact || {};
                let reactKey = null;
                if (crCfg.enabled) {
                    // Determine emoji: custom global emoji OR system default per command
                    let emoji = crCfg.emoji || command.reactEmoji || '⏳';
                    const reactMsg = await this.bot.sock.sendMessage(jid, {
                        react: { text: emoji, key: msg.key }
                    }).catch(() => null);
                    reactKey = msg.key;
                }

                await command.execute(this.bot, m, args, commandName);

                // ── CMD React (unreact / done emoji after execute) ─────────────
                if (crCfg.enabled && reactKey) {
                    const doneEmoji = crCfg.doneEmoji || command.reactDoneEmoji || '✅';
                    await this.bot.sock.sendMessage(jid, {
                        react: { text: doneEmoji, key: reactKey }
                    }).catch(() => {});
                }

                if (ctCfg.enabled || crecCfg.enabled) {
                    await this.bot.sock.sendPresenceUpdate('paused', jid).catch(() => {});
                }

            } catch (err) {
                console.error('Command error:', err);
                await m.reply(`Error: ${err.message}`);
            }

        } catch (err) {
            console.error('Message handler error:', err);
        }
    }

    // NEW: Handle status mentions for anti-group mention
    async _handleStatusMention(m) {
        try {
            const cfg = this.bot.config.antiGroupMention;
            if (!cfg?.enabled) return;

            // Check if status mentions a group
            const statusMentions = m.msg?.contextInfo?.mentionedJid || [];
            if (statusMentions.length === 0) return;

            // Check if any mentioned group has anti-group-mention enabled
            const dbPath = './database/antigroupmention.json';
            let db = {};
            try { db = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch {}

            for (const mentionedJid of statusMentions) {
                if (mentionedJid.endsWith('@g.us')) {
                    const groupCfg = db[mentionedJid];
                    if (groupCfg?.enabled) {
                        // Log or notify about status mention
                        console.log(`[AntiGroupMention] Status mentioned group: ${mentionedJid}`);
                        
                        // Store for potential action
                        const statusDbPath = './database/statusmention.json';
                        let statusDb = {};
                        try { statusDb = JSON.parse(fs.readFileSync(statusDbPath, 'utf8')); } catch {}
                        
                        if (!statusDb[mentionedJid]) statusDb[mentionedJid] = [];
                        statusDb[mentionedJid].push({
                            statusJid: m.key.remoteJid,
                            sender: m.sender,
                            time: Date.now()
                        });
                        
                        fs.writeFileSync(statusDbPath, JSON.stringify(statusDb, null, 2));
                    }
                }
            }
        } catch (err) {
            console.error('Status mention handler error:', err);
        }
    }

    async _handleStickerCommand(m) {
        try {
            const id  = Buffer.from(m.msg.fileSha256).toString('base64');
            let db = {};
            try { db = JSON.parse(fs.readFileSync('./database/stickercmds.json', 'utf8')); } catch {}
            const entry = db[id];
            if (!entry) return;
            const cmd = this.bot.commandHandler.getCommand(entry.command);
            if (!cmd) return;
            await cmd.execute(this.bot, m, [], entry.command);
        } catch (err) { console.error('Sticker cmd error:', err); }
    }

    smsg(msg) {
        if (!msg.message) return null;
        let m      = {};
        m.message  = msg.message;
        m.key      = msg.key;
        m.chat     = msg.key.remoteJid;
        m.fromMe   = msg.key.fromMe;
        m.id       = msg.key.id;
        m.isGroup  = m.chat.endsWith('@g.us');
        // DM: sender is the chat JID itself; Group: use participant
        m.sender   = m.isGroup ? (msg.key.participant || msg.key.remoteJid) : msg.key.remoteJid;
        m.pushName = msg.pushName || '';

        const type = getContentType(msg.message);
        m.type = type;
        m.msg  = type === 'viewOnceMessage'
            ? msg.message[type].message[getContentType(msg.message[type].message)]
            : msg.message[type];

        m.text = typeof m.msg === 'string' ? m.msg
               : m.msg?.text    || m.msg?.caption
               || m.msg?.conversation || '';

        m.mentions = m.msg?.contextInfo?.mentionedJid || [];
        m.reply = async (text, opts = {}) => {
            const fontNum = this.bot.config.BOT_FONT || 0;
            const styled  = (typeof text === "string" && fontNum > 0)
                ? applyFont(text, fontNum)
                : text;
            return await this.bot.sendMessage(m.chat, { text: styled, ...opts }, { quoted: msg });
        };

        return m;
    }
}

module.exports = MessageHandler;
                
