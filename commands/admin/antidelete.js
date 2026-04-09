const fs = require('fs-extra');

module.exports = {
    name: 'antidelete',
    aliases: ['antidel'],
    category: 'admin',
    description: 'Configure anti-delete: forward deleted messages to owner DM or back in group',
    adminOnly: true,
    groupOnly: false,

    async execute(bot, m, args) {
        const chatId = m.chat;
        const action = args[0]?.toLowerCase();
        const dbPath = './database/antidelete.json';
        let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!db[chatId]) db[chatId] = { enabled: bot.config.antiDelete?.enabled || false, forwardTo: bot.config.antiDelete?.forwardTo || 'dm' };

        if (!action) return await m.reply(
`antidelete settings
Status: ${db[chatId].enabled ? 'ON' : 'OFF'}
Forward to: ${db[chatId].forwardTo.toUpperCase()}

Usage:
${bot.prefix}antidelete on
${bot.prefix}antidelete off
${bot.prefix}antidelete forward dm
${bot.prefix}antidelete forward group`);

        if (action === 'on') {
            db[chatId].enabled = true;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return await m.reply(`Anti-Delete enabled. Forwarding to: ${db[chatId].forwardTo.toUpperCase()}`);
        }
        if (action === 'off') {
            db[chatId].enabled = false;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return await m.reply('Anti-Delete disabled.');
        }
        if (action === 'forward') {
            const dest = args[1]?.toLowerCase();
            if (!dest || !['dm', 'group'].includes(dest)) return await m.reply(`Specify dm or group. Example: ${bot.prefix}antidelete forward dm`);
            db[chatId].forwardTo = dest;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return await m.reply(`Anti-Delete will forward deleted messages to ${dest === 'dm' ? 'owner DM' : 'this chat'}.`);
        }
        return await m.reply(`Unknown option. Use ${bot.prefix}antidelete`);
    }
};
