const chalk = require('chalk');

class MessageHandler {
    constructor(sock) {
        this.sock = sock;
        this.prefix = '.'; // Change this to your preferred prefix
    }

    /**
     * 🧠 THE COMMAND ENGINE
     * This processes every incoming message.
     */
    async handleMessage(m) {
        try {
            // 1. Extract the message body safely
            const type = Object.keys(m.message)[0];
            
            // This handles normal texts, image captions, and quoted messages
            const body = type === 'conversation' ? m.message.conversation :
                         type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         type === 'imageMessage' ? m.message.imageMessage.caption :
                         type === 'videoMessage' ? m.message.videoMessage.caption : '';

            // 2. Ignore if it's not a command
            if (!body || !body.startsWith(this.prefix)) return;

            // 3. Parse Command and Arguments
            const args = body.slice(this.prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const text = args.join(' ');

            // 4. Find the Plugin in the Global Map
            const plugin = global.plugins.get(cmdName);

            if (plugin) {
                console.log(chalk.cyan(`🚀 [EXECUTE] Command: ${cmdName} | From: ${m.key.remoteJid}`));
                
                // 5. Run the plugin
                // We pass (sock, message, extras) so your plugins have everything they need
                await plugin(this.sock, m, { 
                    args, 
                    text, 
                    body, 
                    prefix: this.prefix,
                    command: cmdName 
                });
            } else {
                console.log(chalk.yellow(`❓ [UNKNOWN] Command: ${cmdName} (No plugin found)`));
            }

        } catch (err) {
            console.error(chalk.red('🔥 [HANDLER ERROR]:'), err);
        }
    }

    async handleDelete(m) {
        // Logic for when someone deletes a message
        console.log(chalk.red(`🗑️ [ANTIDELETE] Message caught from: ${m.key.remoteJid}`));
    }

    async handleEdit(m) {
        // Logic for when someone edits a message
        console.log(chalk.blue(`📝 [ANTIEDIT] Message change caught from: ${m.key.remoteJid}`));
    }
}

module.exports = MessageHandler;
