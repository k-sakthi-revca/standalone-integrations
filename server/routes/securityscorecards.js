const express = require('express');
const axios = require('axios');
const router = express.Router();

// SecurityScorecard API base URL
const BASE_URL = 'https://api.securityscorecard.io';

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
  req.apiKey = apiKey;
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

/**
 * GET /portfolios
 * Retrieve all portfolios
 */
router.get('/portfolios', async (req, res, next) => {
  console.log('GET /portfolios route triggered');
  try {
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    console.log('USE_MOCK_DATA env variable:', process.env.USE_MOCK_DATA);
    console.log('useMockData:', useMockData);
    
    if (useMockData) {
      // Return mock data
      console.log('Returning mock data');
      return res.json(generateMockPortfolios());
    }
    
    console.log('Attempting to fetch real data from SecurityScorecard API');
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/portfolios`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': req.apiKey
      }
    });
    console.log("got data",response.data)
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, next);
  }
});

/**
 * GET /portfolios/:portfolioId/companies
 * Retrieve companies in a specific portfolio
 */
router.get('/portfolios/:portfolioId/companies', async (req, res, next) => {
  try {
    const { portfolioId } = req.params;
    
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Return mock data
      return res.json(generateMockPortfolioCompanies(portfolioId));
    }
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/portfolios/${portfolioId}/companies`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': req.apiKey
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
      message: error.response.data.message || 'An error occurred with the SecurityScorecard API',
      details: error.response.data
    });
  } else if (error.request) {
    // The request was made but no response was received
    console.log('No response received from API');
    console.log('Request details:', error.request);
    
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'No response received from SecurityScorecard API'
    });
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error setting up request:', error.message);
    next(error);
  }
}

// Mock data generators
function generateMockPortfolios() {
  return {
    entries: Array(5).fill(0).map((_, i) => ({
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      name: `Portfolio ${i + 1}`,
      description: `Description for Portfolio ${i + 1}`,
      created: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      updated: new Date(Date.now() - Math.random() * 86400000 * 10).toISOString(),
      company_count: Math.floor(Math.random() * 50) + 5
    })),
    count: 5,
    total: 5
  };
}

function generateMockPortfolioCompanies(portfolioId) {
  return {
    entries: Array(10).fill(0).map((_, i) => ({
      domain: `company${i + 1}.com`,
      name: `Company ${i + 1}`,
      score: Math.floor(Math.random() * 100),
      industry: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 5)],
      size: ['Small', 'Medium', 'Large', 'Enterprise'][Math.floor(Math.random() * 4)],
      last_updated: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString()
    })),
    count: 10,
    total: 25,
    portfolio_id: portfolioId
  };
}

module.exports = router;
