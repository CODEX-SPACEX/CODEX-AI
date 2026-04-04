
/**
 * 🪐 CODEX-AI FRONTEND ENGINE
 * Location: /Public/script.js
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('CODEX-AI Dashboard Linked.');

    // 1. SET START TIME (For Uptime calculation)
    // In a real scenario, you can fetch this from your API
    const startTime = Date.now();

    /**
     * Update Uptime Counter
     */
    function updateUptime() {
        const now = Date.now();
        const diff = now - startTime;

        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        
        // If you add an element with id="uptime" in your HTML, this will update it
        const uptimeElement = document.getElementById('runtime-clock');
        if (uptimeElement) {
            uptimeElement.innerText = uptimeString;
        }
    }

    /**
     * Simple Ping Check
     * Simulates a check to see if the bot's internal API is alive
     */
    async function checkSystemStatus() {
        const indicator = document.querySelector('.dot');
        const statusText = document.querySelector('.status-box');

        try {
            // This assumes your bot has a health-check route
            // For now, we simulate a successful connection
            const isOnline = true; 

            if (isOnline) {
                indicator.style.backgroundColor = '#00ff7f';
                indicator.style.boxShadow = '0 0 10px #00ff7f';
            }
        } catch (error) {
            indicator.style.backgroundColor = '#ff4b2b';
            indicator.style.boxShadow = '0 0 10px #ff4b2b';
            if (statusText) statusText.innerText = 'SYSTEMS OFFLINE';
        }
    }

    // Initialize
    setInterval(updateUptime, 1000);
    checkSystemStatus();
});





