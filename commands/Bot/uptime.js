
const os = require('os');

module.exports = {
    name: 'runtime',
    alias: ['uptime', 'run'],
    description: 'Check how long the bot has been active',
    category: 'Bot',

    async execute(m, { sock }) {
        // 🕒 Initial quick message for the 'Edit' effect
        const initial = await sock.sendMessage(m.chat, { text: '⏳' }, { quoted: m });

        // 🏎️ Calculate Uptime Logic
        const seconds = Math.floor(process.uptime());
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m_t = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const runtime = `${d > 0 ? d + 'd ' : ''}${h}h ${m_t}m ${s}s`;

        // ✨ THE EXACT DESIGN APPLIED TO RUNTIME
        const responseText = `❍📡 *𝗥𝗨𝗡𝗧𝗜𝗠𝗘 !*\n` +
                             `  ▸ ❍ 🕣 \`${runtime}\`\n` +
                             `  ▸ ❍ 🥏 _*𝗔𝗖𝗧𝗜𝗩𝗘 ✓*_\n` +
                             `  ▸ ❍ 🧬 *CODEX AI* \`System Online\``;

        // 📝 Final edit - No images, no forward tags
        await sock.sendMessage(m.chat, { 
            text: responseText, 
            edit: initial.key 
        });
    }
};




