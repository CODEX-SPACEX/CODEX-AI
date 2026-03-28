const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

class Connection {
    constructor() {
        this.sock = null;
        this.status = 'disconnected';
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState(
            path.join(__dirname, '..', 'auth_info')
        );
        
        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            markOnlineOnConnect: true,
        });

        // --- CLEAN PAIRING CODE DISPLAY ---
        if (!this.sock.authState.creds.registered) {
            console.log(chalk.cyan('\n[ CODEX AI PAIRING ]'));
            
            const phoneNumber = await question(chalk.yellow('Enter your phone number:\n> '));
            
            // Requesting the code...
            const code = await this.sock.requestPairingCode(phoneNumber.trim());
            
            // Formatting the code to look like ABCD-EFGH
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            
            // This prints just the code, bold and white, with no background
            console.log('\n----------------------------');
            console.log(chalk.bold.white(formattedCode)); 
            console.log('----------------------------\n');
            
            console.log(chalk.gray('Link this in WhatsApp > Linked Devices'));
        }

        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    this.connect();
                }
            } else if (connection === 'open') {
                this.status = 'connected';
                console.log(chalk.bold.green('\n✅ CODEX AI Connected Successfully!'));
            }
        });

        this.sock.ev.on('creds.update', saveCreds);
        return this.sock;
    }

    getSocket() {
        return this.sock;
    }
}

module.exports = Connection;
