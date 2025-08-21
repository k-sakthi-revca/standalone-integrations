import React, { useState, useEffect, useCallback } from 'react';
import './ApiTester.css';
import integrations from '../integrations-details';
import DriveTreeView from './DriveTreeView/DriveTreeView';
import BoxTreeView from './BoxTreeView/BoxTreeView';
import SharepointTreeView from './SharepointTreeView/SharepointTreeView';
import EgnyteTreeView from './EgnyteTreeView/EgnyteTreeView';

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
  const [ciscoDnaAuthenticated, setCiscoDnaAuthenticated] = useState(false);
  const [boxAuthMethod, setBoxAuthMethod] = useState('oauth'); // Only 'oauth' for Box
  const [egnyteSubdomain, setEgnyteSubdomain] = useState(''); // Subdomain for Egnyte
  const [salesforceAuthMethod, setSalesforceAuthMethod] = useState('oauth'); // Only 'oauth' for Salesforce
  const [sharepointAuthMethod, setSharepointAuthMethod] = useState('oauth'); // Only 'oauth' for Sharepoint
  const [gdriveAuthMethod, setGdriveAuthMethod] = useState('oauth'); // Only 'oauth' for Google Drive
  const [criblAuthenticated, setCriblAuthenticated] = useState(false); // Track Cribl authentication status

  // Current integration and endpoint objects
  const currentIntegration = selectedIntegration ? integrations[selectedIntegration] : null;
  const currentEndpoint = currentIntegration && selectedEndpoint
    ? currentIntegration.endpoints.find(e => e.id === selectedEndpoint)
    : null;

  // Check if Cisco DNA token exists in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('ciscoDnaToken');
    const baseUrl = localStorage.getItem('ciscoDnaBaseUrl');
    if (token && baseUrl && selectedIntegration === 'ciscoDna') {
      setCiscoDnaAuthenticated(true);
    }
    
    // Check if Cribl token exists in localStorage
    const criblToken = localStorage.getItem('criblAccessToken');
    if (criblToken && selectedIntegration === 'cribl') {
      setCriblAuthenticated(true);
    }
  }, [selectedIntegration]);

  // Reset parameters when endpoint changes, but preserve baseUri for Meraki and SolarWinds
  useEffect(() => {
    // If it's the Meraki integration and baseUri exists, preserve it
    if (selectedIntegration === 'meraki' && paramValues.baseUri) {
      const baseUri = paramValues.baseUri;
      setParamValues({ baseUri });
    } else if (selectedIntegration === 'solarwinds' && paramValues.baseUri) {
      // Preserve baseUri for SolarWinds
      const baseUri = paramValues.baseUri;
      setParamValues({ baseUri });
    } else if (selectedIntegration === 'ciscoDna' && paramValues.baseUrl) {
      // Preserve baseUrl for Cisco DNA
      const baseUrl = paramValues.baseUrl;
      setParamValues({ baseUrl });
    } else if (selectedIntegration === 'cribl') {
      // Preserve Cribl authentication parameters
      const { clientId, clientSecret, baseUrl } = paramValues;
      setParamValues({ clientId, clientSecret, baseUrl });
    } else {
      setParamValues({});
    }
  }, [selectedEndpoint, selectedIntegration]);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    if(params){
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const instanceUrl = params.get('instance_url');
      
      if(accessToken || refreshToken){
        // Check if we're in the process of authenticating with Salesforce
        if (localStorage.getItem('salesforceAuthInProgress') === 'true') {
          localStorage.setItem('salesforceAccessToken', accessToken);
          localStorage.setItem('salesforceRefreshToken', refreshToken);
          if (instanceUrl) {
            localStorage.setItem('salesforceInstanceUrl', instanceUrl);
          }
          localStorage.removeItem('salesforceAuthInProgress');
        }
        // Check if we're in the process of authenticating with Sharepoint
        else if (localStorage.getItem('sharepointAuthInProgress') === 'true') {
          localStorage.setItem('sharepointAccessToken', accessToken);
          localStorage.setItem('sharepointRefreshToken', refreshToken);
          localStorage.removeItem('sharepointAuthInProgress');
        }
        // Check if we're in the process of authenticating with Google Drive
        else if (localStorage.getItem('gdriveAuthInProgress') === 'true') {
          localStorage.setItem('gdriveAccessToken', accessToken);
          localStorage.setItem('gdriveRefreshToken', refreshToken);
          localStorage.removeItem('gdriveAuthInProgress');
        }
        // Check if we're in the process of authenticating with Egnyte
        else if (localStorage.getItem('egnyteAuthInProgress') === 'true') {
          localStorage.setItem('egnyteAccessToken', accessToken);
          localStorage.setItem('egnyteRefreshToken', refreshToken);
          localStorage.removeItem('egnyteAuthInProgress');
        } else {
          // Default to Box if no specific auth is in progress
          localStorage.setItem('boxAccessToken', accessToken);
          localStorage.setItem('boxRefreshToken', refreshToken);
        }
      }
    }
    setTimeout(() => {
      // Remove query params from URL after 3 seconds
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);
  },[])

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
    
    // Set Box auth method to OAuth by default
    if (integration === 'box') {
      setBoxAuthMethod('oauth');
    }
    
    // Set Sharepoint auth method to OAuth by default
    if (integration === 'sharepoint') {
      setSharepointAuthMethod('oauth');
    }
    
    // Set Google Drive auth method to OAuth by default
    if (integration === 'gdrive') {
      setGdriveAuthMethod('oauth');
    }

    // Reset Egnyte subdomain when changing integrations
    if (integration === 'egnyte') {
      setEgnyteSubdomain('');
    }

    // Check if Cisco DNA token exists in localStorage
    if (integration === 'ciscoDna') {
      const token = localStorage.getItem('ciscoDnaToken');
      const baseUrl = localStorage.getItem('ciscoDnaBaseUrl');
      if (token && baseUrl) {
        setCiscoDnaAuthenticated(true);
      } else {
        setCiscoDnaAuthenticated(false);
      }
    }
    
    // Check if Cribl token exists in localStorage
    if (integration === 'cribl') {
      const token = localStorage.getItem('criblAccessToken');
      if (token) {
        setCriblAuthenticated(true);
      } else {
        setCriblAuthenticated(false);
      }
    }
  };
  
  // Handle Meraki auth method change
  const handleMerakiAuthMethodChange = (method) => {
    setMerakiAuthMethod(method);
    // Clear any previous auth data when switching methods
    setAuthData({});
  };
  
  // Handle OAuth connect button click
  const handleOAuthConnect = (integration) => {
    // Get the current frontend URL to redirect back to after OAuth
    const frontEndUrl = window.location.origin;
    
    if (integration === 'meraki') {
      // Redirect to the Meraki OAuth route with frontEndUrl as a query parameter
      window.location.href = `http://localhost:5000/api/meraki/auth/meraki?frontEndUrl=${encodeURIComponent(frontEndUrl)}`;
    } else if (integration === 'box') {
      // Redirect to the Box OAuth route with frontEndUrl as a query parameter
      window.location.href = `http://localhost:5000/api/box/auth/box?frontEndUrl=${encodeURIComponent(frontEndUrl)}`;
    } else if (integration === 'egnyte') {
      // Set a flag to indicate we're authenticating with Egnyte
      localStorage.setItem('egnyteAuthInProgress', 'true');
      
      // Redirect to the Egnyte OAuth route with subdomain and frontEndUrl as query parameters
      window.location.href = `http://localhost:5000/api/egnyte/auth/egnyte?subdomain=${encodeURIComponent(egnyteSubdomain)}&frontEndUrl=${encodeURIComponent(frontEndUrl)}`;
    } else if (integration === 'salesforce') {
      // Set a flag to indicate we're authenticating with Salesforce
      localStorage.setItem('salesforceAuthInProgress', 'true');
      
      // Redirect to the Salesforce OAuth route with frontEndUrl as a query parameter
      window.location.href = `http://localhost:5000/api/salesforce/auth/salesforce?frontEndUrl=${encodeURIComponent(frontEndUrl)}`;
    } else if (integration === 'sharepoint') {
      // Set a flag to indicate we're authenticating with Sharepoint
      localStorage.setItem('sharepointAuthInProgress', 'true');
      
      // Redirect to the Sharepoint OAuth route with frontEndUrl as a query parameter
      window.location.href = `http://localhost:5000/api/sharepoint/auth/sharepoint?frontEndUrl=${encodeURIComponent(frontEndUrl)}`;
    } else if (integration === 'gdrive') {
      // Set a flag to indicate we're authenticating with Google Drive
      localStorage.setItem('gdriveAuthInProgress', 'true');
      
      // Redirect to the Google Drive OAuth route with frontEndUrl as a query parameter
      window.location.href = `http://localhost:5000/api/gdrive/auth/gdrive?frontEndUrl=${encodeURIComponent(frontEndUrl)}`;
    }
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
  
  // Handle Egnyte subdomain input change
  const handleSubdomainChange = (e) => {
    setEgnyteSubdomain(e.target.value);
  };

  // Handle Cisco DNA authentication
  const handleCiscoDnaAuth = async (e) => {
    e.preventDefault();
    
    if (!paramValues.baseUrl || !authData.username || !authData.password) {
      setError('Base URL, username, and password are required for Cisco DNA authentication.');
      return;
    }

    // Show loading state
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      // Make the API call to get token
      const res = await fetch(`${integrations.ciscoDna.baseUrl}/dna/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          baseUrl: paramValues.baseUrl,
          username: authData.username,
          password: authData.password
        })
      });

      // Parse the response
      const data = await res.json();

      if (res.ok && data.token && data.baseUrl) {
        // Store token and baseUrl in localStorage
        localStorage.setItem('ciscoDnaToken', data.token);
        localStorage.setItem('ciscoDnaBaseUrl', data.baseUrl);
        console.log('✅ Cisco DNA token and baseUrl stored in localStorage');
        
        // Set authenticated state
        setCiscoDnaAuthenticated(true);

        // Format the response
        // setResponse({
        //   status: res.status,
        //   statusText: res.statusText,
        //   headers: Object.fromEntries([...res.headers.entries()]),
        //   url: `${integrations.ciscoDna.baseUrl}/dna/token`,
        //   method: 'POST',
        //   data: data
        // });

        // Switch to response tab
        // setActiveTab('response');
      } else {
        setError(`Authentication failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Cribl authentication
  const handleCriblAuth = async (e) => {
    e.preventDefault();
    
    if (!paramValues.clientId || !paramValues.clientSecret || !paramValues.baseUrl) {
      setError('Client ID, Client Secret, and Base URL are required for Cribl authentication.');
      return;
    }

    // Show loading state
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      // Make the API call to get token
      const res = await fetch(`${integrations.cribl.baseUrl}/auth/cribl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: paramValues.clientId,
          clientSecret: paramValues.clientSecret,
          baseUrl: paramValues.baseUrl
        })
      });

      // Parse the response
      const data = await res.json();

      if (res.ok && data.access_token) {
        // Store token and baseUrl in localStorage
        localStorage.setItem('criblAccessToken', data.access_token);
        localStorage.setItem('criblBaseUrl', paramValues.baseUrl);
        console.log('✅ Cribl token and baseUrl stored in localStorage');
        
        // Set authenticated state
        setCriblAuthenticated(true);
      } else {
        setError(`Authentication failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
    
    // Handle SolarWinds baseUri if present
    if (selectedIntegration === 'solarwinds' && paramValues.baseUri) {
      // Add baseUri as a query parameter for SolarWinds API
      queryParams.append('baseUri', paramValues.baseUri);
      // Also add it as a header
      headers['X-Base-URL'] = paramValues.baseUri;
    }
    
    // Handle Box token if present
    if (selectedIntegration === 'box') {
      const boxToken = localStorage.getItem('boxAccessToken');
      if (boxToken) {
        // Add token as a query parameter for all Box endpoints
        queryParams.append('token', boxToken);
      }
    }
    
    // Handle Egnyte token if present
    if (selectedIntegration === 'egnyte') {
      const egnyteToken = localStorage.getItem('egnyteAccessToken');
      if (egnyteToken) {
        // Add token as a query parameter for all Egnyte endpoints
        queryParams.append('token', egnyteToken);
      }
    }
    
    // Handle Salesforce token if present
    if (selectedIntegration === 'salesforce') {
      const salesforceToken = localStorage.getItem('salesforceAccessToken');
      const instanceUrl = localStorage.getItem('salesforceInstanceUrl');
      if (salesforceToken) {
        // Add token as a query parameter for all Salesforce endpoints
        queryParams.append('token', salesforceToken);
        if (instanceUrl) {
          queryParams.append('instanceUrl', instanceUrl);
        }
      }
    }
    
    // Handle Sharepoint token if present
    if (selectedIntegration === 'sharepoint') {
      const sharepointToken = localStorage.getItem('sharepointAccessToken');
      if (sharepointToken) {
        // Add token as a query parameter for all Sharepoint endpoints
        queryParams.append('token', sharepointToken);
      }
    }
    
    // Handle Google Drive token if present
    if (selectedIntegration === 'gdrive') {
      const gdriveToken = localStorage.getItem('gdriveAccessToken');
      if (gdriveToken) {
        // Add token as a query parameter for all Google Drive endpoints
        queryParams.append('token', gdriveToken);
      }
    }
    
    // Handle Cribl token if present
    if (selectedIntegration === 'cribl') {
      const criblToken = localStorage.getItem('criblAccessToken');
      const baseUrl = localStorage.getItem('criblBaseUrl');
      if (criblToken) {
        // Add token as Authorization header
        headers['Authorization'] = `Bearer ${criblToken}`;
        // Add baseUrl as a header
        if (baseUrl) {
          headers['X-Base-URL'] = baseUrl;
        }
      }
    }

    // Process regular path parameters
    Object.keys(paramValues).forEach(paramName => {
      // Skip baseUri as it's handled separately
      if (paramName === 'baseUri' || paramName === 'baseUrl') return;
console.log("sssss", paramValues,paramName)
      // Replace path parameters in the format {param_name}
      const pathParamRegex = new RegExp(`{${paramName}}`, 'g');
      if (pathParamRegex.test(path)) {
        path = path.replace(pathParamRegex, paramValues[paramName]);
      }
      console.log("pathParamRegex", pathParamRegex)
      console.log("paramValues[paramName]", paramValues[paramName])
      console.log("path",path)
    });

    // Add integration-specific headers
    if (currentIntegration.headers) {
      Object.assign(headers, currentIntegration.headers);
    }

    // Add auth header if specified
    if (currentIntegration.auth) {
      const { type, keyName, valuePrefix } = currentIntegration.auth;
      
      // Skip auth check for Cisco DNA as we're using token from localStorage
      if (selectedIntegration === 'ciscoDna' && ciscoDnaAuthenticated) {
        // Auth is handled via token from localStorage
      }
      // Skip auth check for Cisco DNA as we're using token from localStorage
      else if (selectedIntegration === 'cribl' && criblAuthenticated) {
        // Auth is handled via token from localStorage
      } else if (type === 'apiKey' && keyName) {
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

    // Special handling for Cisco DNA - add token from localStorage
    if (selectedIntegration === 'ciscoDna') {
      const token = localStorage.getItem('ciscoDnaToken');
      if (token) {
        headers['X-Auth-Token'] = token;
      }
      
      // Add baseUrl as a query parameter for all Cisco DNA endpoints
      const baseUrl = localStorage.getItem('ciscoDnaBaseUrl');
      if (baseUrl) {
        queryParams.append('baseUrl', baseUrl);
        // Also add token as a query parameter
        queryParams.append('token', token);
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

      // We no longer need special handling for Cisco DNA network-devices endpoint
      // as we're passing token and baseUrl as query parameters for all Cisco DNA endpoints

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
    
    // Special handling for Cribl
    if (selectedIntegration === 'cribl') {
      if (criblAuthenticated) {
        return (
          <div className="auth-section">
            <h3>Authentication</h3>
            <div className="auth-status success">
              <p>✅ Authenticated with Cribl</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.removeItem('criblAccessToken');
                  localStorage.removeItem('criblBaseUrl');
                  setCriblAuthenticated(false);
                  setAuthData({});
                  setResponse(null);
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="auth-section">
          <h3>Authentication</h3>
          <form onSubmit={handleCriblAuth}>
            <div className="auth-form">
              <div className="config-group">
                <label htmlFor="config-clientId">Client ID *</label>
                <input
                  type="text"
                  id="config-clientId"
                  name="clientId"
                  placeholder="Enter your Cribl Client ID"
                  value={paramValues.clientId || ''}
                  onChange={handleParamChange}
                  required
                />
              </div>
              <div className="config-group">
                <label htmlFor="config-clientSecret">Client Secret *</label>
                <input
                  type="password"
                  id="config-clientSecret"
                  name="clientSecret"
                  placeholder="Enter your Cribl Client Secret"
                  value={paramValues.clientSecret || ''}
                  onChange={handleParamChange}
                  required
                />
              </div>
              <div className="config-group">
                <label htmlFor="config-baseUrl">Base URL *</label>
                <input
                  type="text"
                  id="config-baseUrl"
                  name="baseUrl"
                  placeholder="Cribl Base URL (e.g., https://your-instance.cribl.cloud)"
                  value={paramValues.baseUrl || ''}
                  onChange={handleParamChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn execute-btn"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Get Token'}
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    // Special handling for Egnyte
    if (selectedIntegration === 'egnyte') {
      const egnyteToken = localStorage.getItem('egnyteAccessToken');
      
      if (egnyteToken) {
        return (
          <div className="auth-section">
            <h3>Authentication</h3>
            <div className="auth-status success">
              <p>✅ Authenticated with Egnyte</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.removeItem('egnyteAccessToken');
                  localStorage.removeItem('egnyteRefreshToken');
                  setAuthData({});
                  setResponse(null);
                  window.location.reload(); // Reload to reset the UI state
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="auth-section">
          <h3>Authentication</h3>
          <div className="auth-method-selector">
            <label>Authentication Method: OAuth</label>
          </div>
          
          <div className="auth-form">
            <div className="auth-group">
              <label htmlFor="egnyte-subdomain">Subdomain *</label>
              <input
                type="text"
                id="egnyte-subdomain"
                name="subdomain"
                placeholder="Enter your Egnyte subdomain (e.g., 'company')"
                value={egnyteSubdomain}
                onChange={handleSubdomainChange}
                required
              />
              <small className="help-text">
                Your Egnyte subdomain is the part before '.egnyte.com' in your Egnyte URL.
              </small>
            </div>
          </div>
          
          <div className="oauth-connect">
            <button 
              className="btn oauth-btn"
              onClick={() => handleOAuthConnect('egnyte')}
              disabled={!egnyteSubdomain}
            >
              Connect with Egnyte
            </button>
            <small className="help-text">
              Click to authenticate with your Egnyte account using OAuth.
            </small>
          </div>
        </div>
      );
    }
    
    // Special handling for Box
    if (selectedIntegration === 'box') {
      const boxToken = localStorage.getItem('boxAccessToken');
      
      if (boxToken) {
        return (
          <div className="auth-section">
            <h3>Authentication</h3>
            <div className="auth-status success">
              <p>✅ Authenticated with Box</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.removeItem('boxAccessToken');
                  localStorage.removeItem('boxRefreshToken');
                  setAuthData({});
                  setResponse(null);
                  window.location.reload(); // Reload to reset the UI state
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="auth-section">
          <h3>Authentication</h3>
          <div className="auth-method-selector">
            <label>Authentication Method:</label>
            <div className="auth-method-options">
              <label>
                <input
                  type="radio"
                  name="boxAuthMethod"
                  value="oauth"
                  checked={boxAuthMethod === 'oauth'}
                  readOnly
                />
                OAuth
              </label>
            </div>
          </div>
          
          <div className="oauth-connect">
            <button 
              className="btn oauth-btn"
              onClick={() => handleOAuthConnect('box')}
            >
              Connect with Box
            </button>
            <small className="help-text">
              Click to authenticate with your Box account using OAuth.
            </small>
          </div>
        </div>
      );
    }
    
    // Special handling for Cisco DNA
    if (selectedIntegration === 'ciscoDna') {
      if (ciscoDnaAuthenticated) {
        return (
          <div className="auth-section">
            <h3>Authentication</h3>
            <div className="auth-status success">
              <p>✅ Authenticated with Cisco DNA Center</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.removeItem('ciscoDnaToken');
                  localStorage.removeItem('ciscoDnaBaseUrl');
                  setCiscoDnaAuthenticated(false);
                  setAuthData({});
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="auth-section">
          <h3>Authentication</h3>
          <form onSubmit={handleCiscoDnaAuth}>
            <div className="auth-form">
              <div className="config-group">
                <label htmlFor="config-baseUrl">Base URL *</label>
                <input
                  type="text"
                  id="config-baseUrl"
                  name="baseUrl"
                  placeholder="Cisco DNA Center URL (e.g., https://sandboxdnac.cisco.com)"
                  value={paramValues.baseUrl || ''}
                  onChange={handleParamChange}
                  required
                />
              </div>
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
              <button
                type="submit"
                className="btn execute-btn"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Get Token'}
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    // Special handling for Salesforce
    if (selectedIntegration === 'salesforce') {
      const salesforceToken = localStorage.getItem('salesforceAccessToken');
      
      if (salesforceToken) {
        return (
          <div className="auth-section">
            <h3>Authentication</h3>
            <div className="auth-status success">
              <p>✅ Authenticated with Salesforce</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.removeItem('salesforceAccessToken');
                  localStorage.removeItem('salesforceRefreshToken');
                  localStorage.removeItem('salesforceInstanceUrl');
                  setAuthData({});
                  setResponse(null);
                  window.location.reload(); // Reload to reset the UI state
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="auth-section">
          <h3>Authentication</h3>
          <div className="auth-method-selector">
            <label>Authentication Method:</label>
            <div className="auth-method-options">
              <label>
                <input
                  type="radio"
                  name="salesforceAuthMethod"
                  value="oauth"
                  checked={salesforceAuthMethod === 'oauth'}
                  readOnly
                />
                OAuth
              </label>
            </div>
          </div>
          
          <div className="oauth-connect">
            <button 
              className="btn oauth-btn"
              onClick={() => handleOAuthConnect('salesforce')}
            >
              Connect with Salesforce
            </button>
            <small className="help-text">
              Click to authenticate with your Salesforce account using OAuth.
            </small>
          </div>
        </div>
      );
    }
    
    // Special handling for Sharepoint
    if (selectedIntegration === 'sharepoint') {
      const sharepointToken = localStorage.getItem('sharepointAccessToken');
      
      if (sharepointToken) {
        return (
          <div className="auth-section">
            <h3>Authentication</h3>
            <div className="auth-status success">
              <p>✅ Authenticated with Sharepoint</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.removeItem('sharepointAccessToken');
                  localStorage.removeItem('sharepointRefreshToken');
                  setAuthData({});
                  setResponse(null);
                  window.location.reload(); // Reload to reset the UI state
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="auth-section">
          <h3>Authentication</h3>
          <div className="auth-method-selector">
            <label>Authentication Method:</label>
            <div className="auth-method-options">
              <label>
                <input
                  type="radio"
                  name="sharepointAuthMethod"
                  value="oauth"
                  checked={sharepointAuthMethod === 'oauth'}
                  readOnly
                />
                OAuth
              </label>
            </div>
          </div>
          
          <div className="oauth-connect">
            <button 
              className="btn oauth-btn"
              onClick={() => handleOAuthConnect('sharepoint')}
            >
              Connect with Sharepoint
            </button>
            <small className="help-text">
              Click to authenticate with your Microsoft Sharepoint account using OAuth.
            </small>
          </div>
        </div>
      );
    }
    
    // Special handling for Google Drive
    if (selectedIntegration === 'gdrive') {
      const gdriveToken = localStorage.getItem('gdriveAccessToken');
      
      if (gdriveToken) {
        return (
          <div className="auth-section">
            <h3>Authentication</h3>
            <div className="auth-status success">
              <p>✅ Authenticated with Google Drive</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  localStorage.removeItem('gdriveAccessToken');
                  localStorage.removeItem('gdriveRefreshToken');
                  setAuthData({});
                  setResponse(null);
                  window.location.reload(); // Reload to reset the UI state
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="auth-section">
          <h3>Authentication</h3>
          <div className="auth-method-selector">
            <label>Authentication Method:</label>
            <div className="auth-method-options">
              <label>
                <input
                  type="radio"
                  name="gdriveAuthMethod"
                  value="oauth"
                  checked={gdriveAuthMethod === 'oauth'}
                  readOnly
                />
                OAuth
              </label>
            </div>
          </div>
          
          <div className="oauth-connect">
            <button 
              className="btn oauth-btn"
              onClick={() => handleOAuthConnect('gdrive')}
            >
              Connect with Google Drive
            </button>
            <small className="help-text">
              Click to authenticate with your Google Drive account using OAuth.
            </small>
          </div>
        </div>
      );
    }
    
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
                onClick={() => handleOAuthConnect('meraki')}
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
    // Special handling for Google Drive - show tree view instead of regular response
    if (selectedIntegration === 'gdrive' && localStorage.getItem('gdriveAccessToken')) {
      return (
        <div className="results-container">
          <DriveTreeView token={localStorage.getItem('gdriveAccessToken')} />
        </div>
      );
    }
    
    // Special handling for Box - show tree view instead of regular response
    if (selectedIntegration === 'box' && localStorage.getItem('boxAccessToken')) {
      return (
        <div className="results-container">
          <BoxTreeView token={localStorage.getItem('boxAccessToken')} />
        </div>
      );
    }
    
    // Special handling for SharePoint - show tree view instead of regular response
    if (selectedIntegration === 'sharepoint' && localStorage.getItem('sharepointAccessToken')) {
      return (
        <div className="results-container">
          <SharepointTreeView token={localStorage.getItem('sharepointAccessToken')} />
        </div>
      );
    }
    
    // Special handling for Egnyte - show tree view instead of regular response
    if (selectedIntegration === 'egnyte' && localStorage.getItem('egnyteAccessToken')) {
      return (
        <div className="results-container">
          <EgnyteTreeView token={localStorage.getItem('egnyteAccessToken')} subdomain={egnyteSubdomain} />
        </div>
      );
    }

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
          {currentIntegration && selectedIntegration === 'solarwinds' && renderAdditionalConfig()}

          {/* Show endpoint selector for authenticated integrations */}
          {currentIntegration && 
           ((selectedIntegration === 'ciscoDna' && ciscoDnaAuthenticated) || 
            (selectedIntegration === 'box' && localStorage.getItem('boxAccessToken')) ||
            (selectedIntegration === 'egnyte' && localStorage.getItem('egnyteAccessToken')) ||
            (selectedIntegration === 'salesforce' && localStorage.getItem('salesforceAccessToken')) ||
            (selectedIntegration === 'sharepoint' && localStorage.getItem('sharepointAccessToken')) ||
            (selectedIntegration === 'cribl' && criblAuthenticated) ||
            (selectedIntegration !== 'ciscoDna' && selectedIntegration !== 'box' && 
             selectedIntegration !== 'egnyte' && selectedIntegration !== 'salesforce' && 
             selectedIntegration !== 'sharepoint' && selectedIntegration !== 'cribl' && 
             (selectedIntegration !== 'meraki' || merakiAuthMethod === 'api'))) && (
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

          {currentEndpoint && 
           (selectedIntegration !== 'meraki' || merakiAuthMethod === 'api') && 
           (selectedIntegration !== 'box' || localStorage.getItem('boxAccessToken')) &&
           (selectedIntegration !== 'egnyte' || localStorage.getItem('egnyteAccessToken')) &&
           (selectedIntegration !== 'salesforce' || localStorage.getItem('salesforceAccessToken')) &&
           (selectedIntegration !== 'sharepoint' || localStorage.getItem('sharepointAccessToken')) &&
           (selectedIntegration !== 'cribl' || criblAuthenticated) && (
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
