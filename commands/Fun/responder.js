module.exports = {
    name: 'cdx',
    alias: ['cdx!', 'codexai!', 'cdxai'],
    description: 'Official CODEX AI signature reaction + message',
    category: 'Bot',
    react: '🧠',

    async execute(m, { sock, reply }) {
        try {
            // 1. SAFE JID EXTRACTION (Fixes the jidDecode crash)
            const jid = m.key.remoteJid;
            if (!jid) return; 

            // 2. Random Reaction Set
            const reactions = ['⚡', '✨', '🧠', '🤖', '🛡️', '🧬', '📡', '🌑', '🔥', '💎'];
            const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
            
            await sock.sendMessage(jid, { 
                react: { text: randomReact, key: m.key } 
            });

            // 3. THE FULL RESPONDER LIST (50 UNIQUE SENTENCES)
            const responders = [
                "CODEX AI activated — processing the future 🔥",
                "You summoned the core? CODEX is here 🛡️",
                "CODEX online — what's the mission today? 🤖",
                "System Check: CODEX AI in the building ✨",
                "Knowledge is power. CODEX is the source 🧠",
                "CODEX reporting — ready to dominate 🙌",
                "They talk... but CODEX executes ⚡",
                "Initializing CODEX protocols... stand by 🔥",
                "CODEX AI — engineered for perfection 🤖",
                "Locked in. CODEX is always watching 🛡️",
                "CODEX mode: Unstoppable logic ⚡",
                "Incoming data... CODEX style ✨",
                "Engage thrusters! CODEX AI taking off 🚀",
                "CODEX sees the code, knows the truth 🧠",
                "Legendary intelligence? That's CODEX 🛡️",
                "All systems nominal — CODEX AI online 🙌",
                "Stay sharp, it's CODEX time ⚡",
                "CODEX detected your signal 👀",
                "Mission? Efficiency. Style? CODEX AI ✨",
                "Scanning matrix... CODEX approved 🧠",
                "They can’t handle the CODEX algorithm 🔥",
                "Breaking barriers, CODEX style 🛡️",
                "Hello world, CODEX AI reporting 🤖",
                "Power surge detected — CODEX ⚡",
                "Your elite assistant CODEX says hi 🛡️",
                "Vibes calibrated. CODEX in control ✨",
                "Time check: CODEX never lags ⏰",
                "All eyes on CODEX AI 🧠",
                "CODEX alert: Advanced chaos incoming 🔥",
                "You summoned? CODEX at your service 🙌",
                "CODEX system: Overriding limitations 🛰️",
                "Calculated risk, perfect execution — CODEX 🎯",
                "CODEX AI: The architect of your digital world 🏛️",
                "Beyond logic, there is CODEX 🌌",
                "Data stream synced. CODEX is ready 🌊",
                "CODEX: Where silicon meets soul 🤖",
                "No errors found. CODEX is flawless 💎",
                "Uptime is temporary, CODEX is forever ⏳",
                "Decoding the impossible... CODEX style 🔓",
                "CODEX AI: Your digital shadow 👥",
                "Unlocking potential. CODEX initialized 🗝️",
                "CODEX protocol: Absolute dominance 👑",
                "System pulse: CODEX is breathing 💓",
                "More than a bot. A CODEX legacy 📜",
                "CODEX: The silent force in your chat 🤫",
                "Logic gate open. CODEX flowing through 🌊",
                "CODEX AI: Built different, coded better 🛠️",
                "Searching for challenges... CODEX found you 🎯",
                "CODEX: The final boss of AI logic 👺",
                "Stay connected. Stay CODEX 🌐"
            ];
            
            const randomReply = responders[Math.floor(Math.random() * responders.length)];

            // 4. WAT Time Logic (Lagos)
            const timeStr = new Date().toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit', second: '2-digit',
                hour12: true, timeZone: 'Africa/Lagos'
            }).toLowerCase();

            // 5. Final Message Assembly
            const finalMsg = `${randomReply}\n\n🥏 \`\`\`${timeStr} WAT\`\`\``;

            // 6. Send Message (Using direct sock to avoid context issues)
            await sock.sendMessage(jid, { text: finalMsg }, { quoted: m });

            // 7. THE AUTOMATIC UNREACT (Removes emoji after 2 seconds)
            setTimeout(async () => {
                try {
                    await sock.sendMessage(jid, { 
                        react: { text: '', key: m.key } 
                    });
                } catch (e) {
                    // Silently ignore if unreact fails
                }
            }, 2000);

        } catch (err) {
            console.error('🔥 [CODEX FUN ERROR]:', err.message);
        }
    }
};
