const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const {
    SF_CLIENT_ID,
    SF_CLIENT_SECRET,
    SF_REDIRECT_URI
} = process.env;

router.use(cookieParser());

// Helper function to make requests to Salesforce API
const fetchFromSalesforce = async (url, token) => {
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    return response.data;
};

/**
 * GET /auth/salesforce
 * Redirect user to Salesforce OAuth consent page
 * Accepts ?frontEndUrl=https://your-frontend.com
 */
router.get('/auth/salesforce', (req, res) => {
    const { frontEndUrl } = req.query;

    if (!frontEndUrl) {
        return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
    }

    const authorizeUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${SF_CLIENT_ID}&redirect_uri=${encodeURIComponent(SF_REDIRECT_URI)}&scope=full`;

    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000 // 10 mins
    });

    res.redirect(authorizeUrl);
});

/**
 * GET /auth/callback
 * Handle OAuth callback and exchange code for token, then redirect to frontEndUrl
 */
router.get('/auth/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontEndUrl = req.cookies.frontEndUrl;

    if (error) return res.status(400).send(`Access denied or OAuth error: ${error}`);
    if (!code) return res.status(400).send('Missing authorization code');
    if (!frontEndUrl) return res.status(400).send('Missing frontEndUrl cookie');

    try {
        const tokenUrl = 'https://login.salesforce.com/services/oauth2/token';

        const payload = qs.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: SF_CLIENT_ID,
            client_secret: SF_CLIENT_SECRET,
            redirect_uri: SF_REDIRECT_URI
        });

        const tokenResponse = await axios.post(tokenUrl, payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, instance_url, id, token_type } = tokenResponse.data;

        console.log('🔑 Salesforce Access Token:');
        console.log({ access_token });

        res.clearCookie('frontEndUrl');
        // Redirect to frontend with tokens
        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}&instance_url=${encodeURIComponent(instance_url)}`;

        return res.redirect(redirectWithTokens);
    } catch (err) {
        console.error('Salesforce OAuth callback error:', err.response?.data || err.message);
        return res.status(500).send('Token exchange failed');
    }
});

// Get User Info
router.get('/salesforce/user', async (req, res) => {
    const { token, instanceUrl } = req.query;

    if (!token || !instanceUrl) {
        return res.status(400).json({ message: "token and instanceUrl are required" });
    }

    try {
        // The /services/data/vXX.X/chatter/users/me endpoint returns info about the current user
        const data = await fetchFromSalesforce(`${instanceUrl}/services/data/v56.0/chatter/users/me`, token);
        res.json(data);
    } catch (error) {
        console.error("❌ Salesforce user fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch user info", error: error.message });
    }
});

// Get Accounts
router.get('/salesforce/accounts', async (req, res) => {
    const { token, instanceUrl } = req.query;

    if (!token || !instanceUrl) {
        return res.status(400).json({ message: "token and instanceUrl are required" });
    }

    try {
        // Query for accounts using SOQL
        const data = await fetchFromSalesforce(
            `${instanceUrl}/services/data/v56.0/query?q=${encodeURIComponent('SELECT Id, Name, Type, Industry, Phone FROM Account LIMIT 10')}`, 
            token
        );
        res.json(data);
    } catch (error) {
        console.error("❌ Salesforce accounts fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch accounts", error: error.message });
    }
});

// Get Contacts
router.get('/salesforce/contacts', async (req, res) => {
    const { token, instanceUrl } = req.query;

    if (!token || !instanceUrl) {
        return res.status(400).json({ message: "token and instanceUrl are required" });
    }

    try {
        // Query for contacts using SOQL
        const data = await fetchFromSalesforce(
            `${instanceUrl}/services/data/v61.0/query?q=SELECT+Id,FirstName,LastName,Email,CreatedDate+FROM+Contact+ORDER+BY+CreatedDate+DESC+LIMIT+10`, 
            token
        );
        res.json(data);
    } catch (error) {
        console.error("❌ Salesforce contacts fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch contacts", error: error.message });
    }
});

module.exports = router;
