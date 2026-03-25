
const { createCanvas } = require('canvas');
const os = require('os');

module.exports = {
  name: 'cdxuptime',
  alias: ['cdxruntime', 'cdxup'],
  description: 'Show how long the bot has been active',
  category: 'Bot',
  react: '🕣', // ⚡ Added Reaction

  execute: async (sock, m, { reply }) => {
    // 🛰️ Send the reaction first
    await sock.sendMessage(m.chat, { 
        react: { text: '🕣', key: m.key } 
    });

    // 1. Calculate Uptime
    const seconds = Math.floor(process.uptime());
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m_ = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const uptimeString = `${d}d ${h}h ${m_}m ${s}s`;

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
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.03)'; 
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

    // 7. Header: CODEX AI (Standard Bold in Canvas)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00FFFF';
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('< CODEX  AI >', width / 2, 70);

    // 8. MAIN UPTIME DISPLAY
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00FF00';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 70px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(uptimeString, width / 2, 190);

    // 9. TECH SUB-TEXT
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00FF00';
    ctx.font = '16px Courier New';
    ctx.fillText(`PROCESS_ID: ${process.pid} // OS: ${os.platform()}`, width / 2, 235);

    // 10. FOOTER: DATE & TIME (Nigeria)
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 22px Courier New';
    const timestamp = `${day.toUpperCase()} // ${timeString}`;
    ctx.fillText(timestamp, width / 2, 320);

    // 11. DATA DECORATION
    ctx.globalAlpha = 0.3;
    ctx.font = '12px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('MEMORY_USAGE: ' + (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB', 40, 340);
    ctx.textAlign = 'right';
    ctx.fillText('UPTIME_STABILITY: 100%', 560, 340);
    ctx.globalAlpha = 1.0;

    // 12. Scanline Overlay Effect
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < height; i += 4) {
      ctx.fillRect(0, i, width, 1);
    }
    ctx.globalAlpha = 1.0;

    const buffer = canvas.toBuffer('image/png');
    
    // Send to WhatsApp with Standard Bold Caption
    await sock.sendMessage(m.chat, { 
        image: buffer, 
        caption: `*─── [ CODEX UPTIME ] ───*\n\n` +
                 `*Runtime:* \`${uptimeString}\`\n` +
                 `*Time:* \`${timeString}\`\n` +
                 `*Day:* \`${day}\`\n\n` +
                 `*Status:* \`STABLE_SESSION\`` 
    }, { quoted: m });

    // ⚡ Auto-Remove Reaction
    await sock.sendMessage(m.chat, { 
        react: { text: '', key: m.key } 
    });
  }
};



      
