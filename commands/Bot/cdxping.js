
const { createCanvas } = require('canvas');
const os = require('os');

module.exports = {
  name: 'cdxping',
  alias: ['cdxspeed'],
  description: 'Show bot latency with a hacker interface',
  category: 'Bot',
  react: '⚡', // ⚡ Added Reaction

  execute: async (sock, m, { reply }) => {
    // 🛰️ Send the reaction first
    await sock.sendMessage(m.chat, { 
        react: { text: '⚡', key: m.key } 
    });

    const ping = Date.now() - m.messageTimestamp * 1000;
    
    // --- NIGERIA TIME LOGIC ---
    const options = { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateOptions = { timeZone: 'Africa/Lagos', weekday: 'long' };
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', options);
    const day = now.toLocaleDateString('en-US', dateOptions);

    // Canvas Dimensions
    const width = 600;
    const height = 350;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. BACKGROUND
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 2. TECH SCAN LINES
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < height; i += 4) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // 3. NEON CORNER ACCENTS
    ctx.strokeStyle = '#00FFFF'; 
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, 80); ctx.lineTo(20, 20); ctx.lineTo(80, 20); ctx.stroke();
    ctx.strokeStyle = '#FF00FF'; 
    ctx.beginPath(); ctx.moveTo(580, 270); ctx.lineTo(580, 330); ctx.lineTo(520, 330); ctx.stroke();

    // 4. TOP TITLE: CODEX AI (Standard Bold in Canvas)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00FFFF';
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(' < CODEX  AI > ', width / 2, 60);

    // 5. MAIN PING DISPLAY (Glitch Effect)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 110px Courier New';
    ctx.fillText(`${ping}ms`, (width / 2) - 3, 190);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${ping}ms`, width / 2, 190);
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#00FFFF';
    ctx.fillText(`${ping}ms`, width / 2, 190);

    // 6. DECORATIVE DATA ELEMENTS
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#33FF33'; 
    ctx.font = '14px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('► SYSTEM: ONLINE', 50, 260);
    ctx.fillText('► SECTOR: C-137', 50, 280);
    ctx.textAlign = 'right';
    ctx.fillText('STABILITY: 100%', 550, 260);
    ctx.fillText('LATENCY: STABLE', 550, 280);

    // 7. FOOTER: DATE & TIME
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 22px Courier New';
    const timestamp = `${day.toUpperCase()} // ${timeString}`;
    ctx.fillText(timestamp, width / 2, 320);

    // 8. DATA DECORATION
    ctx.globalAlpha = 0.4;
    ctx.font = '10px Courier New';
    ctx.fillStyle = '#00FF00';
    ctx.fillText('01011010 00101101 11010101 01011011', width / 2, 20);
    ctx.fillText('SYS_LOG: SUCCESSFUL_CONNECTION_ESTABLISHED', width / 2, 340);
    ctx.globalAlpha = 1.0;

    const buffer = canvas.toBuffer('image/png');
    
    // Send to WhatsApp with Standard Bold Caption
    await sock.sendMessage(m.chat, { 
        image: buffer, 
        caption: `*─── [ CODEX TERMINAL ] ───*\n\n` +
                 `*Latency:* \`${ping}ms\`\n` +
                 `*Time:* \`${timeString}\`\n` +
                 `*Day:* \`${day}\`\n\n` +
                 `*Status:* \`SYSTEM_OPTIMIZED\`` 
    }, { quoted: m });

    // ⚡ Auto-Remove Reaction
    await sock.sendMessage(m.chat, { 
        react: { text: '', key: m.key } 
    });
  }
};



      
