const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const {
    EGNYTE_CLIENT_ID,
    EGNYTE_CLIENT_SECRET,
    EGNYTE_REDIRECT_URI,
} = process.env;

router.use(cookieParser());

/**
 * GET /auth/egnyte
 * Redirect user to Egnyte OAuth consent page
 * Accepts ?subdomain=sakthi333&frontEndUrl=https://your-frontend.com
 */
router.get('/auth/egnyte', (req, res) => {
    const { subdomain, frontEndUrl } = req.query;

    if (!subdomain) {
        return res.status(400).json({ error: 'Missing subdomain in query params' });
    }

    if (!frontEndUrl) {
        return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
    }

    const state = Math.random().toString(36).substring(2, 15); // Optional CSRF protection

    const authorizeUrl = `https://${subdomain}.egnyte.com/puboauth/authorize?response_type=code&client_id=${EGNYTE_CLIENT_ID}&redirect_uri=${encodeURIComponent(EGNYTE_REDIRECT_URI)}&state=${state}`;

    // Save both subdomain and frontend URL in cookies
    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000
    });

    res.cookie('egnyteSubdomain', subdomain, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000
    });

    res.redirect(authorizeUrl);
});


router.get('/auth/egnyte/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontEndUrl = req.cookies.frontEndUrl;
    const subdomain = req.cookies.egnyteSubdomain;

    if (error) return res.status(400).send('Access denied or OAuth error');
    if (!code) return res.status(400).send('Missing authorization code');
    if (!frontEndUrl || !subdomain) return res.status(400).send('Missing cookies');

    try {
        const tokenUrl = `https://${subdomain}.egnyte.com/puboauth/token`;

        const payload = qs.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: EGNYTE_CLIENT_ID,
            client_secret: EGNYTE_CLIENT_SECRET,
            redirect_uri: EGNYTE_REDIRECT_URI
        });

        const tokenResponse = await axios.post(tokenUrl, payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('📁 Egnyte OAuth Tokens:');
        console.log({ access_token, refresh_token, expires_in });

        res.clearCookie('frontEndUrl');
        res.clearCookie('egnyteSubdomain');

        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}`;
        return res.redirect(redirectWithTokens);
    } catch (err) {
        console.error('Egnyte OAuth callback error:', err.response?.data || err.message);
        return res.status(500).send('Token exchange failed');
    }
});


module.exports = router;
