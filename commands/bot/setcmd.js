const fs = require('fs-extra');

module.exports = {
    name: 'setcmd',
    aliases: [],
    category: 'bot',
    description: 'Reply a sticker with .setcmd <command> to trigger that command when the sticker is sent',

    async execute(bot, m, args) {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.msg?.contextInfo?.quotedMessage;
        if (!quoted?.stickerMessage) return await m.reply(
`How to use:
1. Reply to any sticker
2. Type: ${bot.prefix}setcmd <command>

Example: reply a sticker then type ${bot.prefix}setcmd menu
To remove: reply the sticker and type ${bot.prefix}delcmd`);

        const commandName = args[0]?.toLowerCase();
        if (!commandName) return await m.reply(`Please specify a command. Example: ${bot.prefix}setcmd menu`);

        const cmd = bot.commandHandler.getCommand(commandName);
        if (!cmd) return await m.reply(`Command ${commandName} not found. Check: ${bot.prefix}menu`);

        const sha256 = quoted.stickerMessage.fileSha256;
        if (!sha256) return await m.reply('Could not read sticker ID. Try a different sticker.');
        const stickerId = Buffer.from(sha256).toString('base64');

        const dbPath = './database/stickercmds.json';
        let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        db[stickerId] = { command: commandName, setBy: m.sender, setAt: Date.now() };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        await m.reply(`Sticker linked to ${bot.prefix}${commandName}.\nSend that sticker anywhere to run the command.\nTo remove: reply the sticker then type ${bot.prefix}delcmd`);
    }
};
