
const fs = require('fs');
const os = require('os');
const { getByCategory, getAll } = require('../Handlers/CommandLoader');

module.exports = {
    name: 'menu',
    alias: ['help', 'list'],
    desc: 'Show all commands with System Stats UI',
    category: 'Bot',
    function: async (sock, m, { prefix, pushname }) => {
        try {
            // 1. START: React with Loading Emoji
            await sock.sendMessage(m.chat, { react: { text: "💬", key: m.key } });

            // 2. SYSTEM DATA
            const uptimeSeconds = process.uptime();
            const uptimeMin = Math.floor(uptimeSeconds / 60);
            const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
            const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(1);
            const totalCmds = getAll().size;
            const time = new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' 
            });

            // 3. UI DESIGN (▸ ❍)
            let menuText = `╔═══〔 ❍ *${global.botname || 'CODEX AI'}* 〕═══❒\n`;
            menuText += `║╭───────────────◆\n`;
            menuText += `║│ ▸ ❍ *USER:* ${pushname}\n`;
            menuText += `║│ ▸ ❍ *CMDS:* ${totalCmds}\n`;
            menuText += `║│ ▸ ❍ *UPTIME:* ${uptimeMin} MIN\n`;
            menuText += `║│ ▸ ❍ *HOST:* Pterodactyl (Panel)\n`;
            menuText += `║│ ▸ ❍ *STORAGE:* ${usedRam}/${totalRam}GB\n`;
            menuText += `║│ ▸ ❍ *PREFIX:* ${prefix}\n`;
            menuText += `║│ ▸ ❍ *TIME:* ${time}\n`;
            menuText += `║╰───────────────◆\n`;
            menuText += `╚══════════════════❒\n`;

            const categories = getByCategory();
            for (const [category, cmds] of Object.entries(categories)) {
                menuText += `\n╔═══〔 ❍ *${category.toUpperCase()}* 〕═══❒\n`;
                menuText += `║╭───────────────◆\n`;
                cmds.forEach(cmd => {
                    menuText += `║│ ▸ ❍ ${prefix}${cmd.name}\n`;
                });
                menuText += `║╰───────────────◆\n`;
                menuText += `╚══════════════════❒\n`;
            }

            // 4. PREPARE IMAGE
            const menuImg = fs.existsSync('./Public/images/menu.jpg') 
                ? fs.readFileSync('./Public/images/menu.jpg') 
                : { url: 'https://i.imgur.com/BoN9kdC.png' };

            // 5. SEND THE MENU
            await sock.sendMessage(m.chat, {
                image: menuImg,
                caption: menuText,
                contextInfo: {
                    externalAdReply: {
                        title: `${global.botname || 'CODEX-AI'} V2.0`,
                        body: "Created by Codex-SpaceX",
                        thumbnail: menuImg,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            // 6. FINISH: UNREACT COMPLETELY (Remove 💬)
            await sock.sendMessage(m.chat, { react: { text: "", key: m.key } });

        } catch (err) {
            // Safety: Remove reaction if the command fails
            await sock.sendMessage(m.chat, { react: { text: "", key: m.key } });
            console.error(err);
        }
    }
};




              
