module.exports = {
    command: 'ban',
    desc: 'Ban a user',
    category: 'owner',
    sudo: true,
    async execute({ sock, msg, jid, sender, args, db, reply, isGroup }) {
        if (!isGroup) {
            return reply('❌ This command only works in groups');
        }

        let target = args[0];
        
        if (msg.message.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        }

        if (!target) {
            return reply('❌ Tag a user or provide their number');
        }

        if (target.includes('@')) {
            target = target.split('@')[0] + '@s.whatsapp.net';
        } else {
            target = target + '@s.whatsapp.net';
        }

        if (db.isSudo(target)) {
            return reply('❌ Cannot ban a sudo user');
        }

        await db.ban(target);
        return reply(`✅ Banned @${target.split('@')[0]}`, {
            mentions: [target]
        });
    }
};
