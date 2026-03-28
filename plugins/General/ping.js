module.exports = {
    command: 'ping',
    desc: 'Check bot response time',
    category: 'general',
    async execute({ sock, msg, jid, reply }) {
        const start = Date.now();
        const sent = await reply('🏓 Pinging...');
        const end = Date.now();
        const latency = end - start;
        
        await sock.sendMessage(jid, {
            edit: sent.key,
            text: `🏓 *Pong!*\nLatency: ${latency}ms`
        });
    }
};
