const fs = require('fs-extra');

module.exports = {
    name: 'cmdtyping',
    aliases: ['commandtyping'],
    category: 'bot',
    description: 'Toggle typing indicator before command execution',

    async execute(bot, m, args) {
        const sub  = args[0]?.toLowerCase();
        const save = () => fs.writeFileSync('./config.json', JSON.stringify(bot.config, null, 2));

        if (!bot.config.cmdTyping) bot.config.cmdTyping = { enabled: false };

        if (!sub) return await m.reply(
`cmdtyping settings
Status: ${bot.config.cmdTyping.enabled ? 'ON' : 'OFF'}

When ON: bot shows "typing..." before executing any command.

Usage:
${bot.prefix}cmdtyping on
${bot.prefix}cmdtyping off`);

        if (sub === 'on')  { bot.config.cmdTyping.enabled = true;  save(); return await m.reply('Command typing indicator is ON.'); }
        if (sub === 'off') { bot.config.cmdTyping.enabled = false; save(); return await m.reply('Command typing indicator is OFF.'); }
        return await m.reply(`Usage: ${bot.prefix}cmdtyping on/off`);
    }
};
