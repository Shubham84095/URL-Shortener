const generateShortId = require('ssid');
const URL = require('../models/url')

async function handleGenerateNewShortUrl(req, res){
    const body = req.body;
    if(!body.url) return res.status(400).json({error: "URL is required"})
    const shortID = generateShortId(8);
    await URL.create({
        shortID : shortID,
        redirectURL: body.url,
        viewHistory: [],
        createdBy: req.user._id,
    })

    return res.render("home", {
        id: shortID,
    });
}

async function handleGetAnalytics(req, res){
    const id = req.params.id;
    const entry = await URL.findOne({shortID: id});
    return res.json({
        TotalClicks : entry.viewHistory.length,
        analytics : entry.viewHistory 
    })
}

module.exports = {
    handleGenerateNewShortUrl,
    handleGetAnalytics
}