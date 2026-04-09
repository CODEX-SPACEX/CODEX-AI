const fs = require('fs-extra');

module.exports = {
    name: 'setvar',
    category: 'bot',
    description: 'Set a variable. Usage: .setvar KEY=VALUE',

    async execute(bot, m, args) {
        const raw = args.join(' ').trim();

        if (!raw || !raw.includes('=')) return await m.reply(
`setvar usage: ${bot.prefix}setvar KEY=VALUE

Examples:
${bot.prefix}setvar PREFIX=!
${bot.prefix}setvar BOT_FONT=custom      (restore your custom font)
${bot.prefix}setvar BOT_FONT=11          (set any font 0-63)
${bot.prefix}setvar CUSTOM_BFONT=26      (set your custom font number)
${bot.prefix}setvar botname=CODEX-AI
${bot.prefix}setvar owner_name=CODEX
${bot.prefix}setvar owner_number=2349063626405

See font list: ${bot.prefix}botfont`);

        const eqIdx = raw.indexOf('=');
        const key   = raw.slice(0, eqIdx).trim();
        const value = raw.slice(eqIdx + 1).trim();

        if (!key) return await m.reply(`Invalid format. Use: ${bot.prefix}setvar KEY=VALUE`);

        const dbPath = './database/variables.json';
        let db = {};
        try { db = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch {}

        const save = () => fs.writeFileSync('./config.json', JSON.stringify(bot.config, null, 2));

        // ── PREFIX ─────────────────────────────────────────────────────────────
        if (key.toUpperCase() === 'PREFIX') {
            if (!value) return await m.reply('Prefix cannot be empty.');
            db[key] = value; fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            bot.prefix = value; bot.config.prefix = value; save();
            return await m.reply(`PREFIX updated to: ${value}\nAll commands now use: ${value}menu`);
        }

        // ── BOT_FONT ───────────────────────────────────────────────────────────
        if (key.toUpperCase() === 'BOT_FONT') {
            if (value.toLowerCase() === 'custom') {
                const customNum = parseInt(bot.config.CUSTOM_BFONT) || 0;
                bot.config.BOT_FONT = customNum; db[key] = String(customNum);
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); save();
                return await m.reply(customNum === 0 ? 'Bot font restored to plain text.' : `Bot font restored to your custom font #${customNum}.`);
            }
            const num = parseInt(value);
            if (isNaN(num) || num < 0 || num > 63) return await m.reply(`BOT_FONT must be 0-63 or "custom".\nSee: ${bot.prefix}botfont`);
            bot.config.BOT_FONT = num; db[key] = String(num);
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); save();
            return await m.reply(num === 0 ? 'Bot font OFF. Using plain text.' : `Bot font set to #${num}.`);
        }

        // ── CUSTOM_BFONT ───────────────────────────────────────────────────────
        if (key.toUpperCase() === 'CUSTOM_BFONT') {
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 63) return await m.reply(`CUSTOM_BFONT must be 1-63.\nSee: ${bot.prefix}botfont`);
            bot.config.CUSTOM_BFONT = num; bot.config.BOT_FONT = num;
            db[key] = String(num); db['BOT_FONT'] = String(num);
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); save();
            return await m.reply(`Custom font set to #${num}. All replies now use this style.\nTo restore: ${bot.prefix}setvar BOT_FONT=custom`);
        }

        // ── CMDREACT_EMOJI ─────────────────────────────────────────────────────
        if (key.toUpperCase() === 'CMDREACT_EMOJI') {
            if (!bot.config.cmdReact) bot.config.cmdReact = { enabled: true };
            if (value.toLowerCase() === 'system default' || value.toLowerCase() === 'default') {
                bot.config.cmdReact.emoji = null; db[key] = 'default';
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); save();
                return await m.reply('Command react emoji reset to system default (each command uses its own emoji).');
            }
            bot.config.cmdReact.emoji = value; db[key] = value;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); save();
            return await m.reply(`Command react emoji set to: ${value}`);
        }

        // ── OWNER NAME ─────────────────────────────────────────────────────────
        if (key.toLowerCase() === 'owner_name' || key.toLowerCase() === 'ownername') {
            bot.config.owner.name = value; db[key] = value;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); save();
            return await m.reply(`Owner name updated to: ${value}`);
        }

        // ── OWNER NUMBER ───────────────────────────────────────────────────────
        if (key.toLowerCase() === 'owner_number' || key.toLowerCase() === 'ownernumber') {
            const clean = value.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            bot.config.owner.number = clean; db[key] = clean;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); save();
            return await m.reply(`Owner number updated to: ${clean}`);
        }

        // ── BOT NAME ───────────────────────────────────────────────────────────
        if (key.toLowerCase() === 'botname') {
            bot.config.botName = value; db[key] = value;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); save();
            return await m.reply(`Bot name updated to: ${value}`);
        }

        // ── Generic ────────────────────────────────────────────────────────────
        db[key] = value; fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        if (Object.prototype.hasOwnProperty.call(bot.config, key)) {
            bot.config[key] = value; save();
        }
        await m.reply(`${key} = ${value}`);
    }
};
          
