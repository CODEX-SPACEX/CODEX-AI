
const { createCanvas } = require('canvas');
const os = require('os');

module.exports = {
  name: 'cdxalive',
  alias: ['cdxonline', 'cdxinfo'],
  description: 'Check if the bot is active with a high-tech interface',
  category: 'Bot',
  react: '🥏', 

  execute: async (sock, m, { reply }) => {
    // 🛰️ Send the reaction first
    await sock.sendMessage(m.chat, { 
        react: { text: '🥏', key: m.key } 
    });

    // 1. Get User Info
    const pushname = m.pushName || 'User';
    
    // 2. Get Nigeria Time
    const options = { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateOptions = { timeZone: 'Africa/Lagos', weekday: 'long' };
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', options);
    const day = now.toLocaleDateString('en-US', dateOptions);

    // 3. Setup Canvas
    const width = 600;
    const height = 350;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 4. BACKGROUND: Pure pitch black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 5. DRAW HUD GRID
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)'; 
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 30) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 30) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // 6. NEON CORNER ACCENTS
    ctx.strokeStyle = '#00FFFF'; // Cyan
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, 80); ctx.lineTo(20, 20); ctx.lineTo(80, 20); ctx.stroke();
    ctx.strokeStyle = '#FF00FF'; // Magenta
    ctx.beginPath(); ctx.moveTo(580, 270); ctx.lineTo(580, 330); ctx.lineTo(520, 330); ctx.stroke();

    // 7. Header: CODEX AI
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00FFFF';
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('< CODEX  AI >', width / 2, 70);

    // 8. MAIN "ALIVE" DISPLAY
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00FF00';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('ACTIVE', width / 2, 175);
    
    // 9. GREETING USER
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00FF00';
    ctx.font = '18px Courier New';
    ctx.fillText(`HELLO, ${pushname.toUpperCase()}`, width / 2, 220);

    // 10. TECH SUB-TEXT
    ctx.fillStyle = '#00FFFF';
    ctx.font = '14px Courier New';
    ctx.fillText(`CORE_VERSION: 2.0.4 // PROTOCOL: STABLE`, width / 2, 250);

    // 11. FOOTER: DATE & TIME (Nigeria)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Courier New';
    const timestamp = `${day.toUpperCase()} // ${timeString}`;
    ctx.fillText(timestamp, width / 2, 310);

    // 12. DATA DECORATION
    ctx.globalAlpha = 0.3;
    ctx.font = '10px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('READY_TO_EXECUTE', 40, 340);
    ctx.textAlign = 'right';
    ctx.fillText('ENCRYPTION_ACTIVE', 560, 340);
    ctx.globalAlpha = 1.0;

    // 13. Scanline Overlay Effect
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < height; i += 4) {
      ctx.fillRect(0, i, width, 1);
    }
    ctx.globalAlpha = 1.0;

    const buffer = canvas.toBuffer('image/png');
    
    // Send to WhatsApp with standard Bold captions
    await sock.sendMessage(m.chat, { 
        image: buffer, 
        caption: `*─── [ CODEX AI ONLINE ] ───*\n\n` +
                 `*Hello:* \`${pushname}\`\n` +
                 `*Status:* \`SYSTEM OPERATIONAL\`\n` +
                 `*Time:* \`${timeString}\`\n` +
                 `*Day:* \`${day}\`\n\n` +
                 `*Type .menu to see my commands.*` 
    }, { quoted: m });

    // ⚡ Auto-Remove Reaction
    await sock.sendMessage(m.chat, { 
        react: { text: '', key: m.key } 
    });
  }
};



  
