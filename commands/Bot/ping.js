
const { performance } = require('perf_hooks');
const os = require('os');

module.exports = {
    name: 'ping',
    alias: ['speed', 'p'],
    description: 'Check bot latency and status',
    category: 'Bot',

    async execute(m, { sock }) {
        // 🕒 Start timer
        const startTime = performance.now();
        
        // 🚀 Initial message for the 'Edit' effect
        const initial = await sock.sendMessage(m.chat, { text: '🚀' }, { quoted: m });
        
        // 🏎️ Calculate Latency
        const endTime = performance.now();
        const latency = (endTime - startTime).toFixed(0);

        // 🖥️ Get Total RAM
        const totalRam = Math.round(os.totalmem() / 1024 / 1024 / 1024);

        // ✨ THE UPDATED DESIGN WITH PONG!
        const responseText = `❍📡 *𝗣𝗢𝗡𝗚 !*\n` +
                             `  ▸ ❍ 🕣 \`${latency}ms\`\n` +
                             `  ▸ ❍ 🥏 _*𝗔𝗖𝗧𝗜𝗩𝗘 ✓*_\n` +
                             `  ▸ ❍ 🧬 *${totalRam}* \`GB Server Ram\``;

        // 📝 Final edit - No images, no forward tags, just your text style.
        await sock.sendMessage(m.chat, { 
            text: responseText, 
            edit: initial.key 
        });
    }
};





