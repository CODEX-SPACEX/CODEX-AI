const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class CommandHandler {
    constructor(bot) {
        this.bot = bot;
        this.commandsDir = path.join(__dirname, '../commands');
    }

    async loadCommands() {
        this.bot.commands.clear();
        let loaded = 0;
        let failed = 0;

        const categories = fs.readdirSync(this.commandsDir).filter(f => fs.statSync(path.join(this.commandsDir, f)).isDirectory());

        for (const category of categories) {
            const categoryPath = path.join(this.commandsDir, category);
            const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

            for (const file of files) {
                try {
                    delete require.cache[require.resolve(path.join(categoryPath, file))];
                    const command = require(path.join(categoryPath, file));
                    
                    if (command.name && command.execute) {
                        command.category = category;
                        this.bot.commands.set(command.name.toLowerCase(), command);
                        
                        if (command.aliases) {
                            command.aliases.forEach(alias => {
                                this.bot.commands.set(alias.toLowerCase(), command);
                            });
                        }
                        loaded++;
                    }
                } catch (err) {
                    console.log(chalk.red(`❌ Failed to load ${file}:`, err.message));
                    failed++;
                }
            }
        }

        console.log(chalk.green(`\n✅ Loaded ${loaded} commands`));
        if (failed > 0) console.log(chalk.red(`❌ Failed to load ${failed} commands`));
        
        this.bot.totalCmds = loaded + failed;
        this.bot.successCmds = loaded;
        this.bot.failedCmds = failed;
        
        return { loaded, failed };
    }

    getCommand(name) {
        return this.bot.commands.get(name.toLowerCase());
    }

    getAllCommands() {
        const categories = {};
        for (const [name, cmd] of this.bot.commands) {
            if (!categories[cmd.category]) categories[cmd.category] = [];
            if (cmd.name === name) categories[cmd.category].push(cmd);
        }
        return categories;
    }
}

module.exports = CommandHandler;
