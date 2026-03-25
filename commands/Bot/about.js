
module.exports = {
    name: 'about',
    alias: ['info', 'bot'],
    description: 'About this bot',
    category: 'Bot',

    async execute(m, { sock, config }) {
        // 🕒 Initial reaction for the 'Edit' effect
        const initial = await sock.sendMessage(m.chat, { text: '💬' }, { quoted: m });

        const repoLink = config.repo || (config.settings && config.settings.repo) || 'https://github.com/CODEX-SPACEX/CODEX-AI/tree/main';
        const botTitle = (config.settings && config.settings.title) || 'CODEX AI';

        // ✨ THE EXACT DESIGN APPLIED
        const responseText = `❍📡 *𝗔𝗕𝗢𝗨𝗧 !*\n` +
                             `  ▸ ❍ *BOT:* \`${botTitle}\`\n` +
                             `  ▸ ❍ *OWNER:* \`✦ CODEX\`\n` +
                             `  ▸ ❍ *VERSION:* \`2.0.0\`\n` +
                             `  ▸ ❍ *LIBRARY:* \`Baileys\`\n` +
                             `  ▸ ❍ *STYLES:* \`CODEXSPACEX\`\n` +
                             `  ▸ ❍ *CONNECTION:* \`CODEX official V2.0\`\n\n` +
                             `📢 *Channel:* https://whatsapp.com/channel/0029Vb6sMEy96H4VI2w3I50F\n` +
                             `🐙 *GitHub:* ${repoLink}`;

        // 📝 Final edit - No images, no forward tags
        await sock.sendMessage(m.chat, { 
            text: responseText, 
            edit: initial.key 
        });
    }
};




