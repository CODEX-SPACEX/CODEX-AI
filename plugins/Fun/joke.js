const axios = require('axios');

module.exports = {
    command: 'joke',
    desc: 'Get a random joke',
    category: 'fun',
    async execute({ reply }) {
        try {
            const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
            const joke = response.data;
            
            return reply(`😂 *${joke.setup}*\n\n${joke.punchline}`);
        } catch (err) {
            return reply('❌ Failed to fetch joke');
        }
    }
};
