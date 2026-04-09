module.exports = {
    name: 'afk',
    category: 'general',
    description: 'Set AFK status with optional reason',
    
    async execute(bot, m, args) {
        const reason = args.join(' ') || 'AFK';
        bot.afkSystem.setAFK(m.sender, reason);
        await m.reply(`AFK mode enabled.\nReason: ${reason}\nI will notify people who mention you.`);
    }
};
