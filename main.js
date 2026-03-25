
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    generateWAMessageFromContent, 
    makeInMemoryStore,
    getContentType 
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const readline = require("readline");

// Load your specific config
require('../config');

// ─── [ HELPERS & STORAGE ] ────────────
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (answer) => { rl.close(); resolve(answer); }));
};

async function startCodex() {
    const { state, saveCreds } = await useMultiFileAuthState(`./src/session`);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, 
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
    });

    // ─── [ PAIRING CODE SYSTEM ] ──────────
    if (!sock.authState.creds.registered) {
        console.log(chalk.cyan.bold("\n🪐 CODEX-AI V2.0: UPLINK SYSTEM"));
        const phoneNumber = await question(chalk.white("  ▸ ❍ Enter Phone Number (with Country Code): "));
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(chalk.white("  ▸ ❍ Your Linking Code: "), chalk.yellow.bold(code));
    }

    store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    // ─── [ CONNECTION & DEPLOYMENT UI ] ───
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            reason === DisconnectReason.loggedOut ? process.exit() : startCodex();
        } else if (connection === 'open') {
            console.log(chalk.green.bold(`\n📡 CODEX-AI V2.0 IS ONLINE`));

            const cmdPath = './src/commands';
            const totalCommands = fs.existsSync(cmdPath) ? fs.readdirSync(cmdPath).filter(f => f.endsWith('.js')).length : 0;
            const check = (val) => val === "true" ? "✓" : "✗";

            // The "Kord-Style" Body using your config switches
            let bodyText = `┏  CONNECTED ┓\n` +
                `々 VERSION: 2.0.0\n` +
                `々 PREFIX: [ ${global.prefix} ]\n` +
                `々 COMMANDS: ${totalCommands}\n` +
                `々 MODE: ${global.workmode}\n` +
                `々 STATUS VIEW: ${check(global.statusview)}\n` +
                `々 LIKE STATUS: ${check(global.statusreact)}\n` +
                `々 ANTIDELETE: ${check(global.antiDelete)}\n` +
                `々 ANTIEDIT: ${check(global.antiEdit)}\n\n` +
                `*Channel:* ${global.repo}`;

            const inviteMsg = {
                groupInviteMessage: {
                    groupJid: "120363424837876420@g.us",
                    inviteCode: "CdMJFXsV2CUALskBqPKEpB",
                    groupName: global.botname,
                    caption: bodyText,
                    jpegThumbnail: fs.existsSync('./src/assets/logo.jpg') ? fs.readFileSync('./src/assets/logo.jpg') : null
                }
            };

            // Notify Owner on Login
            await sock.sendMessage(sock.user.id, inviteMsg);
        }
    });

    // ─── [ THE MESSAGE ENGINE ] ───────────
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;

            const from = m.key.remoteJid;
            const type = getContentType(m.message);
            const body = type === 'conversation' ? m.message.conversation : type === 'extendedTextMessage' ? m.message.extendedTextMessage.text : '';
            const isGroup = from.endsWith('@g.us');

            // 1. AUTO-TYPING & RECORDING (Presence Logic)
            if (global.autoTyping === "true") await sock.sendPresenceUpdate('composing', from);
            if (global.autoRecording === "true") await sock.sendPresenceUpdate('recording', from);

            // 2. STATUS AUTO-VIEW & AUTO-REACT
            if (global.statusview === "true" && from === 'status@broadcast') {
                await sock.readMessages([m.key]);
                if (global.statusreact === "true") {
                    await sock.sendMessage(from, { react: { text: '🛸', key: m.key } }, { statusJidList: [m.key.participant] });
                }
            }

            // 3. ANTI-LINK PROTECTION
            if (isGroup && global.antilink === "true" && body.includes('chat.whatsapp.com')) {
                const groupMetadata = await sock.groupMetadata(from);
                const isBotAdmin = groupMetadata.participants.find(u => u.id === sock.user.id.split(':')[0] + '@s.whatsapp.net')?.admin;
                const isSenderAdmin = groupMetadata.participants.find(u => u.id === m.key.participant)?.admin;

                if (isBotAdmin && !isSenderAdmin) {
                    await sock.sendMessage(from, { delete: m.key });
                    if (global.antilinkAction === 'kick') {
                        await sock.groupParticipantsUpdate(from, [m.key.participant], 'remove');
                    }
                }
            }

            // 4. MENTION REACTION
            const isMentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
            if (global.mentionReact === "true" && isMentioned) {
                await sock.sendMessage(from, { react: { text: global.mentionEmoji, key: m.key } });
            }

            // 5. COMMAND HANDLER
            if (body.startsWith(global.prefix)) {
                const command = body.slice(global.prefix.length).trim().split(/ +/).shift().toLowerCase();
                const args = body.trim().split(/ +/).slice(1);
                const cmdFile = `./src/commands/${command}.js`;
                if (fs.existsSync(cmdFile)) {
                    require(cmdFile)(sock, m, { args, from });
                }
            }

        } catch (err) { console.error(chalk.red("Error: "), err); }
    });

    // ─── [ ANTI-CALL PROTECTION ] ─────────
    sock.ev.on('call', async (call) => {
        if (global.anticall === "true") {
            const node = call[0];
            if (node.status === 'offer') {
                await sock.rejectCall(node.id, node.from);
                if (global.anticallMode === 'block') {
                    await sock.updateBlockStatus(node.from, "block");
                }
                // Optional: Send Warning Msg
                await sock.sendMessage(node.from, { text: global.anticallMsg.replace('@user', `@${node.from.split('@')[0]}`).replace('@action', global.anticallMode) });
            }
        }
    });

    // ─── [ GROUP EVENTS (Welcome/Goodbye) ] 
    sock.ev.on('group-participants.update', async (anu) => {
        if (global.welcome === "true" || global.goodbye === "true") {
            try { 
                const handler = require('./events/group-handler');
                await handler(sock, anu);
            } catch (e) { console.error("Event Error:", e); }
        }
    });
}

startCodex();




                  
