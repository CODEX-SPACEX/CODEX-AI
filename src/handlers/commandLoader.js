
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * 🪐 CODEX-AI COMMAND LOADER
 * Scans /commands folder at the ROOT of the project (not inside /src)
 */

const commands = new Map();

const loadCommands = () => {
    // Correct path: go up from /src/handlers to root, then into /commands
    const commandsPath = path.join(__dirname, '../../commands');

    if (!fs.existsSync(commandsPath)) {
        console.log(chalk.red(`[ERROR] Commands folder not found at: ${commandsPath}`));
        return commands;
    }

    // Recursively scan all subfolders (Bot/, Ai/, Fun/, etc.)
    const scanDir = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                scanDir(fullPath); // Go into subfolders
            } else if (item.endsWith('.js')) {
                try {
                    // Clear cache so hot-reload works
                    delete require.cache[require.resolve(fullPath)];
                    const cmd = require(fullPath);

                    if (cmd.name) {
                        commands.set(cmd.name.toLowerCase(), cmd);
                        if (cmd.alias && Array.isArray(cmd.alias)) {
                            cmd.alias.forEach(alias => commands.set(alias.toLowerCase(), cmd));
                        }
                        console.log(chalk.cyan(`  ✓ Loaded: ${cmd.name}`));
                    }
                } catch (error) {
                    console.log(chalk.red(`[ERROR] Failed to load ${item}:`), error.message);
                }
            }
        }
    };

    scanDir(commandsPath);
    console.log(chalk.green.bold(`\n📊 CODEX-AI: ${commands.size} Commands Loaded.\n`));
    return commands;
};

module.exports = { loadCommands, commands };
