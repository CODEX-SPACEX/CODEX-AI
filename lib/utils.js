const moment = require('moment-timezone');

class Utils {
    static formatTime() {
        return moment().tz('Africa/Lagos').format('HH:mm:ss');
    }

    static formatDate() {
        return moment().tz('Africa/Lagos').format('DD/MM/YYYY');
    }

    // Fixed the SyntaxError and logic here
    static isUrl(text) {
        return /(https?:\/\/[^\s]+)/g.test(text);
    }

    // If you need the socket, it usually shouldn't be in a static utility class 
    // unless passed as an argument, but let's keep your structure clean:
    getSocket() {
        return this.sock;
    }
}

// Fixed: You were exporting 'Connection', but the class name is 'Utils'
module.exports = Utils;
