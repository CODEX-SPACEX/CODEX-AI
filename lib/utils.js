const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class Utils {
    static formatTime() {
        return moment().tz('Africa/Lagos').format('HH:mm:ss');
    }

    static formatDate() {
        return moment().tz('Africa/Lagos').format('DD/MM/YYYY');
    }

    static isUrl(text) {
        return /(https?:\/\/[^\s]+)/g.test(text);
    }

    /**
     * 📂 THE PLUGIN LOADER
     * This function goes into every folder in /plugins and loads the files.
     */
    static loadPlugins(directory) {
        const items = fs.readdirSync(directory);

        for (const item of items) {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // If it's a folder, dive deeper
                Utils.loadPlugins(fullPath);
            } else if (item.endsWith('.js')) {
                try {
                    // Clear cache for hot-reloading
                    delete require.cache[require.resolve(fullPath)];
                    const plugin = require(fullPath);
                    
                    // Use filename as the command name (ping.js -> ping)
                    const cmdName = item.split('.')[0];
                    global.plugins.set(cmdName, plugin);
                } catch (e) {
                    console.log(chalk.red(`❌ Failed to load plugin: ${item} | ${e.message}`));
                }
            }
        }
    }
}

module.exports = Utils;
