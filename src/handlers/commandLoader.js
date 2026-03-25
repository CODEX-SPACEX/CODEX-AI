
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * 🪐 CODEX-AI COMMAND LOADER
 * Location: /Handlers/CommandLoader.js
 * Purpose: Scans the /commands folder at the root.
 */

const commands = new Map();

const loadCommands = () => {
    // Points to your specific /commands folder at the root
    const commandsPath = path.join(__dirname, '../commands');
    
    if (!fs.existsSync(commandsPath)) {
        console.log(chalk.red(`[ERROR] Commands folder not found at: ${commandsPath}`));
        return commands;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            // Import the command from the root /commands folder
            const cmd = require(path.join(commandsPath, file));
            
            if (cmd.name) {
                commands.set(cmd.name, cmd);
                
                // Load aliases if defined in the command file
                if (cmd.alias && Array.isArray(cmd.alias)) {
                    cmd.alias.forEach(alias => commands.set(alias, cmd));
                }
            }
        } catch (error) {
            console.log(chalk.red(`[ERROR] Failed to load ${file}:`), error);
        }
    }

    console.log(chalk.green.bold(`📊 System: ${commands.size} Commands Registered.`));
    return commands;
};

module.exports = { loadCommands, commands };




