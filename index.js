const Connection = require('./lib/connection');
const MessageHandler = require('./lib/messageHandler');
const db = require('./config/database');
const Utils = require('./lib/utils'); // Import the Class
const chalk = require('chalk');
const path = require('path');

// 1. Initialize the Global Map (The Bot's Memory)
global.plugins = new Map();

console.log(chalk.blue(`
   ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝
  ██║     ██║   ██║██║  ██║█████╗   ╚███╔╝ 
  ██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗ 
  ╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗
   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
   CODEX AI - Advanced WhatsApp Bot
`));

async function startBot() {
    try {
        // 2. LOAD PLUGINS (Must happen before connection)
        console.log(chalk.yellow('📂 Scanning plugins directory...'));
        const pluginsPath = path.join(__dirname, 'plugins');
        
        // Use the static loader from your Utils class
        Utils.loadPlugins(pluginsPath); 
        console.log(chalk.green(`✅ Total Plugins Loaded: ${global.plugins.size}`));

        // 3. START CONNECTION
        const conn = new Connection();
        const sock = await conn.connect();
        
        // 4. INITIALIZE MESSAGE HANDLER
        const handler = new MessageHandler(sock);

        // 5. THE BRIDGE: Listen for Messages
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            // Optional: Store in DB for anti-delete
            if (msg.key.id) {
                db.storeDeletedMessage(msg.key.id, msg);
            }

            // Send to the Logic Engine
            await handler.handleMessage(msg);
        });

        // 6. THE BRIDGE: Listen for Edits/Deletes
        sock.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                try {
                    const msg = await sock.loadMessages(update.key.remoteJid, 1, update.key);
                    if (!msg || !msg[0]) continue;

                    if (msg[0]?.message?.protocolMessage?.type === 0) {
                        await handler.handleDelete(msg[0]);
                    } else if (msg[0]?.message?.protocolMessage?.type === 14) {
                        await handler.handleEdit(msg[0]);
                    }
                } catch (e) { /* Ignore ghost updates */ }
            }
        });

        console.log(chalk.bold.green('🤖 CODEX AI: READY FOR COMMANDS'));

    } catch (err) {
        console.error(chalk.red('❌ Startup Error:'), err);
        process.exit(1);
    }
}

startBot();

// Cleanup on exit
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down...'));
    process.exit(0);
});
