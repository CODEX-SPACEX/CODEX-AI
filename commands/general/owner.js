module.exports = {
    name: 'owner',
    aliases: ['creator', 'dev'],
    category: 'general',
    description: 'Show bot owner information',
    
    async execute(bot, m, args) {
        const owner = bot.config.owner.number;
        await m.reply(`Owner: ${bot.config.owner.name}\nNumber: @${owner.split('@')[0]}\nBot: ${bot.config.botName}`, { mentions: [owner] });
    }
};
