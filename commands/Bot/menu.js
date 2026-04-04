const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    alias: ['help', 'list', 'cmds'],
    description: 'Show all available commands',
    category: 'Bot',
    react: '🪐',

    async execute(m, { sock, commands }) {
        // --- [ READ MORE LOGIC ] ---
        // This creates the "read more" button in WhatsApp
        const readMore = String.fromCharCode(8206).repeat(4001);

        // 1. React
        await sock.sendMessage(m.chat, {
            react: { text: this.react, key: m.key }
        });

        // 2. Placeholder
        const initial = await sock.sendMessage(m.chat, { text: '*Loading menu...*' }, { quoted: m });

        // --- [ INFO ] ---
        const uptime = process.uptime();
        const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
        const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(1);
        const ramPercent = Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100);
        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: true, timeZone: 'Africa/Lagos'
        }).toLowerCase();

        const userName = m.pushName || m.sender?.split('@')[0] || 'User';

        // --- [ GROUP COMMANDS BY CATEGORY ] ---
        const categories = {};
        const seen = new Set();
        for (const [, cmd] of commands) {
            if (!cmd.name || seen.has(cmd.name.toLowerCase())) continue;
            seen.add(cmd.name.toLowerCase());
            const cat = cmd.category || 'General';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd);
        }

        const totalCmds = seen.size;

        // --- [ BUILD MENU TEXT ] ---
        let menuText = '';

        // Header
        menuText += `╔═══〔 *${global.botname.toUpperCase()}* 〕═══❒\n`;
        menuText += `║╭───────────────◆\n`;
        menuText += `║│ *CODEX-AI V2.0*\n`;
        menuText += `║│ *USER:* ${userName}\n`;
        menuText += `║│ *HOST:* Pterodactyl (panel)\n`;
        menuText += `║│ *PREFIX:* ${global.prefix}\n`;
        menuText += `║│ *CMDS:* ${totalCmds}\n`;
        menuText += `║│ *UPTIME:* ${uptimeStr}\n`;
        menuText += `║│ *MODE:* ${global.workmode?.toUpperCase() || 'PUBLIC'}\n`;
        menuText += `║│ *STORAGE:* ${usedRam}/${totalRam} GB (${ramPercent}%)\n`;
        menuText += `║│ *TIME:* ${time}\n`;
        menuText += `║╰───────────────◆\n`;
        menuText += `╚══════════════════❒\n\n`;

        // 🚀 ADD READ MORE HERE
        // This ensures the commands list stays hidden until the user clicks
        menuText += readMore + "\n";

        // Command sections
        for (const [cat, cmds] of Object.entries(categories).sort()) {
            menuText += `╔═══〔 *${cat.toUpperCase()}* 〕═══❒\n`;
            menuText += `║╭───────────────◆\n`;
            for (const cmd of cmds) {
                menuText += `║│ ${global.prefix}${cmd.name}\n`;
            }
            menuText += `║╰───────────────◆\n`;
            menuText += `╚══════════════════❒\n\n`;
        }

        // Developer footer
        menuText += `╔═══〔 *DEVELOPER* 〕═══❒\n`;
        menuText += `║╭───────────────◆\n`;
        menuText += `║│  *CODEX*\n`;
        menuText += `║│ *VERSION:* 1.0.0\n`;
        menuText += `║╰───────────────◆\n`;
        menuText += `╚══════════════════❒`;

        // 3. Try to send with image, fallback to text
        const imgPath = path.join(__dirname, '../../thumbnail/menu.jpg');
        const hasImage = fs.existsSync(imgPath);

        await sock.sendMessage(m.chat,
            hasImage
                ? { image: fs.readFileSync(imgPath), caption: menuText }
                : { text: menuText },
            { quoted: m }
        );

        // 4. Edit placeholder
        await sock.sendMessage(m.chat, { text: '*Menu loaded!*', edit: initial.key });

        // 5. Remove reaction
        await sock.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};
