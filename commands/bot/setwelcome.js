const fs = require('fs-extra');

module.exports = {
    name: 'setwelcome',
    aliases: ['welcomemsg'],
    category: 'bot',
    description: 'Set custom welcome message for this group',
    groupOnly: true,

    async execute(bot, m, args) {
        const dbPath = './database/welcome.json';
        let db = {};
        try { db = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch {}

        const text = args.join(' ').trim();

        if (!text) return await m.reply(
`setwelcome - set a custom welcome message for this group

Usage: ${bot.prefix}setwelcome <message>

Variables you can use:
  {user}  - the new member's name
  {group} - group name
  {count} - member count

Example:
${bot.prefix}setwelcome Welcome {user} to {group}! We now have {count} members.

Current: ${db[m.chat]?.text || 'default (not set)'}

To reset to default: ${bot.prefix}setwelcome reset`);

        if (text.toLowerCase() === 'reset') {
            delete db[m.chat];
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return await m.reply('Welcome message reset to default.');
        }

        db[m.chat] = { text, setBy: m.sender, setAt: Date.now() };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        await m.reply(`Welcome message set.\n\nPreview:\n${text.replace('{user}', '@you').replace('{group}', 'This Group').replace('{count}', '100')}`);
    }
};
