const fs = require('fs-extra');

module.exports = {
    name: 'cmdrecording',
    aliases: ['commandrecording'],
    category: 'bot',
    description: 'Toggle recording indicator before command execution',

    async execute(bot, m, args) {
        const sub  = args[0]?.toLowerCase();
        const save = () => fs.writeFileSync('./config.json', JSON.stringify(bot.config, null, 2));

        if (!bot.config.cmdRecording) bot.config.cmdRecording = { enabled: false };

        if (!sub) return await m.reply(
`cmdrecording settings
Status: ${bot.config.cmdRecording.enabled ? 'ON' : 'OFF'}

When ON: bot shows "recording..." before executing any command.

Usage:
${bot.prefix}cmdrecording on
${bot.prefix}cmdrecording off`);

        if (sub === 'on')  { bot.config.cmdRecording.enabled = true;  save(); return await m.reply('Command recording indicator is ON.'); }
        if (sub === 'off') { bot.config.cmdRecording.enabled = false; save(); return await m.reply('Command recording indicator is OFF.'); }
        return await m.reply(`Usage: ${bot.prefix}cmdrecording on/off`);
    }
};
