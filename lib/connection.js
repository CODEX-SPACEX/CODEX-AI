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

        // --- IMPROVED PAIRING CODE DISPLAY ---
        if (!this.sock.authState.creds.registered) {
            console.log(chalk.bold.cyan('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
            console.log(chalk.bold.cyan('┃      CODEX AI PAIRING SYSTEM         ┃'));
            console.log(chalk.bold.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
            
            const phoneNumber = await question(chalk.yellow('\nEnter your number (e.g. 2349064626405):\n> '));
            
            const code = await this.sock.requestPairingCode(phoneNumber.trim());
            
            // This displays the code with spaces so it's easy to read
            const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
            
            console.log(chalk.bold.white('\nYour Pairing Code is:'));
            console.log(chalk.bold.black.bgWhite(`  >  ${formattedCode}  <  `)); 
            console.log(chalk.cyan('\nFollow: WhatsApp > Linked Devices > Link with Phone Number\n'));
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
