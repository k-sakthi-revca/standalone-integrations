const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const {
  MERAKI_CLIENT_ID,
  MERAKI_CLIENT_SECRET,
  MERAKI_REDIRECT_URI,
  MERAKI_SCOPES
} = process.env;

// Required to handle cookies
router.use(cookieParser());

/**
 * GET /auth/meraki
 * Redirect user to Cisco Meraki OAuth consent page
 * Accepts ?frontEndUrl=https://your-frontend.com
 */
router.get('/auth/meraki', (req, res) => {
  const { frontEndUrl } = req.query;

  if (!frontEndUrl) {
    return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
  }

  const state = Math.random().toString(36).substring(2, 15); // Optional CSRF protection
  const authorizeUrl = `https://as.meraki.com/oauth/authorize?response_type=code&client_id=${MERAKI_CLIENT_ID}&redirect_uri=${encodeURIComponent(MERAKI_REDIRECT_URI)}&scope=${encodeURIComponent(MERAKI_SCOPES)}&state=${state}`;

  // Set cookie for redirect after callback
  res.cookie('frontEndUrl', frontEndUrl, {
    httpOnly: true,
    secure: false, // set true in production with HTTPS
    maxAge: 10 * 60 * 1000 // 10 mins
  });

  res.redirect(authorizeUrl);
});

/**
 * GET /auth/meraki/callback
 * Handle OAuth callback and print token, then redirect to frontEndUrl
 */
router.get('/meraki/callback', async (req, res) => {
  console.log("here")
  const { code, error } = req.query;
  const frontEndUrl = req.cookies.frontEndUrl;
  console.log("frontEndUrl",frontEndUrl)

  if (error) {
    return res.status(400).send('Access denied or OAuth error');
  }

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  if (!frontEndUrl) {
    return res.status(400).send('Missing frontEndUrl cookie');
  }

  try {
    const tokenUrl = 'https://as.meraki.com/oauth/token';

    const payload = qs.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: MERAKI_REDIRECT_URI,
      scope: MERAKI_SCOPES
    });

    const tokenResponse = await axios.post(tokenUrl, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: MERAKI_CLIENT_ID,
        password: MERAKI_CLIENT_SECRET
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // ✅ Just print tokens (not sending to client)
    console.log('Meraki OAuth Tokens:');
    console.log({ access_token, refresh_token, expires_in });

    // ✅ Clear the cookie and redirect to frontend
    res.clearCookie('frontEndUrl');
    return res.redirect(frontEndUrl);
  } catch (err) {
    console.error('OAuth callback error:', err.response?.data || err.message);
    return res.status(500).send('Token exchange failed');
  }
});

// Middleware to handle API key authentication
const authenticateApiKey = (req, res, next) => {
  console.log('Meraki Authentication middleware triggered');
  const apiKey = req.headers['x-cisco-meraki-api-key'];
  
  if (!apiKey) {
    console.log('No API key provided');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required'
    });
  }
  
  // Store the API key for use in the route handlers
  console.log('API key provided');
  req.body.apiKey = apiKey;
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Store the base URI from the request
router.use((req, res, next) => {
  // Get the base URI from the request headers or query parameters
  const baseUri = req.headers['x-meraki-base-uri'] || req.query.baseUri;
  
  if (!baseUri) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Base URI is required'
    });
  }
  
  req.baseUri = baseUri;
  next();
});

/**
 * GET /organizations
 * Get all Organizations
 */
router.get('/organizations', async (req, res, next) => {
  console.log('GET /organizations route triggered');
  try {
    console.log('Attempting to fetch data from Meraki API');
    console.log(req.query);
    console.log(req.body);
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId
 * Get a Organization
 */
router.get('/organizations/:organizationId', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/devices
 * Get Organization devices
 */
router.get('/organizations/:organizationId/devices', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/devices`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/actionBatches
 * Get Organization actionBatches
 */
router.get('/organizations/:organizationId/actionBatches', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/actionBatches`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/actionBatches/:actionBatchId
 * Get Organization actionBatche with Id
 */
router.get('/organizations/:organizationId/actionBatches/:actionBatchId', async (req, res, next) => {
  try {
    const { organizationId, actionBatchId } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/actionBatches/${actionBatchId}`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /devices/:serial
 * Get a specific device
 */
router.get('/devices/:serial', async (req, res, next) => {
  try {
    const { serial } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/devices/${serial}`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/networks
 * Get Organization networks
 */
router.get('/organizations/:organizationId/networks', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/networks`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /networks/:networkId
 * Get a specific network
 */
router.get('/networks/:networkId', async (req, res, next) => {
  try {
    const { networkId } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/networks/${networkId}`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/{organizationId}/alerts/profiles
 * Get Organization Alerts Profiles
 */
router.get('/organizations/:organizationId/alerts/profiles', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/alerts/profiles`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /networks/{networkId}/alerts/settings
 * Get Network Alerts Settings
 */
router.get('/networks/:networkId/alerts/settings', async (req, res, next) => {
  try {
    const { networkId } = req.params;
    
    // Make API call to Meraki
    const response = await axios.get(`${req.query.baseUri}/api/v1/networks/${networkId}/alerts/settings`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });
    
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/assurance/alerts
 * Get Organization Assurance Alerts
 */
router.get('/organizations/:organizationId/assurance/alerts', async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/assurance/alerts`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/assurance/alerts/overview
 * Get Organization Assurance Alerts Overview
 */
router.get('/organizations/:organizationId/assurance/alerts/overview', async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/assurance/alerts/overview`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/assurance/alerts/overview/byNetwork
 * Get Organization Assurance Alerts Overview By Network
 */
router.get('/organizations/:organizationId/assurance/alerts/overview/byNetwork', async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/assurance/alerts/overview/byNetwork`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/brandingPolicies
 * Get Organization Branding Policies
 */
router.get('/organizations/:organizationId/brandingPolicies', async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/brandingPolicies`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/brandingPolicies/:brandingPolicyId
 * Get Organization Branding Policy
 */
router.get('/organizations/:organizationId/brandingPolicies/:brandingPolicyId', async (req, res, next) => {
  try {
    const { organizationId, brandingPolicyId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/brandingPolicies/${brandingPolicyId}`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/brandingPolicies/priorities
 * Get Organization Branding Policies Priorities
 */
router.get('/organizations/:organizationId/brandingPolicies/priorities', async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/brandingPolicies/priorities`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /devices/:serial/cellular/sims
 * Get Device Cellular Sims
 */
router.get('/devices/:serial/cellular/sims', async (req, res, next) => {
  try {
    const { serial } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/devices/${serial}/cellular/sims`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/clients/search
 * Get Organization Clients Search
 */
router.get('/organizations/:organizationId/clients/search', async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const queryParams = req.query;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/clients/search`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      },
      params: queryParams
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /networks/:networkId/clients/:clientId/policy
 * Get Network Client Policy
 */
router.get('/networks/:networkId/clients/:clientId/policy', async (req, res, next) => {
  try {
    const { networkId, clientId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/networks/${networkId}/clients/${clientId}/policy`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/licenses
 * Get Organization Licenses
 */
router.get('/organizations/:organizationId/licenses', async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/licenses`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/licenses/:licenseId
 * Get Organization License
 */
router.get('/organizations/:organizationId/licenses/:licenseId', async (req, res, next) => {
  try {
    const { organizationId, licenseId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/licenses/${licenseId}`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /organizations/:organizationId/loginSecurity
 * Get Organization Login Security
 */
router.get('/organizations/:organizationId/loginSecurity', async (req, res, next) => {
  try {
    const { organizationId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/organizations/${organizationId}/loginSecurity`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /networks/:networkId/trafficAnalysis
 * Get Network Traffic Analysis
 */
router.get('/networks/:networkId/trafficAnalysis', async (req, res, next) => {
  try {
    const { networkId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/networks/${networkId}/trafficAnalysis`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /networks/:networkId/syslogServers
 * Get Network Syslog Servers
 */
router.get('/networks/:networkId/syslogServers', async (req, res, next) => {
  try {
    const { networkId } = req.params;

    const response = await axios.get(`${req.query.baseUri}/api/v1/networks/${networkId}/syslogServers`, {
      headers: {
        'Accept': 'application/json',
        'X-Cisco-Meraki-API-Key': req.body.apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});


// Helper function to handle API errors
function handleApiError(error, res, next) {
  console.log('Error occurred while making API request:');
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log('Error response status:', error.response.status);
    console.log('Error response data:', error.response.data);
    
    return res.status(error.response.status).json({
      error: error.response.statusText,
      message: error.response.data.message || 'An error occurred with the Meraki API',
      details: error.response.data
    });
  } else if (error.request) {
    // The request was made but no response was received
    console.log('No response received from API');
    console.log('Request details:', error.request);
    
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'No response received from Meraki API'
    });
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error setting up request:', error.message);
    next(error);
  }
}

module.exports = router;
