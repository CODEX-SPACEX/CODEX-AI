const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'url',
    alias: ['upload', 'mediaurl', 'tourl'],
    description: 'Upload media and get a public CODEX-AI URL',
    category: 'tools',
    react: '📤',

    async execute(m, { sock }) {
        // 1. ALWAYS React first (Even if no media is found)
        await sock.sendMessage(m.chat, { 
            react: { text: this.react, key: m.key } 
        });

        let initial;
        try {
            // 2. Check for quoted media
            const quoted = m.quoted || (m.message?.extendedTextMessage?.contextInfo?.quotedMessage);
            
            if (!quoted) {
                await sock.sendMessage(m.chat, { 
                    text: '🥏 _*Reply to an image, video, or audio file to get a URL!*_' 
                }, { quoted: m });
                
                // Jump to unreact logic immediately
                return this.cleanup(sock, m);
            }

            // 3. Send "Processing" placeholder
            initial = await sock.sendMessage(m.chat, { 
                text: `❍📡 *𝗨𝗣𝗟𝗢𝗔𝗗𝗜𝗡𝗚 !*\n  ▸ ❍ 🕣 \`Status: Processing...\`\n  ▸ ❍ 🧬 *CODEX* \`System Busy\`` 
            }, { quoted: m });

            // 4. Download Media Buffer
            let mediaBuffer;
            const type = Object.keys(quoted)[0];
            const messageContent = quoted[type];

            const stream = await downloadContentFromMessage(
                messageContent, 
                type.replace('Message', '')
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaBuffer = buffer;

            if (!mediaBuffer || mediaBuffer.length === 0) {
                await sock.sendMessage(m.chat, { 
                    text: '❌ *FAILED:* Could not retrieve data.', 
                    edit: initial.key 
                });
                return this.cleanup(sock, m);
            }

            // 5. POST to Worker API
            const response = await axios.post('https://media.codex-ai.workers.dev/upload', mediaBuffer, {
                headers: {
                    'content-type': m.quoted?.mimetype || 'application/octet-stream'
                },
                timeout: 60000
            });

            // 6. Build & Edit Success Response
            const responseText = 
                `❍📡 *𝗨𝗣𝗟𝗢𝗔𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 !*\n` +
                `  ▸ ❍ 🕣 \`𝗦𝘁𝗮𝘁𝘂𝘀: Verified\`\n` +
                `  ▸ ❍ 🔗 *𝗨𝗥𝗟:* ${response.data.url}\n` +
                `  ▸ ❍ 🧬 *CODEX* \`System Online\``;

            await sock.sendMessage(m.chat, { 
                text: responseText, 
                edit: initial.key 
            });

        } catch (error) {
            console.error('🔥 [UPLOAD ERROR]:', error);
            const errorText = '❌ *SYSTEM ERROR:* Media upload failed.';
            if (initial) {
                await sock.sendMessage(m.chat, { text: errorText, edit: initial.key });
            } else {
                await sock.sendMessage(m.chat, { text: errorText }, { quoted: m });
            }
        }

        // 7. Final Unreact
        this.cleanup(sock, m);
    },

    // Helper function to handle the unreacting delay
    async cleanup(sock, m) {
        setTimeout(async () => {
            try {
                await sock.sendMessage(m.chat, { 
                    react: { text: '', key: m.key } 
                });
            } catch (e) {}
        }, 2000);
    }
};
