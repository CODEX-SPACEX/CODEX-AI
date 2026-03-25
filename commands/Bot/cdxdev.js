
const { createCanvas } = require('canvas');
const os = require('os');

module.exports = {
  name: 'cdxdev',
  alias: ['cdxdeveloper', 'cdxowner'],
  description: 'Access the Developer Command Interface',
  category: 'Owner',
  react: '👑', // ⚡ Added Reaction

  execute: async (sock, m, { reply }) => {
    // 🛰️ Send the reaction first
    await sock.sendMessage(m.chat, { 
        react: { text: '👑', key: m.key } 
    });

    // 1. Developer Credentials
    const devName = "CODEX";
    const devNumber = "2347019135989";
    const sysArch = os.arch();
    const sysPlatform = os.platform();
    
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

    // 4. BACKGROUND: Deep Black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 5. DRAW DATA OVERLAY (Matrix/Grid)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)'; 
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }

    // 6. NEON BORDERS
    ctx.strokeStyle = '#00FFFF'; // Cyan
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, 570, 320);

    // 7. Header: ROOT ACCESS (Inside Image)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF0000';
    ctx.fillStyle = '#FF0000'; 
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('● SYSTEM_ROOT_ACCESS: GRANTED', 40, 50);

    // 8. MAIN DEVELOPER IDENTITY
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00FFFF';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 45px Courier New';
    ctx.fillText(devName, 40, 120);
    
    ctx.font = '24px Courier New';
    ctx.fillStyle = '#00FFFF';
    ctx.fillText(`ID: ${devNumber}@s.whatsapp.net`, 40, 160);

    // 9. SYSTEM SPECS
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#33FF33'; // Green
    ctx.font = '16px Courier New';
    ctx.fillText(`> ARCHITECTURE: ${sysArch}`, 40, 210);
    ctx.fillText(`> PLATFORM: ${sysPlatform}`, 40, 235);
    ctx.fillText(`> ENCRYPTION: RSA_4096_BIT`, 40, 260);

    // 10. AUTHENTICATION SEAL
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(500, 150, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('AUTHORIZED', 500, 145);
    ctx.fillText('DEVELOPER', 500, 165);

    // 11. FOOTER: DATE & TIME
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Courier New';
    ctx.textAlign = 'right';
    const timestamp = `${day.toUpperCase()} | ${timeString}`;
    ctx.fillText(timestamp, 560, 310);

    // 12. Scanline Overlay Effect
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#00FF00';
    for (let i = 0; i < height; i += 3) {
      ctx.fillRect(0, i, width, 1);
    }
    ctx.globalAlpha = 1.0;

    const buffer = canvas.toBuffer('image/png');
    
    // Send to WhatsApp with Standard Bold Caption
    await sock.sendMessage(m.chat, { 
        image: buffer, 
        caption: `*─── [ CODEX DEV ] ───*\n\n` +
                 `*Developer:* \`${devName}\`\n` +
                 `*Contact:* \`${devNumber}\`\n` +
                 `*Platform:* \`${sysPlatform}\`\n` +
                 `*Location:* \`NIGERIA (WAT)\`\n\n` +
                 `*Status:* \`ADMIN_ACCESS_LEVEL_1\`` 
    }, { quoted: m });

    // ⚡ Auto-Remove Reaction
    await sock.sendMessage(m.chat, { 
        react: { text: '', key: m.key } 
    });
  }
};




  
