
const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

/**
 * 🪐 CODEX-AI WEB SCRAPER ENGINE
 * Location: /Library/scrappers.js
 */

/**
 * TikTok Downloader (No Watermark)
 */
async function tiktok(url) {
    try {
        const response = await axios.post('https://www.tikwm.com/api/', qs.stringify({ url: url, count: 12, cursor: 0, web: 1 }));
        if (!response.data.data) throw new Error("Video not found");
        return {
            title: response.data.data.title,
            cover: response.data.data.cover,
            video: response.data.data.play,
            audio: response.data.data.music
        };
    } catch (e) {
        return { error: true, msg: e.message };
    }
}

/**
 * Instagram Downloader
 */
async function igdl(url) {
    try {
        let res = await axios.post("https://saveig.app/api/ajaxSearch", qs.stringify({ q: url, t: "media", lang: "en" }));
        let $ = cheerio.load(res.data.data);
        let result = [];
        $('.download-items__btn a').each((i, e) => {
            let link = $(e).attr('href');
            if (link) result.push(link);
        });
        return result;
    } catch (e) {
        return { error: true, msg: e.message };
    }
}

/**
 * YouTube Search (Simple & Fast)
 */
async function yts(query) {
    try {
        let res = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
        let html = res.data;
        let results = [];
        let regex = /"videoRenderer":{"videoId":"(.*?)","thumbnail":{"thumbnails":\[{"url":"(.*?)".*?"title":{"runs":\[{"text":"(.*?)"\].*?"longBylineText":{"runs":\[{"text":"(.*?)"/g;
        let match;
        while ((match = regex.exec(html)) !== null && results.length < 5) {
            results.push({
                videoId: match[1],
                url: `https://www.youtube.com/watch?v=${match[1]}`,
                thumbnail: match[2],
                title: match[3],
                author: match[4]
            });
        }
        return results;
    } catch (e) {
        return [];
    }
}

/**
 * Google Search Scraper
 */
async function googleIt(query) {
    try {
        const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('.tF2Cxc').each((i, el) => {
            results.push({
                title: $(el).find('h3').text(),
                link: $(el).find('a').attr('href'),
                snippet: $(el).find('.VwiC3b').text()
            });
        });
        return results;
    } catch (e) {
        return [];
    }
}

module.exports = {
    tiktok,
    igdl,
    yts,
    googleIt
};




