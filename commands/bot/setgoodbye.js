const fs = require('fs-extra');

module.exports = {
    name: 'setgoodbye',
    aliases: ['goodbyemsg'],
    category: 'bot',
    description: 'Set custom goodbye message for this group',
    groupOnly: true,

    async execute(bot, m, args) {
        const dbPath = './database/goodbye.json';
        let db = {};
        try { db = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch {}

        const text = args.join(' ').trim();

        if (!text) return await m.reply(
`setgoodbye - set a custom goodbye message for this group

Usage: ${bot.prefix}setgoodbye <message>

Variables you can use:
  {user}  - the leaving member's name
  {group} - group name
  {count} - member count

Example:
${bot.prefix}setgoodbye Goodbye {user}! We will miss you.

Current: ${db[m.chat]?.text || 'default (not set)'}

To reset to default: ${bot.prefix}setgoodbye reset`);

        if (text.toLowerCase() === 'reset') {
            delete db[m.chat];
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return await m.reply('Goodbye message reset to default.');
        }

        db[m.chat] = { text, setBy: m.sender, setAt: Date.now() };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        await m.reply(`Goodbye message set.\n\nPreview:\n${text.replace('{user}', '@you').replace('{group}', 'This Group').replace('{count}', '99')}`);
    }
};
