
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

module.exports = {
    name: 'obf',
    alias: ['obfuscate', 'crypt'],
    description: 'Encrypt a command file with latest protection standards',
    category: 'Owner',
    react: '🔐',

    async execute(m, { sock, args }) {
        // 1. 🛰️ Send the reaction
        await sock.sendMessage(m.chat, { 
            react: { text: this.react, key: m.key } 
        });

        if (!args[0]) {
            await sock.sendMessage(m.chat, { react: { text: '', key: m.key } });
            return m.reply('❌ Usage: .obf commands/Bot/ping.js');
        }

        const filePath = path.resolve(process.cwd(), args[0]);
        const backupPath = filePath + '.bak';

        if (!fs.existsSync(filePath)) {
            await sock.sendMessage(m.chat, { react: { text: '', key: m.key } });
            return m.reply('❌ File not found in root!');
        }

        try {
            // 🕒 Starting the process with an 'Edit' effect
            const initial = await sock.sendMessage(m.chat, { text: '⚙️ *𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚...*' }, { quoted: m });

            const originalCode = fs.readFileSync(filePath, 'utf8');

            // 1. Create a safe backup before mangling
            fs.writeFileSync(backupPath, originalCode);

            // 2. Apply Latest Obfuscation (High Security)
            const obfuscationResult = JavaScriptObfuscator.obfuscate(originalCode, {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArray: true,
                stringArrayEncoding: ['base64', 'rc4'],
                stringArrayThreshold: 1,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.4,
                debugProtection: true,
                renameGlobals: false 
            });

            // 3. Write the encrypted code back
            fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());

            // ✨ THE EXACT DESIGN (CLEAN STYLE)
            const responseText = `❍📡 *𝗦𝗨𝗖𝗖𝗘𝗦𝗦 !*\n` +
                                 `  ▸ ❍ 🔐 \`File obfuscated successfully\`\n` +
                                 `  ▸ ❍ 💾 \`Backup Created: .bak\`\n` +
                                 `  ▸ ❍ 🧬 *CODEX* \`Logic protected ✓\``;

            await sock.sendMessage(m.chat, { 
                text: responseText, 
                edit: initial.key 
            });

            // 2. ⚡ AUTO-REMOVE REACTION
            await sock.sendMessage(m.chat, { 
                react: { text: '', key: m.key } 
            });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(m.chat, { react: { text: '', key: m.key } });
            m.reply(`❌ ERROR: ${e.message}`);
        }
    }
};



