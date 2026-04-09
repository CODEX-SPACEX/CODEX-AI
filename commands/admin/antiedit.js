const fs = require('fs-extra');

module.exports = {
    name: 'antiedit',
    aliases: ['antied'],
    category: 'admin',
    description: 'Configure anti-edit: show original message when someone edits',
    adminOnly: true,
    groupOnly: false,

    async execute(bot, m, args) {
        const chatId = m.chat;
        const action = args[0]?.toLowerCase();
        const dbPath = './database/antiedit.json';
        let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!db[chatId]) db[chatId] = { enabled: bot.config.antiEdit?.enabled || false, forwardTo: bot.config.antiEdit?.forwardTo || 'dm' };

        if (!action) return await m.reply(
`antiedit settings
Status: ${db[chatId].enabled ? 'ON' : 'OFF'}
Forward to: ${db[chatId].forwardTo.toUpperCase()}

Usage:
${bot.prefix}antiedit on
${bot.prefix}antiedit off
${bot.prefix}antiedit forward dm
${bot.prefix}antiedit forward group`);

        if (action === 'on') {
            db[chatId].enabled = true;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return await m.reply(`Anti-Edit enabled. Forwarding to: ${db[chatId].forwardTo.toUpperCase()}`);
        }
        if (action === 'off') {
            db[chatId].enabled = false;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return await m.reply('Anti-Edit disabled.');
        }
        if (action === 'forward') {
            const dest = args[1]?.toLowerCase();
            if (!dest || !['dm', 'group'].includes(dest)) return await m.reply(`Specify dm or group. Example: ${bot.prefix}antiedit forward group`);
            db[chatId].forwardTo = dest;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return await m.reply(`Anti-Edit will send original messages to ${dest === 'dm' ? 'owner DM' : 'this chat'}.`);
        }
        return await m.reply(`Unknown option. Use ${bot.prefix}antiedit`);
    }
};
