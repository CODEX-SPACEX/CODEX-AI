const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    getContentType
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const readline = require("readline");
const path = require('path');

// ─── [ LOAD CONFIG & COMMANDS ] ───────────────
require('./config');
const { loadCommands, commands } = require('./src/handlers/commandLoader');

// ─── [ HELPERS ] ──────────────────────────────
const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (answer) => { rl.close(); resolve(answer); }));
};

// ─── [ BANNER ] ───────────────────────────────
console.log(chalk.blueBright.bold(`
  ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗
 ██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝
 ██║     ██║   ██║██║  ██║█████╗   ╚███╔╝ 
 ██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗ 
 ╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗
  ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
`));
console.log(chalk.blue('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.blueBright.bold('        🪐 CODEX-AI V2.0 — UPLINK SYSTEM   '));
console.log(chalk.blue('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

async function startBot() {
    try {
        // 1. LOAD COMMANDS
        console.log(chalk.yellow('📂 Scanning commands directory...'));
        loadCommands();

        // 2. START CONNECTION
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
        });

        // 3. LOAD SOCKET EXTENSIONS
        require('./library/simple')(sock);

        // 4. PAIRING CODE
        if (!sock.authState.creds.registered) {
            const phoneNumber = await question(chalk.blueBright("  ▸ ❍ Enter Phone Number (with Country Code): "));
            const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            console.log(chalk.blue("\n  ▸ ❍ Your Linking Code: "), chalk.yellow.bold(code));
            console.log(chalk.blue('\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
        }

        sock.ev.on('creds.update', saveCreds);

        // 5. CONNECTION EVENTS
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                reason === DisconnectReason.loggedOut ? process.exit() : startBot();
            } else if (connection === 'open') {
                console.log(chalk.green.bold('\n📡 CODEX-AI V2.0 IS ONLINE\n'));

                const check = (val) => val === "true" ? "✓" : "✗";
                // FIX 1: Send a simple text message — always works, never fails silently
                const connMsg =
                    `┏━━━━〔 🪐 *CODEX-AI V2.0* 〕━━━━┓\n` +
                    `┃ 📡 *STATUS:* CONNECTED ✓\n` +
                    `┃ 🔖 *VERSION:* 2.0.0\n` +
                    `┃ 🔑 *PREFIX:* [ ${global.prefix} ]\n` +
                    `┃ 📦 *COMMANDS:* ${commands.size}\n` +
                    `┃ 🌐 *MODE:* ${global.workmode}\n` +
                    `┃\n` +
                    `┃ 👁️ *STATUS VIEW:* ${check(global.statusview)}\n` +
                    `┃ ❤️ *LIKE STATUS:* ${check(global.statusreact)}\n` +
                    `┃ 🗑️ *ANTIDELETE:* ${check(global.antiDelete)}\n` +
                    `┃ ✏️ *ANTIEDIT:* ${check(global.antiEdit)}\n` +
                    `┃ ⌨️ *AUTO TYPING:* ${check(global.autoTyping)}\n` +
                    `┃ 🎙️ *AUTO RECORD:* ${check(global.autoRecording)}\n` +
                    `┃ 📵 *ANTI-CALL:* ${check(global.anticall)}\n` +
                    `┃ 🔗 *ANTI-LINK:* ${check(global.antilink)}\n` +
                    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n` +
                    `> _Powered by CODEX-AI_`;

                await sock.sendMessage(sock.user.id, { text: connMsg });
            }
        });

        // 6. MESSAGE ENGINE
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                let m = chatUpdate.messages[0];
                if (!m.message || m.key.fromMe) return;

                m = sock.serializeM(m);
                const { chat, isGroup, sender, body } = m;
                const from = chat;
                const pushname = m.pushName || 'User';

                // FIX 2: Skip presence update for status broadcast — stops "last seen" issue
                if (from !== 'status@broadcast') {
                    if (global.autoTyping === "true") await sock.sendPresenceUpdate('composing', from);
                    if (global.autoRecording === "true") await sock.sendPresenceUpdate('recording', from);
                }

                // Status View & React
                if (global.statusview === "true" && from === 'status@broadcast') {
                    await sock.readMessages([m.key]);
                    if (global.statusreact === "true") {
                        await sock.sendMessage(from, { react: { text: '🛸', key: m.key } }, { statusJidList: [m.key.participant] });
                    }
                    return; // Don't process status messages as commands
                }

                // Anti-Link
                if (isGroup && global.antilink === "true" && body && body.includes('chat.whatsapp.com')) {
                    const groupMetadata = await sock.groupMetadata(from);
                    const isBotAdmin = groupMetadata.participants.find(u => u.id === sock.user.id.split(':')[0] + '@s.whatsapp.net')?.admin;
                    const isSenderAdmin = groupMetadata.participants.find(u => u.id === m.key.participant)?.admin;
                    if (isBotAdmin && !isSenderAdmin) {
                        await sock.sendMessage(from, { delete: m.key });
                        if (global.antilinkAction === 'kick') {
                            await sock.groupParticipantsUpdate(from, [m.key.participant], 'remove');
                        }
                        return;
                    }
                }

                // Mention React
                const isMentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
                if (global.mentionReact === "true" && isMentioned) {
                    await sock.sendMessage(from, { react: { text: global.mentionEmoji, key: m.key } });
                }

                // FIX 3: Command Handler — guard against empty body
                if (body && body.startsWith(global.prefix)) {
                    const commandName = body.slice(global.prefix.length).trim().split(/ +/).shift().toLowerCase();
                    const args = body.trim().split(/ +/).slice(1);
                    const text = args.join(' ');
                    const cmd = commands.get(commandName);

                    if (cmd) {
                        if (cmd.owner && sender.split('@')[0] !== global.ownernumber) return m.reply(global.theme.owner);
                        if (cmd.group && !isGroup) return m.reply(global.theme.group);

                        if (typeof cmd.execute === 'function') {
                            await cmd.execute(m, { sock, args, text, from, isGroup, sender, pushname, commands });
                        } else if (typeof cmd.function === 'function') {
                            await cmd.function(sock, m, { body, args, text, isGroup, sender, pushname, commands });
                        }
                    }
                }

            } catch (err) { console.error(chalk.red("Message Error:"), err); }
        });

        // 7. ANTI-CALL
        sock.ev.on('call', async (call) => {
            if (global.anticall === "true") {
                const node = call[0];
                if (node.status === 'offer') {
                    await sock.rejectCall(node.id, node.from);
                    if (global.anticallMode === 'block') await sock.updateBlockStatus(node.from, "block");
                    await sock.sendMessage(node.from, {
                        text: global.anticallMsg
                            .replace('@user', `@${node.from.split('@')[0]}`)
                            .replace('@action', global.anticallMode)
                    });
                }
            }
        });

        // 8. GROUP EVENTS (Welcome / Goodbye)
        sock.ev.on('group-participants.update', async (anu) => {
            if (global.welcome === "true" || global.goodbye === "true") {
                try {
                    const handler = require('./events/group-handler');
                    await handler(sock, anu);
                } catch (e) { /* group-handler optional */ }
            }
        });

        console.log(chalk.bold.green('🤖 CODEX-AI: READY FOR COMMANDS'));

    } catch (err) {
        console.error(chalk.red('❌ Startup Error:'), err);
        process.exit(1);
    }
}

startBot();

// Cleanup on exit
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down CODEX-AI...'));
    process.exit(0);
});
