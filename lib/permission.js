const fs = require('fs-extra');

class Permission {
    constructor(bot) {
        this.bot = bot;
    }

    // Strip Baileys device suffix e.g. 234xxxx:12@s.whatsapp.net → 234xxxx@s.whatsapp.net
    _clean(jid) {
        if (!jid) return '';
        return jid.replace(/:[0-9]+@/, '@').replace(/@.*/, '') + '@s.whatsapp.net';
    }

    isOwner(jid) {
        const cleanJid = this._clean(jid);
        const cleanOwner = this._clean(this.bot.config.owner.number);
        const isOwner = cleanJid === cleanOwner;
        console.log(`[Permission] isOwner check: ${cleanJid} vs ${cleanOwner} = ${isOwner}`);
        return isOwner;
    }

    isMod(jid) {
        if (this.isOwner(jid)) return true; // Owner is also mod
        const c = this._clean(jid);
        const isMod = (this.bot.config.mods || []).some(m => this._clean(m) === c);
        console.log(`[Permission] isMod check: ${c} = ${isMod}`);
        return isMod;
    }

    isSudo(jid) {
        if (this.isMod(jid)) return true; // Mods/Owner are above sudo
        const c = this._clean(jid);
        let sudoData = {};
        try { sudoData = JSON.parse(fs.readFileSync('./database/sudo.json', 'utf8')); } catch {}
        const inDB  = Object.keys(sudoData).some(k => this._clean(k) === c);
        const inCfg = (this.bot.config.sudo || []).some(s => this._clean(s) === c);
        const isSudo = inDB || inCfg;
        console.log(`[Permission] isSudo check: ${c} = ${isSudo}`);
        return isSudo;
    }

    async isAdmin(groupJid, userJid) {
        try {
            const meta = await this.bot.sock.groupMetadata(groupJid);
            const c    = this._clean(userJid);
            const p    = meta.participants.find(p => this._clean(p.id) === c);
            return p && (p.admin === 'admin' || p.admin === 'superadmin');
        } catch { return false; }
    }

    async isBotAdmin(groupJid) {
        try {
            const botClean = this._clean(this.bot.sock.user.id);
            const meta     = await this.bot.sock.groupMetadata(groupJid);
            const p        = meta.participants.find(p => this._clean(p.id) === botClean);
            return p && (p.admin === 'admin' || p.admin === 'superadmin');
        } catch { return false; }
    }
}

module.exports = Permission;
