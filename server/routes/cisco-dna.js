const express = require("express");
const axios = require("axios");
const router = express.Router();

// ⚠️ Allow self-signed certs for local testing (DNAC often uses them)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ========== 1. Route to get DNAC token ==========
router.post("/dna/token", async (req, res) => {
  const { baseUrl, username, password } = req.body;

  if (!baseUrl || !username || !password) {
    return res.status(400).json({ message: "baseUrl, username, and password are required" });
  }

  try {
    const response = await axios.post(
      `${baseUrl}/dna/system/api/v1/auth/token`,
      {},
      {
        auth: {
          username,
          password,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const token = response.data.Token;
    console.log("✅ Token fetched from:", baseUrl);
    res.json({ token, baseUrl });
  } catch (error) {
    console.error("❌ Token error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch token", error: error.message });
  }
});

// Helper function to make requests
const fetchFromDNAC = async (url, token) => {
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Auth-Token": token,
    },
  });
  return response.data;
};

// ========== 2. Route to fetch network devices ==========
router.get("/network-devices", async (req, res) => {
  // Get parameters from query params or body
  const baseUrl = req.query.baseUrl || (req.body && req.body.baseUrl);
  const token = req.query.token || (req.body && req.body.token);

  if (!baseUrl || !token) {
    return res.status(400).json({ message: "baseUrl and token are required" });
  }

  try {
    const data = await fetchFromDNAC(`${baseUrl}/dna/intent/api/v1/network-device`, token);
    res.json(data);
  } catch (error) {
    console.error("❌ Device fetch error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch network devices", error: error.message });
  }
});

// Global Issues
router.get('/global-issues', async (req, res) => {
  const { baseUrl, token } = req.query;
  try {
    const data = await fetchFromDNAC(`${baseUrl}/dna/intent/api/v1/issues`, token);
    res.json(data);
  } catch (error) {
    console.error("❌ Issues fetch error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch issues", error: error.message });
  }
});

// Event Logs
router.get('/event-logs', async (req, res) => {
  const { baseUrl, token } = req.query;
  try {
    const data = await fetchFromDNAC(`${baseUrl}/dna/intent/api/v1/event/event-series`, token);
    res.json(data);
  } catch (error) {
    console.error("❌ Event logs fetch error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch event logs", error: error.message });
  }
});

// Network Health
router.get('/network-health', async (req, res) => {
  const { baseUrl, token } = req.query;
  try {
    const data = await fetchFromDNAC(`${baseUrl}/dna/intent/api/v1/network-health`, token);
    res.json(data);
  } catch (error) {
    console.error("❌ Network health fetch error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch network health", error: error.message });
  }
});

// Site Health
router.get('/site-health', async (req, res) => {
  const { baseUrl, token } = req.query;
  try {
    const data = await fetchFromDNAC(`${baseUrl}/dna/intent/api/v1/site-health`, token);
    res.json(data);
  } catch (error) {
    console.error("❌ Site health fetch error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch site health", error: error.message });
  }
});

// Device Interface Details
router.get('/device-interfaces', async (req, res) => {
  const { baseUrl, token } = req.query;
  try {
    const data = await fetchFromDNAC(`${baseUrl}/dna/intent/api/v1/interface`, token);
    res.json(data);
  } catch (error) {
    console.error("❌ Interface fetch error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch device interfaces", error: error.message });
  }
});

module.exports = router;
