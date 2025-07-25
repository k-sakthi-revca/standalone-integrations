import React, { useState, useEffect, useCallback } from 'react';
import './ApiTester.css';

// Integration configurations
const integrations = {
  securityscorecard: {
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
  },
  axonius: {
    name: "Axonius",
    baseUrl: "http://localhost:5000/api/axonius", // Replace with actual API URL
    auth: {
      type: "apiKey",
      keyName: "api-key",
    },
    endpoints: [
      {
        id: "getDevices",
        name: "Get Devices",
        method: "GET",
        path: "/devices",
        description: "Retrieve a list of devices",
        parameters: [
          {
            name: "limit",
            type: "number",
            required: false,
            default: 10,
            description: "Number of results to return"
          },
          {
            name: "filter",
            type: "text",
            required: false,
            description: "Filter criteria in JSON format"
          }
        ]
      },
      {
        id: "getUsers",
        name: "Get Users",
        method: "GET",
        path: "/users",
        description: "Retrieve a list of users",
        parameters: [
          {
            name: "limit",
            type: "number",
            required: false,
            default: 10,
            description: "Number of results to return"
          }
        ]
      }
    ]
  },
  meraki: {
    name: "Cisco Meraki",
    baseUrl: "http://localhost:5000/api/meraki",
    auth: {
      type: "apiKey",
      keyName: "X-Cisco-Meraki-API-Key",
    },
    headers: {
      "Accept": "application/json"
    },
    // Additional configuration for Meraki
    additionalConfig: {
      baseUri: {
        name: "Base URI",
        description: "Base URI (e.g., https://api.meraki.ca/api/v1, https://api.meraki.in/api/v1)",
        required: true
      }
    },
    endpoints: [
      {
        id: "getOrganizations",
        name: "Get All Organizations",
        method: "GET",
        path: "/organizations",
        description: "Retrieve all organizations",
        parameters: []
      },
      {
        id: "getOrganization",
        name: "Get Organization",
        method: "GET",
        path: "/organizations/{organizationId}",
        description: "Retrieve a specific organization",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getOrganizationDevices",
        name: "Get Organization Devices",
        method: "GET",
        path: "/organizations/{organizationId}/devices",
        description: "Retrieve devices in a specific organization",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getDevice",
        name: "Get Device",
        method: "GET",
        path: "/devices/{serial}",
        description: "Retrieve a specific device by serial number",
        parameters: [
          {
            name: "serial",
            type: "text",
            required: true,
            description: "Device Serial Number"
          }
        ]
      },
      {
        id: "getOrganizationNetworks",
        name: "Get Organization Networks",
        method: "GET",
        path: "/organizations/{organizationId}/networks",
        description: "Retrieve networks in a specific organization",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getNetwork",
        name: "Get Network",
        method: "GET",
        path: "/networks/{networkId}",
        description: "Retrieve a specific network",
        parameters: [
          {
            name: "networkId",
            type: "text",
            required: true,
            description: "Network ID"
          }
        ]
      },
      {
        id: "getOrganizationActionBatches",
        name: "Get Organization Action Batches",
        method: "GET",
        path: "/organizations/{organizationId}/actionBatches",
        description: "Retrieve action batches for a specific organization",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getOrganizationActionBatch",
        name: "Get Organization Action Batch",
        method: "GET",
        path: "/organizations/{organizationId}/actionBatches/{actionBatchId}",
        description: "Retrieve a specific action batch for an organization",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          },
          {
            name: "actionBatchId",
            type: "text",
            required: true,
            description: "Action Batch ID"
          }
        ]
      },
      {
        id: "getAlertProfiles",
        name: "Get Alert Profiles",
        method: "GET",
        path: "/organizations/{organizationId}/alerts/profiles",
        description: "Retrieve Alert Profiles",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getAlertSettings",
        name: "Get Alert Settings",
        method: "GET",
        path: "/networks/{networkId}/alerts/settings",
        description: "Retrieve Alert Settings",
        parameters: [
          {
            name: "networkId",
            type: "text",
            required: true,
            description: "Network ID"
          }
        ]
      },
      {
        id: "getOrganizationAssuranceAlerts",
        name: "Get Organization Assurance Alerts",
        method: "GET",
        path: "/organizations/{organizationId}/assurance/alerts",
        description: "Retrieve a list of assurance alerts for the organization.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getOrganizationAssuranceAlertsOverview",
        name: "Get Organization Assurance Alerts Overview",
        method: "GET",
        path: "/organizations/{organizationId}/assurance/alerts/overview",
        description: "Retrieve an overview of assurance alerts for the organization.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getAlertProfiles",
        name: "Get Alert Profiles",
        method: "GET",
        path: "/organizations/{organizationId}/alerts/profiles",
        description: "Retrieve Alert Profiles",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getOrganizationAssuranceAlertsOverviewByNetwork",
        name: "Get Organization Assurance Alerts Overview By Network",
        method: "GET",
        path: "/organizations/{organizationId}/assurance/alerts/overview/byNetwork",
        description: "Retrieve an overview of assurance alerts categorized by network.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getOrganizationBrandingPolicies",
        name: "Get Organization Branding Policies",
        method: "GET",
        path: "/organizations/{organizationId}/brandingPolicies",
        description: "Retrieve branding policies for an organization.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getOrganizationBrandingPolicy",
        name: "Get Organization Branding Policy",
        method: "GET",
        path: "/organizations/{organizationId}/brandingPolicies/{brandingPolicyId}",
        description: "Retrieve a specific branding policy by ID.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          },
          {
            name: "brandingPolicyId",
            type: "text",
            required: true,
            description: "Branding Policy ID"
          }
        ]
      },
      {
        id: "getOrganizationBrandingPoliciesPriorities",
        name: "Get Organization Branding Policies Priorities",
        method: "GET",
        path: "/organizations/{organizationId}/brandingPolicies/priorities",
        description: "Retrieve the priority list of branding policies.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getDeviceCellularSims",
        name: "Get Device Cellular Sims",
        method: "GET",
        path: "/devices/{serial}/cellular/sims",
        description: "Retrieve SIM information for a device with cellular connectivity.",
        parameters: [
          {
            name: "serial",
            type: "text",
            required: true,
            description: "Device serial number"
          }
        ]
      },
      {
        id: "getOrganizationClientsSearch",
        name: "Get Organization Clients Search",
        method: "GET",
        path: "/organizations/{organizationId}/clients/search",
        description: "Search for clients across an organization using filters like MAC address or IP.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getNetworkClientPolicy",
        name: "Get Network Client Policy",
        method: "GET",
        path: "/networks/{networkId}/clients/{clientId}/policy",
        description: "Retrieve the policy assigned to a client on a network.",
        parameters: [
          {
            name: "networkId",
            type: "text",
            required: true,
            description: "Network ID"
          },
          {
            name: "clientId",
            type: "text",
            required: true,
            description: "Client ID (usually MAC address)"
          }
        ]
      },
      {
        id: "getOrganizationLicenses",
        name: "Get Organization Licenses",
        method: "GET",
        path: "/organizations/{organizationId}/licenses",
        description: "Retrieve all licenses for the organization.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getOrganizationLicense",
        name: "Get Organization License",
        method: "GET",
        path: "/organizations/{organizationId}/licenses/{licenseId}",
        description: "Retrieve details of a specific license by ID.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          },
          {
            name: "licenseId",
            type: "text",
            required: true,
            description: "License ID"
          }
        ]
      },
      {
        id: "getOrganizationLoginSecurity",
        name: "Get Organization Login Security",
        method: "GET",
        path: "/organizations/{organizationId}/loginSecurity",
        description: "Retrieve login security settings for the organization.",
        parameters: [
          {
            name: "organizationId",
            type: "text",
            required: true,
            description: "Organization ID"
          }
        ]
      },
      {
        id: "getNetworkTrafficAnalysis",
        name: "Get Network Traffic Analysis",
        method: "GET",
        path: "/networks/{networkId}/trafficAnalysis",
        description: "Retrieve traffic analysis settings for a network.",
        parameters: [
          {
            name: "networkId",
            type: "text",
            required: true,
            description: "Network ID"
          }
        ]
      },
      {
        id: "getNetworkSyslogServers",
        name: "Get Network Syslog Servers",
        method: "GET",
        path: "/networks/{networkId}/syslogServers",
        description: "Retrieve syslog server settings for a network.",
        parameters: [
          {
            name: "networkId",
            type: "text",
            required: true,
            description: "Network ID"
          }
        ]
      }
    ]
  }
};

const ApiTester = () => {
  // State
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [authData, setAuthData] = useState({});
  const [paramValues, setParamValues] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('response');
  const [merakiAuthMethod, setMerakiAuthMethod] = useState('api'); // 'api' or 'oauth'

  // Current integration and endpoint objects
  const currentIntegration = selectedIntegration ? integrations[selectedIntegration] : null;
  const currentEndpoint = currentIntegration && selectedEndpoint
    ? currentIntegration.endpoints.find(e => e.id === selectedEndpoint)
    : null;

  // Reset parameters when endpoint changes, but preserve baseUri for Meraki
  useEffect(() => {
    // If it's the Meraki integration and baseUri exists, preserve it
    if (selectedIntegration === 'meraki' && paramValues.baseUri) {
      const baseUri = paramValues.baseUri;
      setParamValues({ baseUri });
    } else {
      setParamValues({});
    }
  }, [selectedEndpoint, selectedIntegration, paramValues.baseUri]);

  // Handle integration selection
  const handleIntegrationChange = (e) => {
    const integration = e.target.value;
    setSelectedIntegration(integration);
    setSelectedEndpoint('');
    setAuthData({});
    setResponse(null);
    setError('');
    
    // Reset Meraki auth method to API by default when changing integrations
    if (integration === 'meraki') {
      setMerakiAuthMethod('api');
    }
  };
  
  // Handle Meraki auth method change
  const handleMerakiAuthMethodChange = (method) => {
    setMerakiAuthMethod(method);
    // Clear any previous auth data when switching methods
    setAuthData({});
  };
  
  // Handle OAuth connect button click
  const handleOAuthConnect = () => {
    // Get the current frontend URL to redirect back to after OAuth
    const frontEndUrl = window.location.origin;
    
    // Redirect to the Meraki OAuth route with frontEndUrl as a query parameter
    window.location.href = `http://localhost:5000/api/meraki/auth/meraki?frontEndUrl=${encodeURIComponent(frontEndUrl)}`;
  };

  // Handle endpoint selection
  const handleEndpointChange = (e) => {
    setSelectedEndpoint(e.target.value);
    setResponse(null);
    setError('');
  };

  // Handle auth input changes
  const handleAuthChange = (e) => {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value
    });
  };

  // Handle parameter input changes
  const handleParamChange = (e) => {
    setParamValues({
      ...paramValues,
      [e.target.name]: e.target.value
    });
  };

  // Execute API request
  const executeRequest = async (e) => {
    e.preventDefault();

    if (!currentIntegration || !currentEndpoint) {
      setError('Please select an integration and endpoint.');
      return;
    }

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json'
    };

    // Process path parameters
    let path = currentEndpoint.path;
    const queryParams = new URLSearchParams();

    // Handle Meraki baseUri if present
    if (selectedIntegration === 'meraki' && paramValues.baseUri) {
      // Add baseUri as a query parameter for Meraki API
      queryParams.append('baseUri', paramValues.baseUri);
      // Also add it as a header
      headers['X-Meraki-Base-URI'] = paramValues.baseUri;
    }

    // Process regular path parameters
    Object.keys(paramValues).forEach(paramName => {
      // Skip baseUri as it's handled separately
      if (paramName === 'baseUri') return;

      // Replace path parameters in the format {param_name}
      const pathParamRegex = new RegExp(`{${paramName}}`, 'g');
      if (pathParamRegex.test(path)) {
        path = path.replace(pathParamRegex, paramValues[paramName]);
      }
    });

    // Add integration-specific headers
    if (currentIntegration.headers) {
      Object.assign(headers, currentIntegration.headers);
    }

    // Add auth header if specified
    if (currentIntegration.auth) {
      const { type, keyName, valuePrefix } = currentIntegration.auth;
      if (type === 'apiKey' && keyName) {
        if (authData.token) {
          const tokenValue = valuePrefix ? `${valuePrefix}${authData.token}` : authData.token;
          headers[keyName] = tokenValue;
        } else {
          setError('API token is required. Please enter your token in the Authentication section.');
          return;
        }
      } else if (type === 'basic') {
        if (authData.username && authData.password) {
          const base64Credentials = btoa(`${authData.username}:${authData.password}`);
          headers['Authorization'] = `Basic ${base64Credentials}`;
        } else {
          setError('Username and password are required. Please enter your credentials in the Authentication section.');
          return;
        }
      }
    }

    // Prepare request options
    const options = {
      method: currentEndpoint.method,
      headers: headers
    };

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(currentEndpoint.method)) {
      // Filter out path parameters that have already been used in the URL
      const bodyParams = {};
      Object.keys(paramValues).forEach(key => {
        if (!path.includes(`{${key}}`)) {
          bodyParams[key] = paramValues[key];
        }
      });

      if (Object.keys(bodyParams).length > 0) {
        options.body = JSON.stringify(bodyParams);
      }
    }

    // Show loading state
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      // Build the URL with query parameters if any
      let url = `${currentIntegration.baseUrl}${path}`;
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      // Make the API call
      const res = await fetch(url, options);

      // Parse the response
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      // Format the response
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries([...res.headers.entries()]),
        url: url,
        method: currentEndpoint.method,
        data: data
      });

      // Switch to response tab
      setActiveTab('response');
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render additional configuration form
  const renderAdditionalConfig = () => {
    if (!currentIntegration || !currentIntegration.additionalConfig) return null;

    return (
      <div className="additional-config-section">
        <h3>Additional Configuration</h3>
        <div className="additional-config-form">
          {Object.entries(currentIntegration.additionalConfig).map(([key, config]) => (
            <div className="config-group" key={key}>
              <label htmlFor={`config-${key}`}>
                {config.name}{config.required ? ' *' : ''}
              </label>
              <input
                type="text"
                id={`config-${key}`}
                name={key}
                placeholder={config.description || ''}
                value={paramValues[key] || ''}
                onChange={handleParamChange}
                required={config.required}
              />
              {config.description && (
                <small className="help-text">{config.description}</small>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render authentication form
  const renderAuthForm = () => {
    if (!currentIntegration) return null;
    
    // Special handling for Meraki to show auth method selection
    if (selectedIntegration === 'meraki') {
      return (
        <div className="auth-section">
          <h3>Authentication</h3>
          
          <div className="auth-method-selector">
            <label>Authentication Method:</label>
            <div className="auth-method-options">
              <label>
                <input
                  type="radio"
                  name="merakiAuthMethod"
                  value="api"
                  checked={merakiAuthMethod === 'api'}
                  onChange={() => handleMerakiAuthMethodChange('api')}
                />
                API Key
              </label>
              <label>
                <input
                  type="radio"
                  name="merakiAuthMethod"
                  value="oauth"
                  checked={merakiAuthMethod === 'oauth'}
                  onChange={() => handleMerakiAuthMethodChange('oauth')}
                />
                OAuth
              </label>
            </div>
          </div>
          
          {merakiAuthMethod === 'oauth' ? (
            <div className="oauth-connect">
              <button 
                className="btn oauth-btn"
                onClick={handleOAuthConnect}
              >
                Connect with Meraki
              </button>
              <small className="help-text">
                Click to authenticate with your Meraki account using OAuth.
              </small>
            </div>
          ) : (
            <div className="auth-form">
              <div className="auth-group">
                <label htmlFor="auth-token">API Token *</label>
                <input
                  type="password"
                  id="auth-token"
                  name="token"
                  placeholder="Enter your API token"
                  value={authData.token || ''}
                  onChange={handleAuthChange}
                  required
                />
                <small className="help-text">
                  This token will be used in the {currentIntegration.auth.keyName} header.
                </small>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Default auth form for other integrations
    if (!currentIntegration.auth) return null;
    
    const { type, keyName, valuePrefix } = currentIntegration.auth;

    return (
      <div className="auth-section">
        <h3>Authentication</h3>
        <div className="auth-form">
          {type === 'apiKey' && (
            <div className="auth-group">
              <label htmlFor="auth-token">API Token *</label>
              <input
                type="password"
                id="auth-token"
                name="token"
                placeholder="Enter your API token"
                value={authData.token || ''}
                onChange={handleAuthChange}
                required
              />
              <small className="help-text">
                This token will be used in the {keyName} header
                {valuePrefix ? ` with prefix "${valuePrefix}"` : ''}.
              </small>
            </div>
          )}

          {type === 'basic' && (
            <>
              <div className="auth-group">
                <label htmlFor="auth-username">Username *</label>
                <input
                  type="text"
                  id="auth-username"
                  name="username"
                  placeholder="Enter your username"
                  value={authData.username || ''}
                  onChange={handleAuthChange}
                  required
                />
              </div>
              <div className="auth-group">
                <label htmlFor="auth-password">Password *</label>
                <input
                  type="password"
                  id="auth-password"
                  name="password"
                  placeholder="Enter your password"
                  value={authData.password || ''}
                  onChange={handleAuthChange}
                  required
                />
              </div>
            </>
          )}

          {type !== 'apiKey' && type !== 'basic' && (
            <p>Authentication type "{type}" is not fully implemented in this demo.</p>
          )}
        </div>
      </div>
    );
  };

  // Render parameter form
  const renderParamForm = () => {
    if (!currentEndpoint) return null;

    const { parameters } = currentEndpoint;

    if (parameters.length === 0) {
      return <p>No parameters required for this endpoint.</p>;
    }

    return parameters.map(param => (
      <div className="param-group" key={param.name}>
        <label htmlFor={`param-${param.name}`}>
          {param.name}{param.required ? ' *' : ''}
        </label>

        {param.type === 'select' ? (
          <select
            id={`param-${param.name}`}
            name={param.name}
            value={paramValues[param.name] || ''}
            onChange={handleParamChange}
            required={param.required}
          >
            <option value="" disabled>Select...</option>
            {param.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : param.type === 'textarea' ? (
          <textarea
            id={`param-${param.name}`}
            name={param.name}
            placeholder={param.description || ''}
            value={paramValues[param.name] || ''}
            onChange={handleParamChange}
            required={param.required}
          />
        ) : param.type === 'number' ? (
          <input
            type="number"
            id={`param-${param.name}`}
            name={param.name}
            placeholder={param.description || ''}
            value={paramValues[param.name] || param.default || ''}
            onChange={handleParamChange}
            required={param.required}
          />
        ) : (
          <input
            type="text"
            id={`param-${param.name}`}
            name={param.name}
            placeholder={param.description || ''}
            value={paramValues[param.name] || param.default || ''}
            onChange={handleParamChange}
            required={param.required}
          />
        )}

        {param.description && (
          <small className="help-text">{param.description}</small>
        )}
      </div>
    ));
  };

  // JSONViewer component for rendering JSON with syntax highlighting - always fully expanded
  const JSONViewer = ({ data }) => {
    const renderValue = useCallback((value, path = '', level = 0) => {
      const indent = '  '.repeat(level);

      if (value === null) {
        return <span className="json-null">null</span>;
      }

      if (typeof value === 'boolean') {
        return <span className="json-boolean">{value.toString()}</span>;
      }

      if (typeof value === 'number') {
        return <span className="json-number">{value}</span>;
      }

      if (typeof value === 'string') {
        return <span className="json-string">"{value}"</span>;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return <span className="json-mark">[]</span>;
        }

        return (
          <div style={{ textAlign: 'left' }}>
            <span className="json-mark">[</span>
            <div className="json-line-content" style={{ textAlign: 'left' }}>
              {value.map((item, index) => (
                <div key={`${path}-${index}`} className="json-line">
                  {renderValue(item, `${path}.${index}`, level + 1)}
                  {index < value.length - 1 && <span className="json-mark">,</span>}
                </div>
              ))}
            </div>
            <div className="json-line">
              <span className="json-mark">]</span>
            </div>
          </div>
        );
      }

      if (typeof value === 'object') {
        const keys = Object.keys(value);

        if (keys.length === 0) {
          return <span className="json-mark">{ }</span>;
        }

        return (
          <div style={{ textAlign: 'left' }}>
            <span className="json-mark">{'{'}</span>
            <div className="json-line-content" style={{ textAlign: 'left' }}>
              {keys.map((key, index) => (
                <div key={`${path}-${key}`} className="json-line">
                  <span className="json-key">"{key}"</span>
                  <span className="json-mark">: </span>
                  {renderValue(value[key], `${path}.${key}`, level + 1)}
                  {index < keys.length - 1 && <span className="json-mark">,</span>}
                </div>
              ))}
            </div>
            <div className="json-line">
              <span className="json-mark">{'}'}</span>
            </div>
          </div>
        );
      }

      return <span>{String(value)}</span>;
    }, []);

    return (
      <div className="json-viewer" style={{ textAlign: 'left' }}>
        {renderValue(data, 'root')}
      </div>
    );
  };

  // Render response tabs
  const renderResponseTabs = () => {
    if (!response) return null;

    return (
      <div className="results-container">
        <h2>Results</h2>
        <div className="results-tabs">
          <button
            className={`tab-btn ${activeTab === 'response' ? 'active' : ''}`}
            onClick={() => setActiveTab('response')}
          >
            Response
          </button>
          <button
            className={`tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </button>
          <button
            className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            Raw
          </button>
        </div>

        <div className="tab-content">
          <div className={`tab-pane ${activeTab === 'response' ? 'active' : ''}`}>
            <JSONViewer data={response.data} />
          </div>
          <div className={`tab-pane ${activeTab === 'headers' ? 'active' : ''}`}>
            <pre>
              {Object.entries(response.headers)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')}
            </pre>
          </div>
          <div className={`tab-pane ${activeTab === 'raw' ? 'active' : ''}`}>
            <pre>
              {JSON.stringify({
                url: response.url,
                method: response.method,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="api-tester">
      <div className="api-container">
        <div className="api-controls">
          <h2>API Controls</h2>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div className="integration-selector">
            <label htmlFor="integration-dropdown">Select Integration:</label>
            <select
              id="integration-dropdown"
              value={selectedIntegration}
              onChange={handleIntegrationChange}
            >
              <option value="" disabled>Select Integration</option>
              {Object.keys(integrations).map(key => (
                <option key={key} value={key}>
                  {integrations[key].name}
                </option>
              ))}
            </select>
          </div>

          {currentIntegration && renderAuthForm()}

          {currentIntegration && selectedIntegration === 'meraki' && merakiAuthMethod === 'api' && renderAdditionalConfig()}

          {currentIntegration && (selectedIntegration !== 'meraki' || merakiAuthMethod === 'api') && (
            <div className="endpoint-selector">
              <label htmlFor="endpoint-select">Select Endpoint:</label>
              <select
                id="endpoint-select"
                value={selectedEndpoint}
                onChange={handleEndpointChange}
                disabled={!currentIntegration || (selectedIntegration === 'meraki' && merakiAuthMethod === 'oauth')}
              >
                <option value="" disabled>Select Endpoint</option>
                {currentIntegration.endpoints.map(endpoint => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.method} {endpoint.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentEndpoint && (selectedIntegration !== 'meraki' || merakiAuthMethod === 'api') && (
            <div className="parameters-container">
              <h3>Parameters</h3>
              <form onSubmit={executeRequest}>
                <div className="params-form">
                  {renderParamForm()}
                </div>

                <button
                  type="submit"
                  className="btn execute-btn"
                  disabled={loading}
                >
                  {loading ? 'Executing...' : 'Execute Request'}
                </button>
              </form>
            </div>
          )}
        </div>

        {renderResponseTabs()}
      </div>
    </div>
  );
};

export default ApiTester;
