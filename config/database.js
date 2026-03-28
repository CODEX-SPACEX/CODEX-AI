const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.json');

class Database {
    constructor() {
        this.data = {
            settings: {
                antilink: false,
                antidelete: false,
                antiedit: false,
                antigroupmention: false,
                autotyping: false,
                autorecording: false,
                autoviewstatus: false,
                autoreactstatus: false,
                prefix: '.'
            },
            sudo: [], // Sudo users (can use all commands)
            mods: [], // Moderators
            banned: [], // Banned users
            vars: {}, // Custom variables
            deletedMessages: {}, // Store deleted messages for antidelete
            editedMessages: {} // Store edited messages for antiedit
        };
        this.init();
    }

    async init() {
        if (await fs.pathExists(DB_PATH)) {
            const saved = await fs.readJson(DB_PATH);
            this.data = { ...this.data, ...saved };
        } else {
            await this.save();
        }
    }

    async save() {
        await fs.writeJson(DB_PATH, this.data, { spaces: 2 });
    }

    // Settings
    getSettings() {
        return this.data.settings;
    }

    async setSetting(key, value) {
        this.data.settings[key] = value;
        await this.save();
    }

    // Sudo/Mod Management
    isSudo(jid) {
        return this.data.sudo.includes(jid);
    }

    isMod(jid) {
        return this.data.mods.includes(jid) || this.isSudo(jid);
    }

    async addSudo(jid) {
        if (!this.data.sudo.includes(jid)) {
            this.data.sudo.push(jid);
            await this.save();
        }
    }

    async removeSudo(jid) {
        this.data.sudo = this.data.sudo.filter(id => id !== jid);
        await this.save();
    }

    async addMod(jid) {
        if (!this.data.mods.includes(jid)) {
            this.data.mods.push(jid);
            await this.save();
        }
    }

    async removeMod(jid) {
        this.data.mods = this.data.mods.filter(id => id !== jid);
        await this.save();
    }

    // Ban System
    isBanned(jid) {
        return this.data.banned.includes(jid);
    }

    async ban(jid) {
        if (!this.data.banned.includes(jid)) {
            this.data.banned.push(jid);
            await this.save();
        }
    }

    async unban(jid) {
        this.data.banned = this.data.banned.filter(id => id !== jid);
        await this.save();
    }

    // Variables
    async setVar(key, value) {
        this.data.vars[key] = value;
        await this.save();
    }

    getVar(key) {
        return this.data.vars[key];
    }

    getAllVars() {
        return this.data.vars;
    }

    async deleteVar(key) {
        delete this.data.vars[key];
        await this.save();
    }

    // Deleted messages storage
    storeDeletedMessage(id, message) {
        this.data.deletedMessages[id] = message;
    }

    getDeletedMessage(id) {
        return this.data.deletedMessages[id];
    }

    // Edited messages storage
    storeEditedMessage(id, message) {
        this.data.editedMessages[id] = message;
    }

    getEditedMessage(id) {
        return this.data.editedMessages[id];
    }
}

module.exports = new Database();


