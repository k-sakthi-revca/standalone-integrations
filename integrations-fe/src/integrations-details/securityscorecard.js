// SecurityScorecard integration configuration
const securityscorecard = {
  name: "SecurityScorecard",
  baseUrl: "http://localhost:5000/api/securityscorecards", // Using our backend server
  auth: {
    type: "apiKey",
    keyName: "Authorization",
    valuePrefix: "Token ",
  },
  headers: {
    "Accept": "application/json"
  },
  endpoints: [
    {
      id: "getPortfolios",
      name: "Get Portfolios",
      method: "GET",
      path: "/portfolios",
      description: "Retrieve all portfolios",
      parameters: []
    },
    {
      id: "getPortfolioCompanies",
      name: "Get Portfolio Companies",
      method: "GET",
      path: "/portfolios/{portfolio_id}/companies",
      description: "Retrieve companies in a specific portfolio",
      parameters: [
        {
          name: "portfolio_id",
          type: "text",
          required: true,
          description: "Portfolio ID"
        }
      ]
    },
    {
      id: "getFollowedCompanies",
      name: "Get Followed Companies",
      method: "GET",
      path: "/all-companies",
      description: "Find followed companies",
      parameters: []
    },
    {
      id: "getFollowedCompanyByDomain",
      name: "Get Followed Company by Domain",
      method: "GET",
      path: "/all-companies/{domain}",
      description: "Get followed company by domain",
      parameters: [
        {
          name: "domain",
          type: "text",
          required: true,
          description: "Company domain (e.g., example.com)"
        }
      ]
    },
    {
      id: "getScorecardNotes",
      name: "Get Scorecard Notes",
      method: "GET",
      path: "/scorecard-notes/{domain}",
      description: "Find scorecard notes for a company",
      parameters: [
        {
          name: "domain",
          type: "text",
          required: true,
          description: "Company domain (e.g., example.com)"
        }
      ]
    },
    {
      id: "getScorecardTags",
      name: "Get Scorecard Tags",
      method: "GET",
      path: "/scorecard-tags",
      description: "Get all scorecard tags",
      parameters: []
    },
    {
      id: "getTagCompanies",
      name: "Get Companies by Tag",
      method: "GET",
      path: "/scorecard-tags/{id}/companies",
      description: "Get all companies associated with a scorecard tag",
      parameters: [
        {
          name: "id",
          type: "text",
          required: true,
          description: "Tag ID"
        }
      ]
    },
    {
      id: "getTagGroups",
      name: "Get Tag Groups",
      method: "GET",
      path: "/scorecard-tags/groups",
      description: "Get all scorecard tag groups",
      parameters: []
    },
    {
      id: "getTagGroup",
      name: "Get Tag Group",
      method: "GET",
      path: "/scorecard-tags/groups/{id}",
      description: "Get a specific scorecard tag group",
      parameters: [
        {
          name: "id",
          type: "text",
          required: true,
          description: "Tag Group ID"
        }
      ]
    },
    {
      id: "getCompanyInfo",
      name: "Get Company Information",
      method: "GET",
      path: "/companies/{scorecard_identifier}",
      description: "Get a company information and scorecard summary",
      parameters: [
        {
          name: "scorecard_identifier",
          type: "text",
          required: true,
          description: "Scorecard identifier (e.g., example.com)"
        }
      ]
    },
    {
      id: "getCompanySummaryFactors",
      name: "Get Company Summary & Factors",
      method: "GET",
      path: "/companies/{domain}/summary-factors",
      description: "Get a company information, scorecard summary, factor scores and issue counts",
      parameters: [
        {
          name: "domain",
          type: "text",
          required: true,
          description: "Company domain (e.g., example.com)"
        }
      ]
    },
    {
      id: "getCompanyFactors",
      name: "Get Company Factors",
      method: "GET",
      path: "/companies/{scorecard_identifier}/factors",
      description: "Get a company's factor scores and issue counts",
      parameters: [
        {
          name: "scorecard_identifier",
          type: "text",
          required: true,
          description: "Scorecard identifier (e.g., example.com)"
        }
      ]
    },
    {
      id: "getCompanyHistoricalScores",
      name: "Get Company Historical Scores",
      method: "GET",
      path: "/companies/{scorecard_identifier}/history/score",
      description: "Get a company's historical scores",
      parameters: [
        {
          name: "scorecard_identifier",
          type: "text",
          required: true,
          description: "Scorecard identifier (e.g., example.com)"
        }
      ]
    },
    {
      id: "getCompanyHistoricalFactorScores",
      name: "Get Company Historical Factor Scores",
      method: "GET",
      path: "/companies/{scorecard_identifier}/history/factors/score",
      description: "Get a company's historical factor scores",
      parameters: [
        {
          name: "scorecard_identifier",
          type: "text",
          required: true,
          description: "Scorecard identifier (e.g., example.com)"
        }
      ]
    },
    {
      id: "getIndustryScore",
      name: "Get Industry Score",
      method: "GET",
      path: "/industries/{industry}/score",
      description: "Get score for the industry",
      parameters: [
        {
          name: "industry",
          type: "text",
          required: true,
          description: "Industry name (e.g., Technology, Finance, Healthcare)"
        }
      ]
    },
    {
      id: "getIndustryHistoricalScores",
      name: "Get Industry Historical Scores",
      method: "GET",
      path: "/industries/{industry}/history/score",
      description: "Get an industry's historical scores",
      parameters: [
        {
          name: "industry",
          type: "text",
          required: true,
          description: "Industry name (e.g., Technology, Finance, Healthcare)"
        }
      ]
    },
    {
      id: "getCompanyActiveIssues",
      name: "Get Company Active Issues",
      method: "GET",
      path: "/companies/{scorecard_identifier}/active-issues",
      description: "Get a company's active issues",
      parameters: [
        {
          name: "scorecard_identifier",
          type: "text",
          required: true,
          description: "Scorecard identifier (e.g., example.com)"
        }
      ]
    }
  ]
};

export default securityscorecard;
