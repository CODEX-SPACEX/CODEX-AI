
const fs = require('fs');
const chalk = require('chalk');
require('dotenv').config(); 

// ════════════════════════════════════════════════
//        🪐 CODEX-AI V2.0 — CONFIG FILE
//   Edit this file to customize your bot fully.
// ════════════════════════════════════════════════


// ─── [ OWNER & IDENTITY ] ──────────────────────
global.ownername   = "CODEX";                          // Your display name
global.ownernumber = "2349064626405";                  // Your number WITH country code, NO +
global.botname     = "CODEX AI V2.0";                  // Bot's name
global.prefix      = ".";                              // Command prefix (e.g. . ! /)
global.repo        = "https://github.com/CODEX-SPACEX/CODEX-AI/tree/main";


// ─── [ STICKER METADATA ] ──────────────────────
global.packname = "CODEX AI";
global.author   = "✦ CODEX-SPACEX";


// ─── [ BOT MODE ] ──────────────────────────────
// "public"  = everyone can use commands
// "private" = only owner can use commands
global.workmode = "public";


// ─── [ PRESENCE & INTERACTION ] ────────────────
// autoTyping   : Bot shows "typing..." when it receives a message
// autoRecording: Bot shows "recording..." when it receives a message
// autoread     : Bot auto-reads (blue ticks) every message
// NOTE: Only one of autoTyping/autoRecording should be "true" at a time.
global.presence      = "true";
global.autoTyping    = "true";       // "true" / "false"
global.autoRecording = "false";      // "true" / "false"  ← set true to show recording instead
global.autoread      = "false";      // "true" = auto blue tick every message


// ─── [ STATUS FEATURES ] ───────────────────────
// statusview  : Bot automatically views everyone's status
// statusreact : Bot reacts 🛸 to every status it views
global.statusview   = "true";
global.statusreact  = "true";
global.mentionReact = "true";        // React when someone mentions the bot
global.mentionEmoji = "🛸";          // Emoji used when bot is mentioned


// ─── [ AUTO-BIO ] ──────────────────────────────
// Bot will update its WhatsApp bio automatically
global.autobio  = "true";
global.bioText  = `🪐 CODEX-AI V2.0 | 🥏 Active | 🕒 @time`;


// ─── [ CAPTION ] ───────────────────────────────
// Added to the bottom of media messages
global.caption = `\n> *𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗖𝗢𝗗𝗘𝗫-𝗔𝗜*`;


// ─── [ WELCOME & GOODBYE MESSAGES ] ────────────
global.welcome = "true";
global.goodbye = "true";

global.welMsg = `┏━━━━〔 ✦ 𝗖𝗢𝗗𝗘𝗫 *AI*〕━━━━━\n┃ 🛸 *WELCOME !*\n┃ 👤 *User:* @user\n┃ 📂 *Group:* *@group*\n┃ 👥 *Members:* *@count*\n┃ 📜 *Description:*\n┃ *@desc*\n┗━━━━━━━━━━━━━━━━━━━━━━━`;

global.byeMsg = `┏━━━━〔 ✦ 𝗖𝗢𝗗𝗘𝗫 *AI*〕━━━━━\n┃ 🚪 *GOOD BYE!*\n┃ 👤 *User:* @user\n┃ 🥀 *GOOD RIDDANCE.*\n┗━━━━━━━━━━━━━━━━━━━━━━━`;

global.adTitles = {
    welcome: "CODEX AI: NEW IDENTITY DETECTED",
    goodbye: "CODEX AI: USER TERMINATED",
    profile: "CODEX AI: IDENTITY SCAN"
};


// ─── [ ANTI-CALL ] ─────────────────────────────
// anticall     : Reject incoming calls automatically
// anticallMode : "block" = block the caller | "reject" = just reject
global.anticall     = "true";
global.anticallMode = "block";
global.anticallMsg  = `⚠️ *𝗦𝗬𝗦𝗧𝗘𝗠 𝗔𝗟𝗘𝗥𝗧 !*\n` +
                      `  ▸ ❍ 👤 *𝗨𝘀𝗲𝗿:* @user\n` +
                      `  ▸ ❍ 🚫 *𝗔𝗰𝘁𝗶𝗼𝗻:* \`@action\`\n` +
                      `  ▸ ❍ ❌ *𝗥𝗲𝗮𝘀𝗼𝗻:* \`Calls strictly prohibited\``;


// ─── [ GROUP GUARD & PROTECTION ] ──────────────
// antilink       : Delete WhatsApp group links sent by non-admins
// antilinkAction : "kick" = remove sender | "delete" = just delete message
global.antilink       = "true";
global.antilinkAction = "kick";

// antispam       : Detect and act on message flooding
// antispamAction : "delete" = delete message | "kick" = remove spammer
global.antispam       = "true";
global.antispamAction = "delete";

// antighost      : Detect ghost mentions (tag without message)
// antighostAction: "warn" | "kick"
global.antighost       = "true";
global.antighostAction = "warn";

// antigp         : Anti group promotion (sending group links)
// antigpAction   : "kick" | "warn"
global.antigp       = "true";
global.antigpAction = "kick";

// antitag        : Prevent tagging the bot/owner without permission
// antitagAction  : "warn" | "kick"
global.antitag       = "true";
global.antitagAction = "warn";

global.maxWarns = 3;   // Number of warns before kick


// ─── [ PROTECTION MESSAGES ] ───────────────────
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

global.tagMsg = `🛡️ *𝗔𝗡𝗧𝗜-𝗧𝗔𝗚 !*\n` +
                `  ▸ ❍ 👤 *𝗨𝘀𝗲𝗿:* @user\n` +
                `  ▸ ❍ 🚫 *𝗔𝗰𝘁𝗶𝗼𝗻:* \`@action\`\n` +
                `  ▸ ❍ 🔖 *𝗥𝗲𝗮𝘀𝗼𝗻:* \`Mentioning Owner/Bot restricted\``;


// ─── [ MUTE & UNMUTE MESSAGES ] ────────────────
global.muteMsg = `🔇 *𝗨𝗦𝗘𝗥 𝗦𝗜𝗟𝗘𝗡𝗖𝗘𝗗 !*\n` +
                 `  ▸ ❍ 👤 *𝗧𝗮𝗿𝗴𝗲𝘁:* @user\n` +
                 `  ▸ ❍ 🕒 *𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻:* \`@time\`\n` +
                 `  ▸ ❍ ⚠️ *𝗥𝗲𝗮𝘀𝗼𝗻:* \`Rule Violation\``;

global.unmuteMsg = `🔊 *𝗨𝗦𝗘𝗥 𝗥𝗘𝗦𝗧𝗢𝗥𝗘𝗗 !*\n` +
                   `  ▸ ❍ 👤 *𝗧𝗮𝗿𝗴𝗲𝘁:* @user\n` +
                   `  ▸ ❍ ✅ *𝗦𝘁𝗮𝘁𝘂𝘀:* \`Active / Verified\``;


// ─── [ SYSTEM THEME ] ──────────────────────────
global.theme = {
    success : "❍📡 *𝗦𝗨𝗖𝗖𝗘𝗦𝗦 !*\n",
    error   : "❌ *𝗘𝗥𝗥𝗢𝗥 !*\n",
    wait    : "⏳ *𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚...*",
    owner   : "👤 *This command is for Owner only!*",
    group   : "👥 *This command is for Groups only!*",
    admin   : "🛡️ *This command is for Admins only!*"
};


// ─── [ CHATBOT / AI ] ──────────────────────────
global.chatbot    = "true";
global.botTriggers = ["codex", "cdx"];   // Words that wake the AI chatbot


// ─── [ ANTI-DELETE & ANTI-EDIT ] ───────────────
global.antiDelete = "true";   // Re-send deleted messages to owner
global.antiEdit   = "true";   // Log edited messages


// ─── [ HOT RELOAD ] ────────────────────────────
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`♻️  config.js updated — reloading...`));
    delete require.cache[file];
    require(file);
});
