module.exports = {
    name: 'menu',
    aliases: ['help', 'commands', 'cmd'],
    category: 'general',
    description: 'Show all available commands',

    async execute(bot, m, args) {
        const categories = bot.commandHandler.getAllCommands();

        const icons = {
            admin:   '🛡️',
            general: '💬',
            owner:   '👑'
        };

        let text = `╔═══〔 *${bot.config.botName}* 〕═══❒\n`;
        text += `║\n`;
        text += `║ 🌐 *Mode:* ${bot.config.mode.toUpperCase()}\n`;
        text += `║ 🔑 *Prefix:* ${bot.prefix}\n`;
        text += `║ 📦 *Total Commands:* ${bot.commands.size / 1 | 0}\n`;
        text += `║\n`;

        for (const [category, commands] of Object.entries(categories)) {
            const icon = icons[category] || '📁';
            // de-duplicate aliases
            const unique = commands.filter((c, i, a) => a.findIndex(x => x.name === c.name) === i);
            text += `║ ${icon} *${category.toUpperCase()}*\n`;
            unique.forEach(cmd => {
                text += `║  • ${bot.prefix}${cmd.name}\n`;
            });
            text += `║\n`;
        }

        text += `╚══════════════════❒\n\n`;
        text += `💡 *Tips:*\n`;
        text += `• Get a note: *#notename* or *${bot.prefix}getnote name*\n`;
        text += `• Link a sticker: reply sticker ➜ *${bot.prefix}setcmd <cmd>*`;

        await m.reply(text);
    }
};
