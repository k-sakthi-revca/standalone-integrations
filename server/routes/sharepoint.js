const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const {
    MS_CLIENT_ID,
    MS_CLIENT_SECRET,
    MS_REDIRECT_URI,
    MS_SCOPES
} = process.env;

router.use(cookieParser());

// Helper function to make requests to Microsoft Graph API
const fetchFromSharepoint = async (url, token) => {
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    return response.data;
};

/**
 * GET /auth/sharepoint
 * Redirect user to Microsoft login consent screen
 * Accepts ?frontEndUrl=https://your-frontend.com
 */
router.get('/auth/sharepoint', (req, res) => {
    const { frontEndUrl } = req.query;
    if (!frontEndUrl) {
        return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
    }

    const authorizeUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${MS_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(MS_REDIRECT_URI)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent(MS_SCOPES)}`;

    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000 // 10 mins
    });

    res.redirect(authorizeUrl);
});

/**
 * GET /auth/sharepoint/callback
 * Handle OAuth callback, exchange code for token, then redirect to frontend
 */
router.get('/auth/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontEndUrl = req.cookies.frontEndUrl;

    if (error) return res.status(400).send(`Access denied or OAuth error: ${error}`);
    if (!code) return res.status(400).send('Missing authorization code');
    if (!frontEndUrl) return res.status(400).send('Missing frontEndUrl cookie');

    try {
        const tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;

        const payload = qs.stringify({
            client_id: MS_CLIENT_ID,
            scope:MS_SCOPES,
            code,
            redirect_uri: MS_REDIRECT_URI,
            grant_type: 'authorization_code',
            client_secret: MS_CLIENT_SECRET
        });

        const tokenResponse = await axios.post(tokenUrl, payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('🔑 Microsoft Access Token:', access_token);

        res.clearCookie('frontEndUrl');
        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;

        return res.redirect(redirectWithTokens);
    } catch (err) {
        console.error('Microsoft OAuth callback error:', err.response?.data || err.message);
        return res.status(500).send('Token exchange failed');
    }
});

// Get User Info
router.get('/sharepoint/user', async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromSharepoint('https://graph.microsoft.com/v1.0/me', token);
        res.json(data);
    } catch (error) {
        console.error("❌ Sharepoint user fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch user info", error: error.message });
    }
});

// Get Sites
router.get('/sharepoint/sites', async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromSharepoint('https://graph.microsoft.com/v1.0/sites?search=*', token);
        res.json(data);
    } catch (error) {
        console.error("❌ Sharepoint sites fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch sites", error: error.message });
    }
});

// Get Lists for a specific site
router.get('/sharepoint/sites/:siteId/lists', async (req, res) => {
    const { token } = req.query;
    const { siteId } = req.params;

    if (!token) return res.status(400).json({ message: "token is required" });
    if (!siteId) return res.status(400).json({ message: "siteId is required" });

    try {
        const data = await fetchFromSharepoint(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists`, token);
        res.json(data);
    } catch (error) {
        console.error("❌ Sharepoint lists fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch lists", error: error.message });
    }
});

// Get List Items for a specific list
router.get('/sharepoint/sites/:siteId/lists/:listId/items', async (req, res) => {
    const { token } = req.query;
    const { siteId, listId } = req.params;

    if (!token) return res.status(400).json({ message: "token is required" });
    if (!siteId) return res.status(400).json({ message: "siteId is required" });
    if (!listId) return res.status(400).json({ message: "listId is required" });

    try {
        const data = await fetchFromSharepoint(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?expand=fields`, token);
        res.json(data);
    } catch (error) {
        console.error("❌ Sharepoint list items fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch list items", error: error.message });
    }
});

module.exports = router;
