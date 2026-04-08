const chalk          = require('chalk');
const fs             = require('fs-extra');
const { getContentType } = require('@whiskeysockets/baileys');

const config         = require('./config.json');
const CommandHandler = require('./lib/commandHandler');
const MessageHandler = require('./lib/messageHandler');
const AntiSystems    = require('./lib/antiSystems');
const AFKSystem      = require('./lib/afkSystem');
const Permission     = require('./lib/permission');
const Reloader       = require('./lib/reloader');
const { startConnection, readMsgCache, writeMsgCache } = require('./lib/connection');

// ── Ensure dirs & DBs ─────────────────────────────────────────────────────────
['./database','./session','./commands','./lib'].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});
[
    './database/antilink.json',        './database/antispam.json',
    './database/antibot.json',         './database/antitag.json',
    './database/antigame.json',        './database/antigroupmention.json',
    './database/antidelete.json',      './database/antiedit.json',
    './database/variables.json',       './database/afk.json',
    './database/warnings.json',        './database/sudo.json',
    './database/notes.json',           './database/stickercmds.json',
    './database/msgcache.json',        './database/muteusers.json',
    './database/statusmention.json',   './database/welcome.json',
    './database/goodbye.json'
].forEach(db => {
    if (!fs.existsSync(db)) fs.writeFileSync(db, JSON.stringify({}, null, 2));
});

class CODEXAI {
    constructor() {
        this.sock           = null;
        this.commands       = new Map();
        this.config         = config;
        this.prefix         = config.prefix;
        this.commandHandler = new CommandHandler(this);
        this.messageHandler = new MessageHandler(this);
        this.antiSystems    = new AntiSystems(this);
        this.afkSystem      = new AFKSystem(this);
        this.permission     = new Permission(this);
        this.reloader       = new Reloader(this);
        this.totalCmds      = 0;
        this.successCmds    = 0;
        this.failedCmds     = 0;
    }

    async start() {
        console.log(chalk.cyan('\n╔════════════════════════════════════╗'));
        console.log(chalk.cyan('║       🤖 CODEX-AI V3.0              ║'));
        console.log(chalk.cyan('╚════════════════════════════════════╝'));
        await this.reloader.loadCommands();
        console.log(chalk.yellow(`\n📦 Commands loaded: ${chalk.bold(this.commands.size)}\n`));
        await startConnection(this);
    }

    // ── Message cache ─────────────────────────────────────────────────────────
    _cacheMessage(msg) {
        try {
            const cache = readMsgCache();
            const type  = getContentType(msg.message);
            const inner = msg.message[type];
            let text = '';
            if (typeof inner === 'string') text = inner;
            else text = inner?.text || inner?.caption || inner?.conversation || '';
            cache[msg.key.id] = {
                id: msg.key.id, chat: msg.key.remoteJid,
                sender: msg.key.participant || msg.key.remoteJid,
                type, text, pushName: msg.pushName || '', ts: Date.now()
            };
            writeMsgCache(cache);
        } catch {}
    }

    // ── Anti-Delete ───────────────────────────────────────────────────────────
    async _handleAntiDelete(revokedKey, fallbackChat) {
        const cfg = this.config.antiDelete;
        if (!cfg?.enabled) return;
        const chat  = revokedKey?.remoteJid || fallbackChat;
        const msgId = revokedKey?.id;
        if (!chat || !msgId) return;
        let db = {};
        try { db = JSON.parse(fs.readFileSync('./database/antidelete.json','utf8')); } catch {}
        const chatCfg = db[chat];
        if (chatCfg?.enabled === false) return;
        const forwardTo = chatCfg?.forwardTo || cfg.forwardTo || 'dm';
        const cached    = readMsgCache()[msgId];
        let deleter     = revokedKey?.participant || revokedKey?.remoteJid;
        const tag        = cached?.sender ? `@${cached.sender.split('@')[0]}` : 'Unknown';
        const deleterTag = deleter ? `@${deleter.split('@')[0]}` : 'Unknown';
        const text = `Anti-Delete\n\nFrom: ${tag}\nDeleted by: ${deleterTag}\nIn: ${chat.endsWith('@g.us') ? 'Group' : 'Private'}\n${cached?.text ? `Message: ${cached.text}` : '(Media or uncached)'}`;
        const ownerDM  = this.config.owner.number;
        const mentions = [];
        if (cached?.sender) mentions.push(cached.sender);
        if (deleter && deleter !== cached?.sender) mentions.push(deleter);
        if (forwardTo === 'dm') {
            await this.sendMessage(ownerDM, { text, mentions });
        } else {
            await this.sendMessage(chat, { text, mentions });
            if (chat !== ownerDM) await this.sendMessage(ownerDM, { text, mentions });
        }
    }

    // ── Anti-Edit ─────────────────────────────────────────────────────────────
    async _handleAntiEdit(editedKey, editedMsg, fallbackChat) {
        const cfg = this.config.antiEdit;
        if (!cfg?.enabled) return;
        const chat  = editedKey?.remoteJid || fallbackChat;
        const msgId = editedKey?.id;
        if (!chat || !msgId) return;
        let db = {};
        try { db = JSON.parse(fs.readFileSync('./database/antiedit.json','utf8')); } catch {}
        const chatCfg   = db[chat];
        if (chatCfg?.enabled === false) return;
        const forwardTo = chatCfg?.forwardTo || cfg.forwardTo || 'dm';
        const cache     = readMsgCache();
        const cached    = cache[msgId];
        let editor      = editedKey?.participant || editedKey?.remoteJid;
        const tag        = cached?.sender ? `@${cached.sender.split('@')[0]}` : 'Unknown';
        const editorTag  = editor ? `@${editor.split('@')[0]}` : 'Unknown';
        let newText = '';
        try {
            const inner = editedMsg?.editedMessage || editedMsg?.message?.editedMessage;
            newText = inner?.conversation || inner?.extendedTextMessage?.text || '';
        } catch {}
        const text = `Anti-Edit\n\nFrom: ${tag}\nEdited by: ${editorTag}\n${cached?.text ? `Before: ${cached.text}\n` : ''}${newText ? `After: ${newText}` : ''}`;
        const ownerDM  = this.config.owner.number;
        const mentions = [];
        if (cached?.sender) mentions.push(cached.sender);
        if (editor && editor !== cached?.sender) mentions.push(editor);
        if (forwardTo === 'dm') {
            await this.sendMessage(ownerDM, { text, mentions });
        } else {
            await this.sendMessage(chat, { text, mentions });
            if (chat !== ownerDM) await this.sendMessage(ownerDM, { text, mentions });
        }
        if (cached && newText) { cache[msgId].text = newText; writeMsgCache(cache); }
    }

    // ── Startup message ───────────────────────────────────────────────────────
    async sendStartupMessage() {
        const c  = this.config;
        const mr = c.mentionReact || {};
        const ar = c.autoReact    || {};
        const sv = c.statusView   || {};
        const sr = c.statusReact  || {};
        const cr = c.cmdReact     || {};
        const ct = c.cmdTyping    || {};
        const crec = c.cmdRecording || {};
        const text =
`${c.botName} is online!

Prefix: ${c.prefix}
Mode: ${c.mode.toUpperCase()}
CMDs: ${this.commands.size} loaded

autoTyping: ${c.autoTyping ? 'ON' : 'OFF'}
autoRecording: ${c.autoRecording ? 'ON' : 'OFF'}
autoRead: ${c.autoRead ? 'ON' : 'OFF'}
alwaysOnline: ${c.alwaysOnline ? 'ON' : 'OFF'}
statusView: ${sv.enabled !== false ? 'ON' : 'OFF'}
statusReact: ${sr.enabled ? 'ON ' + (sr.emoji||'👀') : 'OFF'}
mentionReact: ${mr.enabled ? 'ON ' + (mr.emoji||'❤️') : 'OFF'}
autoReact: ${ar.enabled ? 'ON ' + (ar.emoji||'❤️') : 'OFF'}
cmdReact: ${cr.enabled ? 'ON ' + (cr.emoji || 'system') : 'OFF'}
cmdTyping: ${ct.enabled ? 'ON' : 'OFF'}
cmdRecording: ${crec.enabled ? 'ON' : 'OFF'}
antiCall: ${c.antiCall ? 'ON' : 'OFF'}
welcome: ${c.welcome ? 'ON' : 'OFF'}
goodbye: ${c.goodbye ? 'ON' : 'OFF'}`;
        await this.sendMessage(c.owner.number, { text });
    }

    // ── Group join/leave with profile picture ─────────────────────────────────
    async handleGroupUpdate({ id, participants, action }) {
        if (action === 'add' && this.config.welcome) {
            let db = {};
            try { db = JSON.parse(fs.readFileSync('./database/welcome.json', 'utf8')); } catch {}
            for (const user of participants) {
                try {
                    const meta = await this.sock.groupMetadata(id);
                    const customText = db[id]?.text || null;
                    const msg = customText
                        ? customText
                            .replace('{user}', `@${user.split('@')[0]}`)
                            .replace('{group}', meta.subject)
                            .replace('{count}', meta.participants.length)
                        : `Welcome to ${meta.subject}!\n\n@${user.split('@')[0]} just joined.\nMembers: ${meta.participants.length}`;

                    // Try to send with profile picture
                    try {
                        const ppUrl = await this.sock.profilePictureUrl(user, 'image');
                        await this.sock.sendMessage(id, {
                            image: { url: ppUrl },
                            caption: msg,
                            mentions: [user]
                        });
                    } catch {
                        // No profile picture, send text only
                        await this.sendMessage(id, { text: msg, mentions: [user] });
                    }
                } catch (e) { console.error('Welcome error:', e.message); }
            }
        } else if (action === 'remove' && this.config.goodbye) {
            let db = {};
            try { db = JSON.parse(fs.readFileSync('./database/goodbye.json', 'utf8')); } catch {}
            for (const user of participants) {
                try {
                    const meta = await this.sock.groupMetadata(id).catch(() => null);
                    const customText = db[id]?.text || null;
                    const msg = customText
                        ? customText
                            .replace('{user}', `@${user.split('@')[0]}`)
                            .replace('{group}', meta?.subject || 'the group')
                            .replace('{count}', meta?.participants?.length || '?')
                        : `Goodbye @${user.split('@')[0]}! We will miss you.`;

                    // Try to send with profile picture
                    try {
                        const ppUrl = await this.sock.profilePictureUrl(user, 'image');
                        await this.sock.sendMessage(id, {
                            image: { url: ppUrl },
                            caption: msg,
                            mentions: [user]
                        });
                    } catch {
                        await this.sendMessage(id, { text: msg, mentions: [user] });
                    }
                } catch (e) { console.error('Goodbye error:', e.message); }
            }
        }
    }

    // ── Send message (with autoTyping / autoRecording / autoRead) ─────────────
    async sendMessage(jid, content, options = {}) {
        try {
            if (this.config.autoTyping)
                await this.sock.sendPresenceUpdate('composing', jid).catch(() => {});
            if (this.config.autoRecording)
                await this.sock.sendPresenceUpdate('recording', jid).catch(() => {});
            const sent = await this.sock.sendMessage(jid, content, options);
            await this.sock.sendPresenceUpdate('paused', jid).catch(() => {});
            if (this.config.autoRead && sent?.key)
                await this.sock.readMessages([sent.key]).catch(() => {});
            return sent;
        } catch (err) { console.error('sendMessage error:', err.message); }
    }

    getCommands() { return this.commands; }
}

const bot = new CODEXAI();
bot.start().catch(err => {
    console.error(chalk.red('Fatal startup error:'), err);
    process.exit(1);
});

module.exports = bot;
          
