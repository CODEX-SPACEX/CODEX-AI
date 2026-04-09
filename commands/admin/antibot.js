const fs = require('fs-extra');

module.exports = {
    name: 'antibot',
    aliases: ['antib'],
    category: 'admin',
    description: 'Configure anti-bot protection',
    adminOnly: true,
    groupOnly: true,

    async execute(bot, m, args) {
        const groupId = m.chat;
        const sub     = args[0]?.toLowerCase();
        const dbPath  = './database/antibot.json';
        let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!db[groupId]) db[groupId] = { enabled: true, action: bot.config.antiBot?.action || 'kick', maxWarns: bot.config.antiBot?.maxWarns || 1 };
        const s    = db[groupId];
        const save = () => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        if (!sub || sub === 'status') return await m.reply(
`antibot status
Status: ${s.enabled !== false ? 'ON' : 'OFF'}
Action: ${(s.action||'kick').toUpperCase()}
MaxWarns: ${s.maxWarns||1}

Usage:
${bot.prefix}antibot on/off
${bot.prefix}antibot delete
${bot.prefix}antibot kick
${bot.prefix}antibot warn [1-10]`);

        if (sub === 'on')     { s.enabled = true;  save(); return await m.reply('Anti-Bot enabled.'); }
        if (sub === 'off')    { s.enabled = false; save(); return await m.reply('Anti-Bot disabled.'); }
        if (sub === 'delete') { s.action = 'delete'; save(); return await m.reply('Action set to DELETE.'); }
        if (sub === 'kick')   { s.action = 'kick';   save(); return await m.reply('Action set to KICK.'); }
        if (sub === 'warn') {
            const n = parseInt(args[1]);
            if (!n || n < 1 || n > 10) return await m.reply(`Usage: ${bot.prefix}antibot warn [1-10]`);
            s.action = 'warn'; s.maxWarns = n; save();
            return await m.reply(`Action set to WARN. Max ${n} warnings before kick.`);
        }
        return await m.reply(`Unknown option. Use ${bot.prefix}antibot status`);
    }
};
