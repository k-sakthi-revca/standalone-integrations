const express = require('express');
const axios = require('axios');
const router = express.Router();

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
