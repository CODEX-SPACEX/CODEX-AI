const fs = require('fs-extra');

module.exports = {
    name: 'mod',
    category: 'bot',
    description: 'Add or remove mod users',
    
    async execute(bot, m, args) {
        const action = args[0]?.toLowerCase();
        
        if (!action || !['add', 'remove', 'list'].includes(action)) return await m.reply(
`mod manager
Usage:
${bot.prefix}mod add @user
${bot.prefix}mod remove @user
${bot.prefix}mod list`);

        if (action === 'list') {
            const mods = bot.config.mods || [];
            if (mods.length === 0) return await m.reply('No mods set.');
            let text = 'Mod users:\n';
            mods.forEach((id, i) => { text += `${i+1}. @${id.split('@')[0]}\n`; });
            return await m.reply(text.trim(), { mentions: mods });
        }

        if (!m.mentions || m.mentions.length === 0) return await m.reply('Please mention a user.');
        const target = m.mentions[0];
        const cleanTarget = target.replace('@s.whatsapp.net', '') + '@s.whatsapp.net';
        if (!bot.config.mods) bot.config.mods = [];

        if (action === 'add') {
            if (!bot.config.mods.includes(cleanTarget)) {
                bot.config.mods.push(cleanTarget);
                fs.writeFileSync('./config.json', JSON.stringify(bot.config, null, 2));
            }
            await m.reply(`@${target.split('@')[0]} is now a mod.`, { mentions: [target] });
        }
        if (action === 'remove') {
            bot.config.mods = bot.config.mods.filter(id => id !== cleanTarget);
            fs.writeFileSync('./config.json', JSON.stringify(bot.config, null, 2));
            await m.reply(`@${target.split('@')[0]} removed from mods.`, { mentions: [target] });
        }
    }
};
