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

// ========== 2. Route to fetch network devices ==========
router.post("/dna/network-devices", async (req, res) => {
  const { baseUrl, token } = req.body;

  if (!baseUrl || !token) {
    return res.status(400).json({ message: "baseUrl and token are required" });
  }

  try {
    const deviceResponse = await axios.get(
      `${baseUrl}/dna/intent/api/v1/network-device`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Auth-Token": token,
        },
      }
    );

    console.log("📡 Device data fetched from:", baseUrl);
    res.json(deviceResponse.data);
  } catch (error) {
    console.error("❌ Device fetch error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch network devices", error: error.message });
  }
});

module.exports = router;
