const { performance } = require('perf_hooks');
const os = require('os');

module.exports = {
    name: 'ping',
    alias: ['speed', 'p'],
    description: 'Check bot latency and status',
    category: 'Bot',
    react: '🪐',

    async execute(m, { sock }) {
        // 1. Send the reaction first
        await sock.sendMessage(m.chat, { 
            react: { text: this.react, key: m.key } 
        });

        const startTime = performance.now();

        // 2. Send placeholder message (for edit effect)
        const initial = await sock.sendMessage(m.chat, { text: '🚀 *Calculating...*' }, { quoted: m });

        const endTime = performance.now();
        const latency = (endTime - startTime).toFixed(0);
        const totalRam = Math.round(os.totalmem() / 1024 / 1024 / 1024);
        const freeRam = Math.round(os.freemem() / 1024 / 1024 / 1024);
        const uptime = process.uptime();
        const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

        const responseText = 
            `❍📡 *𝗣𝗢𝗡𝗚 !*\n` +
            `  ▸ ❍ 🕣 \`${latency}ms\`\n` +
            `  ▸ ❍ 🥏 *𝗔𝗖𝗧𝗜𝗩𝗘 ✓*\n` +
            `  ▸ ❍ 🧬 *${totalRam}* \`GB Total RAM\`\n` +
            `  ▸ ❍ 💾 *${freeRam}* \`GB Free RAM\`\n` +
            `  ▸ ❍ ⏱️ \`${uptimeStr}\``;

        // 3. Edit the placeholder with real result
        await sock.sendMessage(m.chat, { 
            text: responseText, 
            edit: initial.key 
        });

        // 4. Remove the reaction after reply
        await sock.sendMessage(m.chat, { 
            react: { text: '', key: m.key } 
        });
    }
};

