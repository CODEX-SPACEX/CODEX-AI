const moment = require('moment-timezone');

class Utils {
    static formatTime() {
        return moment().tz('Africa/Lagos').format('HH:mm:ss');
    }

    static formatDate() {
        return moment().tz('Africa/Lagos').format('DD/MM/YYYY');
    }

    static isUrl(text) {
        return /(https?:\/\/[^\s]+)/g this.sock;
    }

    getSocket() {
        return this.sock;
    }
}

module.exports = Connection;

