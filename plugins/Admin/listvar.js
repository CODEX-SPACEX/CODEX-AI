module.exports = {
    command: 'listvar',
    desc: 'List all variables',
    category: 'admin',
    mod: true,
    async execute({ sock, msg, jid, sender, db, reply }) {
        const vars = db.getAllVars();
        const keys = Object.keys(vars);
        
        if (keys.length === 0) {
            return reply('📭 No variables set');
        }

        let text = '📋 *All Variables:*\n\n';
        keys.forEach((key, index) => {
            text += `${index + 1}. *${key}*: ${vars[key]}\n`;
        });
        
        return reply(text);
    }
};
