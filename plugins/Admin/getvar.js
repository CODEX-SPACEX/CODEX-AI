module.exports = {
    command: 'getvar',
    desc: 'Get a variable value',
    category: 'admin',
    mod: true,
    async execute({ sock, msg, jid, sender, args, db, reply }) {
        if (args.length < 1) {
            return reply('❌ Usage: .getvar <key>');
        }

        const key = args[0];
        const value = db.getVar(key);
        
        if (value === undefined) {
            return reply(`❌ Variable *${key}* not found`);
        }
        
        return reply(`📋 *${key}*: ${value}`);
    }
};
