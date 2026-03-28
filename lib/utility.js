const moment = require('moment-timezone');

class Utils {
    static formatTime() {
        return moment().tz('Africa/Lagos').format('HH:mm:ss');
    }

    static formatDate() {
        return moment().tz('Africa/Lagos').format('DD/MM/YYYY');
    }

    static isUrl(text) {
        return /(https?:\/\/[^\s]+)/g.test(text);
    }

    static extractLinks(text) {
        return text.match(/(https?:\/\/[^\s]+)/g) || [];
    }

    static containsGroupMention(text) {
        return /@\d{12,15}-\d{4,5}@g\.us/g.test(text);
    }

    static isGroupJid(jid) {
        return jid.endsWith('@g.us');
    }

    static isStatusJid(jid) {
        return jid === 'status@broadcast';
    }

    static getSenderJid(msg) {
        return msg.key.participant || msg.key.remoteJid;
    }

    static getGroupMetadata(sock, jid) {
        return sock.groupMetadata(jid);
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static generateMessageId() {
        return Math.random().toString(36).substring(2, 15);
    }

    static parseCommand(text, prefix) {
        if (!text.startsWith(prefix)) return null;
        
        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        
        return {
            command,
            args,
            text: args.join(' ')
        };
    }

    static async sendReaction(sock, jid, key, emoji) {
        await sock.sendMessage(jid, {
            react: {
                text: emoji,
                key: key
            }
        });
    }

    static async sendTyping(sock, jid, duration = 3000) {
        await sock.sendPresenceUpdate('composing', jid);
        await this.delay(duration);
        await sock.sendPresenceUpdate('paused', jid);
    }

    static async sendRecording(sock, jid, duration = 3000) {
        await sock.sendPresenceUpdate('recording', jid);
        await this.delay(duration);
        await sock.sendPresenceUpdate('paused', jid);
    }
}

module.exports = Utils;


