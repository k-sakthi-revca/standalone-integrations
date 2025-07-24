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

/**
 * GET /all-companies
 * Find followed companies
 */
router.get('/all-companies', async (req, res, next) => {
  try {
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Return mock data
      return res.json(generateMockFollowedCompanies());
    }
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/all-companies`, {
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

/**
 * GET /all-companies/{domain}
 * Get followed company by domain
 */
router.get('/all-companies/:domain', async (req, res, next) => {
  try {
    const { domain } = req.params;
    
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Return mock data
      return res.json(generateMockFollowedCompanyByDomain(domain));
    }
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/all-companies/${domain}`, {
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

/**
 * GET /scorecard-notes/{domain}
 * Find scorecard notes
 */
router.get('/scorecard-notes/:domain', async (req, res, next) => {
  try {
    const { domain } = req.params;
    
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Return mock data
      return res.json(generateMockScorecardNotes(domain));
    }
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/scorecard-notes/${domain}`, {
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

/**
 * GET /scorecard-tags
 * Get scorecard tags
 */
router.get('/scorecard-tags', async (req, res, next) => {
  try {
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Return mock data
      return res.json(generateMockScorecardTags());
    }
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/scorecard-tags`, {
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

/**
 * GET /scorecard-tags/{id}/companies
 * Get all companies associated with a scorecard tag
 */
router.get('/scorecard-tags/:id/companies', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Return mock data
      return res.json(generateMockTagCompanies(id));
    }
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/scorecard-tags/${id}/companies`, {
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

/**
 * GET /scorecard-tags/groups
 * Get all scorecard tag groups
 */
router.get('/scorecard-tags/groups', async (req, res, next) => {
  try {
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Return mock data
      return res.json(generateMockTagGroups());
    }
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/scorecard-tags/groups`, {
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

/**
 * GET /scorecard-tags/groups/{id}
 * Get a scorecard tag group
 */
router.get('/scorecard-tags/groups/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // In a production environment, we would make a real API call
    // For demo purposes, we'll check if we should use mock data
    const useMockData = req.query.mock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // Return mock data
      return res.json(generateMockTagGroup(id));
    }
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/scorecard-tags/groups/${id}`, {
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

/**
 * GET /companies/{scorecard_identifier}
 * Get a company information and scorecard summary
 */
router.get('/companies/:scorecard_identifier', async (req, res, next) => {
  try {
    const { scorecard_identifier } = req.params;
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/companies/${scorecard_identifier}`, {
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

/**
 * GET /companies/{domain}/summary-factors
 * Get a company information, scorecard summary, factor scores and issue counts
 */
router.get('/companies/:domain/summary-factors', async (req, res, next) => {
  try {
    const { domain } = req.params;
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/companies/${domain}/summary-factors`, {
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

/**
 * GET /companies/{scorecard_identifier}/factors
 * Get a company's factor scores and issue counts
 */
router.get('/companies/:scorecard_identifier/factors', async (req, res, next) => {
  try {
    const { scorecard_identifier } = req.params;
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/companies/${scorecard_identifier}/factors`, {
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

/**
 * GET /companies/{scorecard_identifier}/history/score
 * Get a company's historical scores
 */
router.get('/companies/:scorecard_identifier/history/score', async (req, res, next) => {
  try {
    const { scorecard_identifier } = req.params;
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/companies/${scorecard_identifier}/history/score`, {
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

/**
 * GET /companies/{scorecard_identifier}/history/factors/score
 * Get a company's historical factor scores
 */
router.get('/companies/:scorecard_identifier/history/factors/score', async (req, res, next) => {
  try {
    const { scorecard_identifier } = req.params;
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/companies/${scorecard_identifier}/history/factors/score`, {
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

/**
 * GET /industries/{industry}/score
 * Get score for the industry
 */
router.get('/industries/:industry/score', async (req, res, next) => {
  try {
    const { industry } = req.params;
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/industries/${industry}/score`, {
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

/**
 * GET /industries/{industry}/history/score
 * Get an industry's historical scores
 */
router.get('/industries/:industry/history/score', async (req, res, next) => {
  try {
    const { industry } = req.params;
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/industries/${industry}/history/score`, {
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

/**
 * GET /companies/{scorecard_identifier}/active-issues
 * Get a company's active issues
 */
router.get('/companies/:scorecard_identifier/active-issues', async (req, res, next) => {
  try {
    const { scorecard_identifier } = req.params;
    
    // Make real API call to SecurityScorecard
    const response = await axios.get(`${BASE_URL}/companies/${scorecard_identifier}/active-issues`, {
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

function generateMockFollowedCompanies() {
  return {
    entries: Array(8).fill(0).map((_, i) => ({
      domain: `followed-company${i + 1}.com`,
      name: `Followed Company ${i + 1}`,
      score: Math.floor(Math.random() * 100),
      industry: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 5)],
      followed_since: new Date(Date.now() - Math.random() * 86400000 * 60).toISOString()
    })),
    count: 8,
    total: 8
  };
}

function generateMockFollowedCompanyByDomain(domain) {
  return {
    domain: domain,
    name: `Company ${domain.split('.')[0]}`,
    score: Math.floor(Math.random() * 100),
    industry: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 5)],
    followed_since: new Date(Date.now() - Math.random() * 86400000 * 60).toISOString(),
    details: {
      website: `https://${domain}`,
      headquarters: ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Berlin, Germany', 'Sydney, Australia'][Math.floor(Math.random() * 5)],
      employees: [50, 100, 500, 1000, 5000, 10000][Math.floor(Math.random() * 6)]
    }
  };
}

function generateMockScorecardNotes(domain) {
  return {
    domain: domain,
    notes: Array(3).fill(0).map((_, i) => ({
      id: Math.random().toString(36).substring(2, 15),
      content: `Note ${i + 1} for ${domain}: ${['Important security finding', 'Follow up required', 'Resolved issue', 'Pending review'][Math.floor(Math.random() * 4)]}`,
      created_by: `user${Math.floor(Math.random() * 5) + 1}@example.com`,
      created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 86400000 * 10).toISOString()
    })),
    count: 3
  };
}

function generateMockScorecardTags() {
  return {
    entries: Array(5).fill(0).map((_, i) => ({
      id: Math.random().toString(36).substring(2, 10),
      name: `Tag ${i + 1}`,
      description: `Description for Tag ${i + 1}`,
      color: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'][i],
      created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      company_count: Math.floor(Math.random() * 20) + 1
    })),
    count: 5,
    total: 5
  };
}

function generateMockTagCompanies(tagId) {
  return {
    tag_id: tagId,
    entries: Array(6).fill(0).map((_, i) => ({
      domain: `tagged-company${i + 1}.com`,
      name: `Tagged Company ${i + 1}`,
      score: Math.floor(Math.random() * 100),
      industry: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 5)],
      tagged_at: new Date(Date.now() - Math.random() * 86400000 * 15).toISOString()
    })),
    count: 6,
    total: 6
  };
}

function generateMockTagGroups() {
  return {
    entries: Array(3).fill(0).map((_, i) => ({
      id: Math.random().toString(36).substring(2, 10),
      name: `Tag Group ${i + 1}`,
      description: `Description for Tag Group ${i + 1}`,
      created_at: new Date(Date.now() - Math.random() * 86400000 * 45).toISOString(),
      tag_count: Math.floor(Math.random() * 10) + 1
    })),
    count: 3,
    total: 3
  };
}

function generateMockTagGroup(groupId) {
  return {
    id: groupId,
    name: `Tag Group ${groupId.substring(0, 3)}`,
    description: `Detailed description for Tag Group ${groupId.substring(0, 3)}`,
    created_at: new Date(Date.now() - Math.random() * 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 86400000 * 10).toISOString(),
    tags: Array(4).fill(0).map((_, i) => ({
      id: Math.random().toString(36).substring(2, 10),
      name: `Tag ${i + 1} in Group ${groupId.substring(0, 3)}`,
      color: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33'][i],
      company_count: Math.floor(Math.random() * 15) + 1
    }))
  };
}

module.exports = router;
