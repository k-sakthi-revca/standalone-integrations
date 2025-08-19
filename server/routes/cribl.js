const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * POST /auth/cribl
 * Body: { clientId: string, clientSecret: string, baseUrl: string }
 */
router.post("/auth/cribl", async (req, res) => {
  const { clientId, clientSecret, baseUrl } = req.body;

  if (!clientId || !clientSecret || !baseUrl) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "clientId, clientSecret, and baseUrl are required"
    });
  }

  try {
    const tokenUrl = `https://login.cribl.cloud/oauth/token`;

    const response = await axios.post(tokenUrl, {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      audience: "https://api.cribl.cloud"
    }, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
      token_type: response.data.token_type
    });

  } catch (error) {
    console.error("❌ Token fetch error:", error.message);
    res.status(error.response?.status || 500).json({
      message: "Failed to get access token",
      error: error.response?.data || error.message
    });
  }
});


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

// Helper function for Cribl requests
const fetchFromCribl = async (url, apiKey) => {
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
 * ======================= 1. GET Workers =======================
 * Example: GET /workers
 */
router.get("/workers", async (req, res) => {
  const { baseUrl, apiKey } = req;
  try {
    const url = `${baseUrl}/api/v1/master/workers`;
    const data = await fetchFromCribl(url, apiKey);
    res.json(data);
  } catch (error) {
    console.error("❌ Workers fetch error:", error.message);
    res.status(error.response?.status || 500).json({
      message: "Failed to fetch workers",
      error: error.response?.data || error.message
    });
  }
});

/**
 * ======================= 2. GET Worker by GUID =======================
 * Example: GET /workers/:guid
 */
router.get("/worker/:guid", async (req, res) => {
  const { baseUrl, apiKey } = req;
  const { guid } = req.params;
  try {
    const url = `${baseUrl}/api/v1/master/workers/${guid}`;
    const data = await fetchFromCribl(url, apiKey);
    res.json(data);
  } catch (error) {
    console.error(`❌ Worker (${guid}) fetch error:`, error.message);
    res.status(error.response?.status || 500).json({
      message: `Failed to fetch worker with GUID: ${guid}`,
      error: error.response?.data || error.message
    });
  }
});

router.post("/logs", (req, res) => {
  console.log("📥 Headers:", req.headers);

  let raw = req.body; // since express.raw() gives Buffer
  console.log("📥 Raw Body:", raw);

  let logs;

  try {
    // Try NDJSON (newline-delimited JSON)
    logs = raw
      .trim()
      .split("\n")
      .map(line => JSON.parse(line));
  } catch (err) {
    // If parsing fails, just keep it as raw string
    logs = raw;
  }

  console.log("✅ Parsed Logs:", logs);
  res.status(200).json({ success: true });
});


module.exports = router;
