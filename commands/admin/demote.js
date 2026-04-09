module.exports = {
    name: 'demote',
    aliases: ['unadmin', 'removeadmin'],
    category: 'admin',
    description: 'Demote an admin to member',
    adminOnly: true,
    groupOnly: true,
    
    async execute(bot, m, args) {
        if (!m.mentions || m.mentions.length === 0) return await m.reply(`Please mention a user to demote.\nExample: ${bot.prefix}demote @user`);
        const target = m.mentions[0];
        try {
            await bot.sock.groupParticipantsUpdate(m.chat, [target], 'demote');
            await m.reply(`@${target.split('@')[0]} has been demoted.`, { mentions: [target] });
        } catch (err) {
            await m.reply(`Failed to demote user: ${err.message}`);
        }
    }
};
