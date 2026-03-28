const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const db = require('../config/database');
const Utils = require('./utils');

class MessageHandler {
    constructor(sock) {
        this.sock = sock;
        this.commands = new Map();
        this.plugins = new Map();
        this.loadPlugins();
    }

    loadPlugins() {
        const pluginsDir = path.join(__dirname, '..', 'plugins');
        
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, { recursive: true });
        }

        const categories = fs.readdirSync(pluginsDir);

        categories.forEach(category => {
            const categoryPath = path.join(pluginsDir, category);
            
            if (fs.statSync(categoryPath).isDirectory()) {
                const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
                
                files.forEach(file => {
                    try {
                        delete require.cache[require.resolve(path.join(categoryPath, file))];
                        const plugin = require(path.join(categoryPath, file));
                        
                        if (plugin.command && plugin.execute) {
                            const cmdName = plugin.command.toLowerCase();
                            this.commands.set(cmdName, plugin);
                            this.plugins.set(cmdName, { ...plugin, category });
                            
                            if (plugin.aliases) {
                                plugin.aliases.forEach(alias => {
                                    this.commands.set(alias.toLowerCase(), plugin);
                                });
                            }
                            
                            console.log(chalk.green(`✓ Loaded: ${category}/${file}`));
                        }
                    } catch (err) {
                        console.log(chalk.red(`✗ Error loading ${file}:`, err.message));
                    }
                });
            }
        });

        console.log(chalk.cyan(`\nTotal Commands Loaded: ${this.commands.size}`));
    }

    async handleMessage(msg) {
        if (!msg.message) return;

        const jid = msg.key.remoteJid;
        const sender = Utils.getSenderJid(msg);
        const isGroup = Utils.isGroupJid(jid);
        const isStatus = Utils.isStatusJid(jid);
        const settings = db.getSettings();

        // Auto view status
        if (isStatus && settings.autoviewstatus) {
            await this.sock.readMessages([msg.key]);
        }

        // Auto react status
        if (isStatus && settings.autoreactstatus) {
            const reactions = ['👍', '❤️', '🔥', '😂', '😮', '🎉'];
            const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
            await Utils.sendReaction(this.sock, jid, msg.key, randomReaction);
        }

        if (isStatus) return;

        // Check if banned
        if (db.isBanned(sender)) return;

        const messageText = msg.message.conversation || 
                          msg.message.extendedTextMessage?.text || 
                          msg.message.imageMessage?.caption ||
                          msg.message.videoMessage?.caption || '';

        // Anti-link in groups
        if (isGroup && settings.antilink && Utils.isUrl(messageText)) {
            const groupMetadata = await this.sock.groupMetadata(jid);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            
            if (!participant?.admin && !db.isMod(sender) && !db.isSudo(sender)) {
                await this.sock.sendMessage(jid, { 
                    delete: msg.key 
                });
                await this.sock.sendMessage(jid, {
                    text: `⚠️ @${sender.split('@')[0]} Links are not allowed!`,
                    mentions: [sender]
                });
                return;
            }
        }

        // Anti group mention
        if (isGroup && settings.antigroupmention && Utils.containsGroupMention(messageText)) {
            const groupMetadata = await this.sock.groupMetadata(jid);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            
            if (!participant?.admin && !db.isMod(sender) && !db.isSudo(sender)) {
                await this.sock.sendMessage(jid, { 
                    delete: msg.key 
                });
                await this.sock.sendMessage(jid, {
                    text: `⚠️ @${sender.split('@')[0]} Group mentions are not allowed!`,
                    mentions: [sender]
                });
                return;
            }
        }

        // Parse command
        const parsed = Utils.parseCommand(messageText, settings.prefix);
        if (!parsed) return;

        const { command, args, text } = parsed;
        const plugin = this.commands.get(command);

        if (!plugin) return;

        // Check permissions
        if (plugin.sudo && !db.isSudo(sender)) {
            await this.sock.sendMessage(jid, { text: '❌ This command is only for sudo users!' });
            return;
        }

        if (plugin.mod && !db.isMod(sender)) {
            await this.sock.sendMessage(jid, { text: '❌ This command is only for moderators!' });
            return;
        }

        // Auto typing/recording
        if (settings.autotyping) {
            await Utils.sendTyping(this.sock, jid, 1000);
        } else if (settings.autorecording) {
            await Utils.sendRecording(this.sock, jid, 1000);
        }

        // Execute command
        try {
            const context = {
                sock: this.sock,
                msg,
                jid,
                sender,
                isGroup,
                args,
                text,
                db,
                Utils,
                repondre: (text) => this.sock.sendMessage(jid, { text }),
                reply: (text) => this.sock.sendMessage(jid, { text }, { quoted: msg })
            };

            await plugin.execute(context);
        } catch (err) {
            console.error(chalk.red(`Command Error (${command}):`, err));
            await this.sock.sendMessage(jid, { 
                text: `❌ Error executing command: ${err.message}` 
            });
        }
    }

    async handleDelete(msg) {
        const settings = db.getSettings();
        if (!settings.antidelete) return;

        const deletedMsg = msg.message.protocolMessage;
        if (!deletedMsg) return;

        const originalMsg = db.getDeletedMessage(deletedMsg.key.id);
        if (!originalMsg) return;

        const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
        const chatJid = originalMsg.key.remoteJid;

        let info = `🚨 *Anti Delete Detected*\n\n`;
        info += `👤 *User:* @${sender.split('@')[0]}\n`;
        info += `⏰ *Time:* ${Utils.formatTime()}\n`;
        info += `💬 *Message:*\n`;

        if (originalMsg.message.conversation) {
            info += originalMsg.message.conversation;
        } else if (originalMsg.message.extendedTextMessage?.text) {
            info += originalMsg.message.extendedTextMessage.text;
        }

        await this.sock.sendMessage(chatJid, {
            text: info,
            mentions: [sender]
        });
    }

    async handleEdit(msg) {
        const settings = db.getSettings();
        if (!settings.antiedit) return;

        const editedMsg = msg.message.editedMessage;
        if (!editedMsg) return;

        const originalMsg = db.getEditedMessage(editedMsg.message.protocolMessage.key.id);
        if (!originalMsg) return;

        const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
        const chatJid = originalMsg.key.remoteJid;

        let info = `📝 *Anti Edit Detected*\n\n`;
        info += `👤 *User:* @${sender.split('@')[0]}\n`;
        info += `⏰ *Time:* ${Utils.formatTime()}\n`;
        info += `🗑️ *Original:* ${originalMsg.message.conversation || originalMsg.message.extendedTextMessage?.text || '[Media]'}\n`;
        info += `✏️ *Edited:* ${editedMsg.message.protocolMessage.editedMessage?.conversation || '[Media]'}`;

        await this.sock.sendMessage(chatJid, {
            text: info,
            mentions: [sender]
        });
    }
}

module.exports = MessageHandler;


                                          
