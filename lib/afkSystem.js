const fs = require('fs-extra');
const moment = require('moment-timezone');

class AFKSystem {
    constructor(bot) {
        this.bot    = bot;
        this.dbPath = './database/afk.json';
    }

    setAFK(userId, reason = 'AFK') {
        let db = {};
        try { db = JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); } catch {}
        db[userId] = { reason, time: Date.now(), mentions: [], chats: [] };
        fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2));
    }

    removeAFK(userId) {
        let db = {};
        try { db = JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); } catch {}
        if (db[userId]) {
            const data = db[userId];
            delete db[userId];
            fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2));
            return data;
        }
        return null;
    }

    isAFK(userId) {
        let db = {};
        try { db = JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); } catch {}
        return db[userId] || null;
    }

    async checkAFK(m) {
        const userId = m.sender;

        // If sender is AFK and sends a non-command message, remove AFK
        const afkData = this.isAFK(userId);
        if (afkData && m.text && !m.text.startsWith(this.bot.prefix)) {
            const removed = this.removeAFK(userId);
            if (removed) {
                const duration = moment.duration(Date.now() - removed.time).humanize();
                const mentionCount = (removed.mentions || []).length;
                await m.reply(`Welcome back! You were AFK for ${duration}.\nYou were mentioned ${mentionCount} time(s).`);
            }
        }

        // If someone mentions an AFK user
        const mentions = m.mentions || [];
        for (const mentioned of mentions) {
            const mentionedAFK = this.isAFK(mentioned);
            if (mentionedAFK) {
                // Record mention: who tagged, the message, and the chat
                let db = {};
                try { db = JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); } catch {}
                if (db[mentioned]) {
                    if (!db[mentioned].mentions) db[mentioned].mentions = [];
                    db[mentioned].mentions.push({
                        tagger: m.sender,
                        message: m.text || '(media)',
                        chat: m.chat,
                        time: Date.now()
                    });
                    fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2));
                }

                const duration = moment.duration(Date.now() - mentionedAFK.time).humanize();
                await m.reply(
                    `@${mentioned.split('@')[0]} is currently AFK.\n` +
                    `Reason: ${mentionedAFK.reason}\n` +
                    `Duration: ${duration}\n\n` +
                    `Tagger: @${m.sender.split('@')[0]}\n` +
                    `Message: ${m.text || '(media)'}`,
                    { mentions: [mentioned, m.sender] }
                );
            }
        }
    }
}

module.exports = AFKSystem;
  
