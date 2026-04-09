module.exports = {
    name: 'promote',
    aliases: ['admin', 'makeadmin'],
    category: 'admin',
    description: 'Promote a user to admin',
    adminOnly: true,
    groupOnly: true,
    
    async execute(bot, m, args) {
        if (!m.mentions || m.mentions.length === 0) return await m.reply(`Please mention a user to promote.\nExample: ${bot.prefix}promote @user`);
        const target = m.mentions[0];
        try {
            await bot.sock.groupParticipantsUpdate(m.chat, [target], 'promote');
            await m.reply(`@${target.split('@')[0]} is now an admin.`, { mentions: [target] });
        } catch (err) {
            await m.reply(`Failed to promote user: ${err.message}`);
        }
    }
};
