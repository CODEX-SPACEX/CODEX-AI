module.exports = {
    command: 'help',
    aliases: ['menu', 'h'],
    desc: 'Show help menu',
    category: 'general',
    async execute({ sock, msg, jid, sender, db, reply }) {
        const settings = db.getSettings();
        const prefix = settings.prefix;
        
        let menu = `
╭━━━〔 *CODEX AI* 〕━━━╮
┃
┃ 🤖 *Bot Name:* CODEX AI
┃ ⚡ *Prefix:* ${prefix}
┃ 📅 *Date:* ${new Date().toLocaleDateString()}
┃
┣━━━〔 *General Commands* 〕━━━┫
┃
┃ ${prefix}ping - Check latency
┃ ${prefix}help - Show this menu
┃ ${prefix}info - Bot information
┃
┣━━━〔 *Admin Commands* 〕━━━┫
┃
┃ ${prefix}setvar <key> <value>
┃ ${prefix}getvar <key>
┃ ${prefix}listvar
┃
┣━━━〔 *Settings* 〕━━━┫
┃
┃ Antilink: ${settings.antilink ? '✅' : '❌'}
┃ Antidelete: ${settings.antidelete ? '✅' : '❌'}
┃ Antiedit: ${settings.antiedit ? '✅' : '❌'}
┃ AutoTyping: ${settings.autotyping ? '✅' : '❌'}
┃ AutoRecording: ${settings.autorecording ? '✅' : '❌'}
┃ AutoViewStatus: ${settings.autoviewstatus ? '✅' : '❌'}
┃ AutoReactStatus: ${settings.autoreactstatus ? '✅' : '❌'}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
        `;
        
        return reply(menu);
    }
};
