module.exports = {
    name: 'runtime',
    alias: ['uptime'],
    description: 'Check bot active time',
    category: 'Bot',
    react: '🕣',

    async execute(m, { sock }) {
        await sock.sendMessage(m.chat, { react: { text: this.react, key: m.key } });

        const seconds = Math.floor(process.uptime());
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m_t = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const runtime = `${d > 0 ? d + 'd ' : ''}${h}h ${m_t}m ${s}s`;

        const responseText = `❍📡 *𝗥𝗨𝗡𝗧𝗜𝗠𝗘 !*\n` +
                             `  ▸ ❍ 🕣 \`${runtime}\`\n` +
                             `  ▸ ❍ 🥏 _*𝗔𝗖𝗧𝗜𝗩𝗘 ✓*_\n` +
                             `  ▸ ❍ 🧬 *CODEX* \`System Online\``;

        const initial = await sock.sendMessage(m.chat, { text: '⏳' }, { quoted: m });
        await sock.sendMessage(m.chat, { text: responseText, edit: initial.key });

        // Remove reaction
        await sock.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};



