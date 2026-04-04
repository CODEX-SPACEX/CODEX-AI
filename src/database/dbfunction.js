const fs = require('fs');
const path = require('path');

/**
 * 🪐 CODEX-AI DATABASE FUNCTIONS
 * Location: /src/database/dbfunctions.js
 */

const dbPath = path.join(__dirname, 'LocalDb.json');

// ─── [ CORE ENGINE ] ──────────────────

const readDb = () => {
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch (e) {
        return { users: {}, chats: {}, timers: {}, settings: {} };
    }
};

const writeDb = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// ─── [ EXPORTED LOGIC ] ───────────────

const dbFunctions = {
    
    /**
     * Update or Create User Data
     */
    updateUser: (jid, data = {}) => {
        let db = readDb();
        if (!db.users[jid]) {
            db.users[jid] = { xp: 0, level: 1, premium: false, warn: 0 };
        }
        db.users[jid] = { ...db.users[jid], ...data };
        writeDb(db);
    },

    /**
     * TIMER TASK: Add a new timed event
     * @param {String} category - 'mutes' or 'tempBans'
     * @param {String} id - JID of group/user
     * @param {Number} ms - Duration in milliseconds
     */
    addTimer: (category, id, ms) => {
        let db = readDb();
        const expiry = Date.now() + ms;
        
        if (!db.timers) db.timers = { mutes: {}, tempBans: {} };
        db.timers[category][id] = expiry;
        
        writeDb(db);
        console.log(`[DATABASE] Timer set for ${id} in ${category}`);
    },

    /**
     * TIMER TASK: Check for expired tasks
     * Run this in your main loop
     */
    checkTimers: (onExpire) => {
        let db = readDb();
        let changed = false;
        const now = Date.now();

        if (!db.timers) return;

        for (let category in db.timers) {
            for (let id in db.timers[category]) {
                if (now > db.timers[category][id]) {
                    // Task Expired!
                    const type = category;
                    const target = id;
                    
                    delete db.timers[category][id];
                    changed = true;
                    
                    // Trigger the bot action (unmute/unban)
                    onExpire(type, target);
                }
            }
        }

        if (changed) writeDb(db);
    }
};

module.exports = dbFunctions;




