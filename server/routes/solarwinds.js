const express = require('express');
const axios = require('axios');

const router = express.Router();

// Middleware to handle API key authentication
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization;
  const baseUrl = req.headers['x-base-url']; // Pass base URL in headers

  if (!apiKey || !baseUrl) {
    return res.status(400).json({
      error: 'Missing Required Headers',
      message: 'Authorization (API key) and X-Base-URL are required'
    });
  }

  req.apiKey = apiKey.replace("Bearer ", "").trim();
  req.baseUrl = baseUrl.trim();
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Helper function for SolarWinds requests
const fetchFromSolarWinds = async (url, apiKey) => {
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response.data;
};

/**
 * ======================= 1. GET Alerts =======================
 * Example: GET /alerts
 */
router.get("/alerts", async (req, res) => {
  const { baseUrl, apiKey } = req;
  try {
    const url = `${baseUrl}/v1/alerts`;
    const data = await fetchFromSolarWinds(url, apiKey);
    res.json(data);
  } catch (error) {
    console.error("❌ Alerts fetch error:", error.message);
    res.status(error.response?.status || 500).json({
      message: "Failed to fetch alerts",
      error: error.response?.data || error.message
    });
  }
});

/**
 * ======================= 2. GET Metrics =======================
 * Example: GET /metrics
 */
router.get("/metrics", async (req, res) => {
  const { baseUrl, apiKey } = req;
  try {
    const url = `${baseUrl}/v1/metrics`;
    const data = await fetchFromSolarWinds(url, apiKey);
    res.json(data);
  } catch (error) {
    console.error("❌ Metrics fetch error:", error.message);
    res.status(error.response?.status || 500).json({
      message: "Failed to fetch metrics",
      error: error.response?.data || error.message
    });
  }
});

router.post('/webhook', express.json(), (req, res) => {
    const payload = req.body;

    console.log('📦 Solarwinds Webhook Received:', JSON.stringify(payload, null, 2));

    // ✅ Send 200 OK to acknowledge receipt
    res.sendStatus(200);
});

module.exports = router;
