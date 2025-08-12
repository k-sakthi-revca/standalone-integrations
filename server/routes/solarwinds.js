const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

router.post('/webhook', express.json(), (req, res) => {
    const payload = req.body;

    console.log('📦 Solarwinds Webhook Received:', JSON.stringify(payload, null, 2));

    // ✅ Send 200 OK to acknowledge receipt
    res.sendStatus(200);
});

module.exports = router;
