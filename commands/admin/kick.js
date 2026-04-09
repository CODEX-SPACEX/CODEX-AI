module.exports = {
    name: 'kick',
    aliases: ['remove', 'k'],
    category: 'admin',
    description: 'Kick a user from the group',
    adminOnly: true,
    groupOnly: true,
    
    async execute(bot, m, args) {
        if (!m.mentions || m.mentions.length === 0) return await m.reply(`Please mention a user to kick.\nExample: ${bot.prefix}kick @user`);
        const target = m.mentions[0];
        try {
            await bot.sock.groupParticipantsUpdate(m.chat, [target], 'remove');
            await m.reply(`@${target.split('@')[0]} has been removed from the group.`, { mentions: [target] });
        } catch (err) {
            await m.reply(`Failed to kick user: ${err.message}`);
        }
    }
};
