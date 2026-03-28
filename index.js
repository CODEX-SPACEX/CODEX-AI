const Connection = require('./lib/connection');
const MessageHandler = require('./lib/messageHandler');
const db = require('./config/database');
const chalk = require('chalk');

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
        const conn = new Connection();
        const sock = await conn.connect();
        const handler = new MessageHandler(sock);

        // Handle messages
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.key.fromMe) {
                // Store message for antidelete/antiedit
                if (msg.key.id) {
                    db.storeDeletedMessage(msg.key.id, msg);
                    db.storeEditedMessage(msg.key.id, msg);
                }
                await handler.handleMessage(msg);
            }
        });

        // Handle message updates (delete/edit)
        sock.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                const msg = await sock.loadMessages(update.key.remoteJid, 1, update.key);
                if (msg[0]?.message?.protocolMessage?.type === 0) {
                    await handler.handleDelete(msg[0]);
                } else if (msg[0]?.message?.protocolMessage?.type === 14) {
                    await handler.handleEdit(msg[0]);
                }
            }
        });

        // Handle status updates
        sock.ev.on('presence.update', (update) => {
            // Handle presence updates if needed
        });

        console.log(chalk.green('🤖 Bot is running...'));

    } catch (err) {
        console.error(chalk.red('Failed to start bot:', err));
        process.exit(1);
    }
}

startBot();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down CODEX AI...'));
    process.exit(0);
});

