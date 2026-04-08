const fs = require('fs-extra');

module.exports = {
    name: 'mode',
    aliases: ['botmode'],
    category: 'bot',
    description: 'Switch bot between public and private mode',

    async execute(bot, m, args) {
        const val = args[0]?.toLowerCase();

        if (!val || !['public', 'private'].includes(val)) return await m.reply(
`bot mode
Current: ${bot.config.mode.toUpperCase()}

Usage:
${bot.prefix}mode public - everyone can use the bot
${bot.prefix}mode private - only owner/mods/sudo can use`);

        bot.config.mode = val;
        fs.writeFileSync('./config.json', JSON.stringify(bot.config, null, 2));
        await m.reply(val === 'public'
            ? 'Mode set to PUBLIC. Everyone can now use the bot.'
            : 'Mode set to PRIVATE. Only owner, mods, and sudo users can use the bot.');
    }
};
