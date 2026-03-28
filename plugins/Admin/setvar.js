module.exports = {
    command: 'setvar',
    desc: 'Set a variable',
    category: 'admin',
    mod: true,
    async execute({ sock, msg, jid, sender, args, db, reply }) {
        if (args.length < 2) {
            return reply('❌ Usage: .setvar <key> <value>');
        }

        const key = args[0];
        const value = args.slice(1).join(' ');
        
        await db.setVar(key, value);
        return reply(`✅ Variable *${key}* set to: ${value}`);
    }
};
