module.exports = {
    command: 'info',
    desc: 'Bot information',
    category: 'general',
    async execute({ reply }) {
        const info = `
╭━━━〔 *CODEX AI INFO* 〕━━━╮
┃
┃ 🤖 *Name:* CODEX AI
┃ 🔢 *Version:* 1.0.0
┃ 👨‍💻 *Developer:* Your Name
┃ 📱 *Platform:* WhatsApp
┃
┃ *Features:*
┃ ✓ Anti-link protection
┃ ✓ Anti-delete messages
┃ ✓ Anti-edit messages
┃ ✓ Auto typing/recording
┃ ✓ Auto status view/react
┃ ✓ Plugin system
┃ ✓ Sudo/Mod system
┃
╰━━━━━━━━━━━━━━━━━━━━╯
        `;
        return reply(info);
    }
};
