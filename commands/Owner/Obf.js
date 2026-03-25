
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

module.exports = {
    name: 'obf',
    alias: ['obfuscate', 'crypt'],
    description: 'Encrypt a command file with latest protection standards',
    category: 'Owner',

    async execute(m, { sock, args }) {
        // Validation: Ensure the user provides a path
        if (!args[0]) return m.reply('❌ Usage: .obf commands/Bot/ping.js');

        const filePath = path.resolve(process.cwd(), args[0]);
        const backupPath = filePath + '.bak';

        if (!fs.existsSync(filePath)) return m.reply('❌ File not found in root!');

        try {
            // 🕒 Starting the process
            const initial = await sock.sendMessage(m.chat, { text: '🔐 *Encrypting Logic...*' }, { quoted: m });

            const originalCode = fs.readFileSync(filePath, 'utf8');

            // 1. Create a safe backup before mangling
            fs.writeFileSync(backupPath, originalCode);

            // 2. Apply Latest Obfuscation (High Security)
            const obfuscationResult = JavaScriptObfuscator.obfuscate(originalCode, {
                compact: true,
                controlFlowFlattening: true, // Makes the code flow a "maze"
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true, // Turns "10" into "(0x2 * 0x5)"
                simplify: true,
                stringArray: true,
                stringArrayEncoding: ['base64', 'rc4'], // Multi-layer string protection
                stringArrayThreshold: 1,
                deadCodeInjection: true, // Adds fake code to confuse thieves
                deadCodeInjectionThreshold: 0.4,
                debugProtection: true, // Harder to inspect in a debugger
                renameGlobals: false // Keep "module.exports" intact so it still loads
            });

            // 3. Write the encrypted code back to the original file
            fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());

            // ✨ THE EXACT DESIGN
            const responseText = `❍📡 *𝗦𝗨𝗖𝗖𝗘𝗦𝗦 !*\n` +
                                 `  ▸ ❍ 🔐 \`Latest Encryption\`\n` +
                                 `  ▸ ❍ 💾 \`Backup Created: .bak\`\n` +
                                 `  ▸ ❍ 🧬 *Codex* \`Logic Hardened ✓\``;

            await sock.sendMessage(m.chat, { 
                text: responseText, 
                edit: initial.key 
            });

        } catch (e) {
            console.error(e);
            m.reply(`❌ ERROR: ${e.message}`);
        }
    }
};





