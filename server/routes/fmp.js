const express = require('express');
const axios = require('axios');

const router = express.Router();
// Middleware to handle API key authentication
const authenticateApiKey = (req, res, next) => {
  console.log('Authentication middleware triggered');
  const apiKey = req.headers.authorization;

  if (!apiKey) {
    console.log('No API key provided in headers');
    // For testing purposes, use the API key from .env if available
    if (process.env.SECURITYSCORECARD_API_KEY && process.env.SECURITYSCORECARD_API_KEY !== 'your_api_key_here') {
      console.log('Using API key from .env file');
      req.apiKey = process.env.SECURITYSCORECARD_API_KEY;
      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required'
    });
  }

  // Store the API key for use in the route handlers
  console.log('API key provided in headers');
  req.body.apiKey = apiKey;
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Helper function for FMP requests
const fetchFromFMP = async (url) => {
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return response.data;
};

const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";

// ======================= 1. Get Company Profile =======================
router.get("/company-profile/:symbol", async (req, res, next) => {
  const { symbol } = req.params;
  const { apiKey } = req.body;

  const cleanedApiKey = apiKey ? apiKey.replace("Token ", "") : null;

  if (!symbol || !cleanedApiKey) {
    return res.status(400).json({ message: "symbol and apikey are required" });
  }

  try {
    const url = `${FMP_BASE_URL}/profile/${symbol}?apikey=${cleanedApiKey}`;
    const data = await fetchFromFMP(url);
    res.json(data);
  } catch (error) {
    console.error("❌ Company profile fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch company profile", error: error.message });
    handleApiError(error, res, next);
  }
});

// ======================= 2. Get Stock Quote =======================
router.get("/stock-quote/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { apiKey } = req.body;

  const cleanedApiKey = apiKey ? apiKey.replace("Token ", "") : null;

  if (!symbol || !cleanedApiKey) {
    return res.status(400).json({ message: "symbol and apikey are required" });
  }

  try {
    const url = `${FMP_BASE_URL}/quote/${symbol}?apikey=${cleanedApiKey}`;
    const data = await fetchFromFMP(url);
    res.json(data);
  } catch (error) {
    console.error("❌ Stock quote fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch stock quote", error: error.message });
  }
});

// ======================= 3. Get Income Statement =======================
router.get("/income-statement/:symbol", async (req, res) => {
  const {  limit = 5 } = req.query;
  const { symbol } = req.params;
  const { apiKey } = req.body;

  const cleanedApiKey = apiKey ? apiKey.replace("Token ", "") : null;

  if (!symbol || !cleanedApiKey) {
    return res.status(400).json({ message: "symbol and apikey are required" });
  }

  try {
    const url = `${FMP_BASE_URL}/income-statement/${symbol}?limit=${limit}&apikey=${cleanedApiKey}`;
    const data = await fetchFromFMP(url);
    res.json(data);
  } catch (error) {
    console.error("❌ Income statement fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch income statement", error: error.message });
  }
});

// ======================= 4. Get Historical Price Data =======================
router.get("/historical-price/:symbol", async (req, res) => {
  const { serietype = "line" } = req.query;
  const { symbol } = req.params;
  const { apiKey } = req.body;

  const cleanedApiKey = apiKey ? apiKey.replace("Token ", "") : null;

  if (!symbol || !cleanedApiKey) {
    return res.status(400).json({ message: "symbol and apikey are required" });
  }

  try {
    const url = `${FMP_BASE_URL}/historical-price-full/${symbol}?serietype=${serietype}&apikey=${cleanedApiKey}`;
    const data = await fetchFromFMP(url);
    res.json(data);
  } catch (error) {
    console.error("❌ Historical price fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch historical price data", error: error.message });
  }
});

// ======================= 5. Search Companies =======================
router.get("/search-companies", async (req, res) => {
  const { query, limit = 10, exchange } = req.query;
  const { apiKey } = req.body;

  const cleanedApiKey = apiKey ? apiKey.replace("Token ", "") : null;

  if (!cleanedApiKey) {
    return res.status(400).json({ message: "symbol and apikey are required" });
  }

  try {
    let url = `${FMP_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}&apikey=${cleanedApiKey}`;
    if (exchange) {
      url += `&exchange=${exchange}`;
    }
    const data = await fetchFromFMP(url);
    res.json(data);
  } catch (error) {
    console.error("❌ Search companies fetch error:", error.message);
    res.status(500).json({ message: "Failed to search companies", error: error.message });
  }
});

module.exports = router;
