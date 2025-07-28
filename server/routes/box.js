const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const {
  BOX_CLIENT_ID,
  BOX_CLIENT_SECRET,
  BOX_REDIRECT_URI
} = process.env;

router.post('/webhook', express.json(), (req, res) => {
  const payload = req.body;

  console.log('📦 Box Webhook Received:', JSON.stringify(payload, null, 2));

  // ✅ Send 200 OK to acknowledge receipt
  res.sendStatus(200);
});

router.use(cookieParser());

/**
 * GET /auth/box
 * Redirect user to Box OAuth consent page
 * Accepts ?frontEndUrl=https://your-frontend.com
 */
router.get('/auth/box', (req, res) => {
  const { frontEndUrl } = req.query;

  if (!frontEndUrl) {
    return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
  }

  const state = Math.random().toString(36).substring(2, 15); // Optional CSRF protection

  const authorizeUrl = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${BOX_CLIENT_ID}&redirect_uri=${encodeURIComponent(BOX_REDIRECT_URI)}&state=${state}`;

  res.cookie('frontEndUrl', frontEndUrl, {
    httpOnly: true,
    secure: false,
    maxAge: 10 * 60 * 1000 // 10 mins
  });

  res.redirect(authorizeUrl);
});

/**
 * GET /auth/box/callback
 * Handle OAuth callback and print token, then redirect to frontEndUrl
 */
router.get('/auth/box/callback', async (req, res) => {
  const { code, error } = req.query;
  const frontEndUrl = req.cookies.frontEndUrl;

  if (error) return res.status(400).send('Access denied or OAuth error');
  if (!code) return res.status(400).send('Missing authorization code');
  if (!frontEndUrl) return res.status(400).send('Missing frontEndUrl cookie');

  try {
    const tokenUrl = 'https://api.box.com/oauth2/token';

    const payload = qs.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: BOX_CLIENT_ID,
      client_secret: BOX_CLIENT_SECRET,
      redirect_uri: BOX_REDIRECT_URI
    });

    const tokenResponse = await axios.post(tokenUrl, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    console.log('📦 Box OAuth Tokens:');
    console.log({ access_token, refresh_token, expires_in });

    res.clearCookie('frontEndUrl');
    return res.redirect(frontEndUrl);
  } catch (err) {
    console.error('Box OAuth callback error:', err.response?.data || err.message);
    return res.status(500).send('Token exchange failed');
  }
});

module.exports = router;
