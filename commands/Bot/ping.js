const { performance } = require('perf_hooks');
const os = require('os');

module.exports = {
    name: 'ping',
    alias: ['speed', 'p'],
    description: 'Check bot latency and status',
    category: 'Bot',
    react: '🪐', 

    async execute(m, { sock }) {
        // 1. Send the reaction
        await sock.sendMessage(m.chat, { 
            react: { text: this.react, key: m.key } 
        });

        const startTime = performance.now();
        
        // 🚀 Initial message for the 'Edit' effect
        const initial = await sock.sendMessage(m.chat, { text: '🚀' }, { quoted: m });
        
        const endTime = performance.now();
        const latency = (endTime - startTime).toFixed(0);
        const totalRam = Math.round(os.totalmem() / 1024 / 1024 / 1024);

        const responseText = `❍📡 *𝗣𝗢𝗡𝗚 !*\n` +
                             `  ▸ ❍ 🕣 \`${latency}ms\`\n` +
                             `  ▸ ❍ 🥏 *𝗔𝗖𝗧𝗜𝗩𝗘 ✓*\n` +
                             `  ▸ ❍ 🧬 *${totalRam}* \`GB Server Ram\``;

        // 📝 Final edit of the text
        await sock.sendMessage(m.chat, { 
            text: responseText, 
            edit: initial.key 
        });

        // 2. ⚡ AUTO-REMOVE REACTION
        // Sending an empty string to the same key removes the previous reaction
        await sock.sendMessage(m.chat, { 
            react: { text: '', key: m.key } 
        });
    }
};
