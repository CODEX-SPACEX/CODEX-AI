
const { 
    DisconnectReason, 
    useMultiFileAuthState, 
    makeWASocket, 
    makeCacheableSignalKeyStore, 
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const chalk = require('chalk');
const db = require('../src/database/dbfunctions');

/**
 * 🪐 CODEX-AI CLIENT HANDLER
 * Location: /Handlers/Client.js
 */

const startBot = async () => {
    // 1. Auth & Versioning
    const { state, saveCreds } = await useMultiFileAuthState('./src/session');
    const { version } = await fetchLatestBaileysVersion();

    // 2. Socket Configuration
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: Browsers.macOS("Desktop"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        generateHighQualityLinkPreview: true,
        syncFullHistory: false
    });

    // 3. Initialize simple.js (Socket Expansion)
    require('../Library/simple')(sock);

    // 4. Connection Events
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) console.log(chalk.magenta('📷 [QR] Scan now to link CODEX-AI...'));

        if (connection === 'close') {
            let reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log(chalk.yellow('🔄 Connection lost. Reconnecting...'));
                startBot();
            } else {
                console.log(chalk.red('❌ Session Expired. Please delete /src/session and restart.'));
            }
        } else if (connection === 'open') {
            console.log(chalk.green.bold(`\n✅ CODEX-AI V2.0 ONLINE: ${sock.user.id.split(':')[0]}`));
            
            // Startup Notification with Public Logo
            const botLogo = fs.readFileSync('./Public/images/bot-logo.png');
            await sock.sendMessage(sock.user.id, { 
                image: botLogo, 
                caption: `*CODEX-AI V2.0 IS LIVE*\n\n*User:* ${sock.user.name}\n*Prefix:* ${global.prefix}\n*Database:* LocalDb.json Linked` 
            });
        }
    });

    // 5. Message Handler (The Bridge)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;
            
            // Pass the message to your Command Handler (Step we will do next)
            require('./Message')(sock, m); 
        } catch (err) {
            console.log(chalk.red('[ERROR] Message Upsert:'), err);
        }
    });

    // 6. Group Events (Welcome / Left / Promote)
    sock.ev.on('group-participants.update', async (anu) => {
        // Logic for Welcome messages would go here
        console.log(chalk.blue(`[GROUP EVENT] Action: ${anu.action} in ${anu.id}`));
    });

    // 7. Background Timer Loop (Your Timer Tasks)
    setInterval(() => {
        db.checkTimers(async (type, id) => {
            if (type === 'mutes') {
                await sock.groupSettingUpdate(id, 'not_announcement'); // Open Group
                await sock.sendMessage(id, { text: "🔓 *TIMER TASK:* This group has been automatically unmuted." });
            }
            if (type === 'tempBans') {
                // Logic to unblock or notify about unban
                console.log(`[TIMER] Expired ban for: ${id}`);
            }
        });
    }, 30000); // Checks every 30 seconds

    // 8. Auto-Save Credentials
    sock.ev.on('creds.update', saveCreds);

    return sock;
};

module.exports = { startBot };




                                                        
