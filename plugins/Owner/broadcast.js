module.exports = {
    command: 'broadcast',
    aliases: ['bc'],
    desc: 'Broadcast message to all chats',
    category: 'owner',
    sudo: true,
    async execute({ sock, msg, jid, sender, text, reply }) {
        if (!text) {
            return reply('❌ Usage: .broadcast <message>');
        }

        const chats = await sock.groupFetchAllParticipating();
        const groups = Object.values(chats);
        
        let sent = 0;
        let failed = 0;

        await reply(`📢 Broadcasting to ${groups.length} groups...`);

        for (const group of groups) {
            try {
                await sock.sendMessage(group.id, {
                    text: `📢 *BROADCAST*\n\n${text}\n\n_From CODEX AI_`
                });
                sent++;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid rate limit
            } catch (err) {
                failed++;
            }
        }

        return reply(`✅ Broadcast complete!\nSent: ${sent}\nFailed: ${failed}`);
    }
};
