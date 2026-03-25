
const fs = require('fs');
const chalk = require('chalk');
require('dotenv').config(); 

// ─── [ OWNER & IDENTITY ] ──────────────
global.ownername = "CODEX"; 
global.ownernumber = "2347019135989"; 
global.botname = "CODEX AI V2.0";
global.prefix = "."; 
global.repo = "https://github.com/CODEX-SPACEX/CODEX-AI/tree/main";

// ─── [ STICKER METADATA ] ──────────────
global.packname = "CODEX AI";
global.author = "✦ CODEX-SPACEX";

// ─── [ GLOBAL SWITCHES ] ──────────────
global.welcome = "true";      
global.goodbye = "true";      
global.antiDelete = "true";  
global.antiEdit = "true"; 
global.chatbot = "true";      
global.botTriggers = ["codex", "cdx"]; 
global.workmode = "public"; 

// ─── [ THE WELCOME & GOODBYE BOXES ] ──
global.welMsg = `┏━━━━〔 ✦ 𝗖𝗢𝗗𝗘𝗫 *AI*〕━━━━━\n┃ 🛸 *WELCOME !*\n┃ 👤 *User:* @user\n┃ 📂 *Group:* *@group*\n┃ 👥 *Member Count:* *@count*\n┃ 📜 *Description:*\n┃ *@desc*\n┗━━━━━━━━━━━━━━━━━━━━━━━`;

global.byeMsg = `┏━━━━〔 ✦ 𝗖𝗢𝗗𝗘𝗫 *AI*〕━━━━━\n┃ 🚪 *GOOD BYE!*\n┃ 👤 *User:* @user\n┃ 🥀 *GOOD RIDDANCE.*\n┃ *WE WILL NEVER MISS YOU.*\n┗━━━━━━━━━━━━━━━━━━━━━━━`;

global.adTitles = {
    welcome: "CODEX AI: NEW IDENTITY DETECTED",
    goodbye: "CODEX AI: USER TERMINATED",
    profile: "CODEX AI: IDENTITY SCAN"
};

// ─── [ ANTI-CALL SETTINGS ] ────────────
global.anticall = process.env.ANTICALL || "true"; 
global.anticallMode = "block"; 
global.anticallMsg = `⚠️ *𝗦𝗬𝗦𝗧𝗘𝗠 𝗔𝗟𝗘𝗥𝗧 !*\n` +
                     `  ▸ ❍ 👤 *𝗨𝘀𝗲𝗿:* @user\n` +
                     `  ▸ ❍ 🚫 *𝗔𝗰𝘁𝗶𝗼𝗻:* \`@action\`\n` +
                     `  ▸ ❍ ❌ *𝗥𝗲𝗮𝘀𝗼𝗻:* \`Calls strictly prohibited\``;

// ─── [ GROUP GUARD & PROTECTION ] ──────
global.antilink = "true";
global.antilinkAction = "kick"; 
global.antispam = "true";
global.antispamAction = "delete"; 
global.antighost = "true"; 
global.antighostAction = "warn"; 
global.antigp = "true"; 
global.antigpAction = "kick"; 
global.antitag = "true";
global.antitagAction = "warn";
global.maxWarns = 3; 

// ─── [ PROTECTION SYSTEM MESSAGES ] ────
global.warnMsg = `⚠️ *𝗦𝗬𝗦𝗧𝗘𝗠 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 !*\n` +
                 `  ▸ ❍ 👤 *𝗨𝘀𝗲𝗿:* @user\n` +
                 `  ▸ ❍ 🚫 *𝗪𝗮𝗿𝗻𝘀:* \`@count / @max\`\n` +
                 `  ▸ ❍ ❌ *𝗥𝗲𝗮𝘀𝗼𝗻:* \`@reason\``;

global.linkMsg = `🛡️ *𝗚𝗥𝗢𝗨𝗣 𝗚𝗨𝗔𝗥𝗗 !*\n` +
                 `  ▸ ❍ 👤 *𝗨𝘀𝗲𝗿:* @user\n` +
                 `  ▸ ❍ 🚫 *𝗔𝗰𝘁𝗶𝗼𝗻:* \`@action\`\n` +
                 `  ▸ ❍ 🔗 *𝗥𝗲𝗮𝘀𝗼𝗻:* \`External Link Detected\``;

global.spamMsg = `🛡️ *𝗦𝗣𝗔𝗠 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 !*\n` +
                 `  ▸ ❍ 👤 *𝗨𝘀𝗲𝗿:* @user\n` +
                 `  ▸ ❍ 🚫 *𝗔𝗰𝘁𝗶𝗼𝗻:* \`@action\`\n` +
                 `  ▸ ❍ ⚡ *𝗥𝗲𝗮𝘀𝗼𝗻:* \`Message Flooding Detected\``;

global.tagMsg = `🛡️ *𝗔𝗡𝗧𝗜-𝗧𝗔𝗚 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 !*\n` +
                `  ▸ ❍ 👤 *𝗨𝘀𝗲𝗿:* @user\n` +
                `  ▸ ❍ 🚫 *𝗔𝗰𝘁𝗶𝗼𝗻:* \`@action\`\n` +
                `  ▸ ❍ 🔖 *𝗥𝗲𝗮𝘀𝗼𝗻:* \`Mentioning Owner/Bot restricted\``;

// ─── [ MUTE & UNMUTE MESSAGES ] ───────
global.muteMsg = `🔇 *𝗨𝗦𝗘𝗥 𝗦𝗜𝗟𝗘𝗡𝗖𝗘𝗗 !*\n` +
                 `  ▸ ❍ 👤 *𝗧𝗮𝗿𝗴𝗲𝘁:* @user\n` +
                 `  ▸ ❍ 🕒 *𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻:* \`@time\`\n` +
                 `  ▸ ❍ ⚠️ *𝗥𝗲𝗮𝘀𝗼𝗻:* \`Rule Violation\``;

global.unmuteMsg = `🔊 *𝗨𝗦𝗘𝗥 𝗥𝗘𝗦𝗧𝗢𝗥𝗘𝗗 !*\n` +
                   `  ▸ ❍ 👤 *𝗧𝗮𝗿𝗴𝗲𝘁:* @user\n` +
                   `  ▸ ❍ ✅ *𝗦𝘁𝗮𝘁𝘂𝘀:* \`Active / Verified\``;

// ─── [ PRESENCE & INTERACTION ] ────────
global.presence = "true";         // Master switch for presence
global.autoTyping = "true";      // Bot shows "typing..."
global.autoRecording = "true";    // Bot shows "recording..."
global.autoread = "false"; 
global.statusview = "true";
global.statusreact = "true"; 
global.mentionReact = "true"; 
global.mentionEmoji = "🛸"; 

// ─── [ AUTO-BIO & CAPTION ] ────────────
global.autobio = "true"; 
global.bioText = `🪐 CODEX-AI V2.0 | 🥏 Active | 🕒 @time`;
global.caption = `\n> *𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗖𝗢𝗗𝗘𝗫-𝗔𝗜*`;

// ─── [ SYSTEM THEME ] ───────────────
global.theme = {
    success: "❍📡 *𝗦𝗨𝗖𝗖𝗘𝗦𝗦 !*\n",
    error: "❌ *𝗘𝗥𝗥𝗢𝗥 !*\n",
    wait: "⏳ *𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚...*",
    owner: "👤 *This command is for Owner only!*",
    group: "👥 *This command is for Groups only!*",
    admin: "🛡️ *This command is for Admins only!*"
};

// ─── [ HOT RELOAD LOGIC ] ──────────────
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update 'config.js'`));
    delete require.cache[file];
    require(file);
});




