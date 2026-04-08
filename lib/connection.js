const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    proto,
    getContentType
} = require('@whiskeysockets/baileys');
const pino     = require('pino');
const chalk    = require('chalk');
const fs       = require('fs-extra');
const readline = require('readline');

const MSG_CACHE_MAX = 2000;

function readMsgCache() {
    try { return JSON.parse(fs.readFileSync('./database/msgcache.json', 'utf8')); }
    catch { return {}; }
}
function writeMsgCache(cache) {
    const keys = Object.keys(cache);
    const data = keys.length > MSG_CACHE_MAX
        ? Object.fromEntries(keys.slice(-MSG_CACHE_MAX).map(k => [k, cache[k]]))
        : cache;
    fs.writeFileSync('./database/msgcache.json', JSON.stringify(data));
}

async function askPhoneNumber() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        console.log(chalk.cyan('\n📱 Enter your WhatsApp number to get a pairing code:'));
        console.log(chalk.gray('   Format: 2348012345678  (country code + number, no + or spaces)\n'));
        rl.question(chalk.yellow('Phone Number: '), answer => {
            rl.close();
            resolve(answer.replace(/[^0-9]/g, ''));
        });
    });
}

async function startConnection(bot) {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version }          = await fetchLatestBaileysVersion();
    const hasSession           = !!(state.creds?.me?.id);

    let phoneNumber = '';
    if (!hasSession) {
        phoneNumber = await askPhoneNumber();
        if (phoneNumber.length < 7) {
            console.log(chalk.red('\n❌ Invalid phone number. Please restart.\n'));
            process.exit(1);
        }
    }

    bot.sock = makeWASocket({
        version,
        logger:                     pino({ level: 'silent' }),
        printQRInTerminal:          false,
        auth:                       state,
        browser:                    ['Ubuntu', 'Chrome', '20.0.04'],
        generateHighQualityLinkPreview: true,
        syncFullHistory:            false,
        markOnlineOnConnect:        bot.config.alwaysOnline || false,
        getMessage:                 async () => proto.Message.fromObject({}),
        connectTimeoutMs:           60000,
        defaultQueryTimeoutMs:      0,
        keepAliveIntervalMs:        10000,
        retryRequestDelayMs:        250
    });

    if (!hasSession && phoneNumber) {
        setTimeout(async () => {
            try {
                const code = await bot.sock.requestPairingCode(phoneNumber);
                console.log(chalk.green('\n╔════════════════════════════════════╗'));
                console.log(chalk.green('║      🔐 YOUR PAIRING CODE           ║'));
                console.log(chalk.green('╚════════════════════════════════════╝'));
                console.log(chalk.white(`\n   Code ➜  ${chalk.bold.bgGreen.black(`  ${code}  `)}\n`));
                console.log(chalk.yellow('   Steps:'));
                console.log(chalk.white('   1. Open WhatsApp → Settings → Linked Devices'));
                console.log(chalk.white('   2. Tap "Link a Device"'));
                console.log(chalk.white('   3. Tap "Link with phone number instead"'));
                console.log(chalk.white(`   4. Enter: ${chalk.bold(code)}`));
                console.log(chalk.gray('\n   ⏳ Waiting...\n'));
            } catch (err) {
                console.log(chalk.red('\n❌ Pairing code failed:', err.message));
                setTimeout(() => startConnection(bot).catch(console.error), 5000);
            }
        }, 3000);
    }

    bot.sock.ev.on('creds.update', saveCreds);

    // ── Connection state ──────────────────────────────────────────────────────
    bot.sock.ev.on('connection.update', async update => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const code        = lastDisconnect?.error?.output?.statusCode;
            const isLoggedOut = code === DisconnectReason.loggedOut;
            const reason      = lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message || 'Unknown';
            console.log(chalk.red(`\n⚠️  Disconnected: ${reason}`));
            if (isLoggedOut) { console.log(chalk.red('🚪 Logged out. Delete /session folder and restart.\n')); process.exit(0); }
            console.log(chalk.yellow('🔄 Reconnecting in 5s...\n'));
            setTimeout(() => startConnection(bot).catch(console.error), 5000);
        } else if (connection === 'open') {
            console.log(chalk.green('\n✅ WhatsApp connected!\n'));
            console.log(chalk.cyan(`│ 🤖  ${bot.config.botName}`));
            console.log(chalk.cyan(`│ 🔑  Prefix: ${bot.prefix}`));
            console.log(chalk.cyan(`│ 🌐  Mode: ${bot.config.mode.toUpperCase()}`));
            console.log(chalk.cyan(`│ 📦  CMDs: ${bot.commands.size} loaded`));
            setTimeout(() => bot.sendStartupMessage().catch(e => console.error('Startup msg:', e.message)), 3000);
        }
    });

    // ── Messages ──────────────────────────────────────────────────────────────
    bot.sock.ev.on('messages.upsert', async ({ type, messages }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (!msg.message) continue;

            // ── Status messages: auto-view, auto-react, anti-group-mention ────
            if (msg.key.remoteJid === 'status@broadcast') {
                const svCfg = bot.config.statusView || {};
                const srCfg = bot.config.statusReact || {};

                // Auto view status
                if (svCfg.enabled !== false) {
                    await bot.sock.readMessages([msg.key]).catch(() => {});
                }
                // Auto react to status
                if (srCfg.enabled) {
                    await bot.sock.sendMessage(msg.key.remoteJid, {
                        react: { text: srCfg.emoji || '👀', key: msg.key }
                    }).catch(() => {});
                }

                // Anti-Group Mention: check if this status mentions any group
                try {
                    const innerType = getContentType(msg.message);
                    const inner     = msg.message[innerType];
                    const mentioned = inner?.contextInfo?.mentionedJid || [];
                    const statusSender = msg.key.participant || msg.key.remoteJid;
                    for (const jid of mentioned) {
                        if (jid.endsWith('@g.us')) {
                            await bot.antiSystems.checkStatusGroupMention(statusSender, jid).catch(() => {});
                        }
                    }
                } catch {}
                continue;
            }

            if (!msg.key.fromMe) bot._cacheMessage(msg);

            // Revoke (delete-for-everyone)
            if (msg.message?.protocolMessage?.type === 0) {
                await bot._handleAntiDelete(msg.message.protocolMessage.key, msg.key.remoteJid).catch(() => {});
                continue;
            }
            // Edit
            if (msg.message?.protocolMessage?.type === 14) {
                await bot._handleAntiEdit(msg.message.protocolMessage.key, msg.message.protocolMessage.editedMessage, msg.key.remoteJid).catch(() => {});
                continue;
            }

            if (msg.key.fromMe) continue;
            await bot.messageHandler.handle(msg).catch(console.error);
        }
    });

    // ── Message updates (fallback for status view) ────────────────────────────
    bot.sock.ev.on('messages.update', async updates => {
        for (const { key, update: upd } of updates) {
            if (key.remoteJid === 'status@broadcast') {
                const svCfg = bot.config.statusView || {};
                if (svCfg.enabled !== false) await bot.sock.readMessages([key]).catch(() => {});
                continue;
            }
            if (upd?.message === null)       await bot._handleAntiDelete(key).catch(() => {});
            if (upd?.message?.editedMessage) await bot._handleAntiEdit(key, upd.message).catch(() => {});
        }
    });

    // ── Group updates ─────────────────────────────────────────────────────────
    bot.sock.ev.on('group-participants.update', async update => {
        await bot.handleGroupUpdate(update).catch(console.error);
    });

    // ── Calls ─────────────────────────────────────────────────────────────────
    bot.sock.ev.on('call', async calls => {
        const cfg = bot.config.antiCall;
        if (!cfg || cfg === false) return;
        const mode = (typeof cfg === 'object') ? (cfg.mode || 'default') : 'default';
        for (const call of calls) {
            if (call.status !== 'offer') continue;
            // Always reject
            await bot.sock.rejectCall(call.id, call.from).catch(() => {});
            if (mode === 'block') {
                // Block the caller
                await bot.sock.updateBlockStatus(call.from, 'block').catch(() => {});
                await bot.sock.sendMessage(call.from, {
                    text: `Calls are not allowed. You have been blocked.`
                }).catch(() => {});
            } else {
                // Default: reject + notify
                await bot.sock.sendMessage(call.from, {
                    text: `Calls are not accepted. Please send a message instead.`
                }).catch(() => {});
            }
        }
    });
}

module.exports = { startConnection, readMsgCache, writeMsgCache };
                      
