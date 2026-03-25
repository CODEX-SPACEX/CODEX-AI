
 
module.exports = {
    name: 'about',
    alias: ['info', 'bot'],
    description: 'About this bot',
    category: 'Bot',
    react: '📱',

    async execute(m, { sock, config }) {
        await sock.sendMessage(m.chat, { react: { text: this.react, key: m.key } });
        const initial = await sock.sendMessage(m.chat, { text: '💬' }, { quoted: m });

        const repoLink = config.repo || 'https://github.com/CODEX-SPACEX/CODEX-AI/tree/main';
        const botTitle = config.botname || 'CODEX AI';

        const responseText = `❍📡 *𝗔𝗕𝗢𝗨𝗧 !*\n` +
                             `  ▸ ❍ *BOT:* \`${botTitle}\`\n` +
                             `  ▸ ❍ *OWNER:* \`CODEX\`\n` +
                             `  ▸ ❍ *VERSION:* \`2.0.0\`\n` +
                             `  ▸ ❍ *LIBRARY:* \`Baileys\`\n` +
                             `  ▸ ❍ *STYLES:* \`CODEXSPACEX\`\n` +
                             `  ▸ ❍ *CONNECTION:* \`CODEX official V2.0\`\n\n` +
                               `▸ ❍*Channel:* https://whatsapp.com/channel/0029Vb6sMEy96H4VI2w3I50F\n` +
                              ` ▸ ❍ *GitHub:* ${repoLink}`;

        await sock.sendMessage(m.chat, { text: responseText, edit: initial.key });
        await sock.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};


