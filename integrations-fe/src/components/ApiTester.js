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
  integration2: {
    name: "Integration 2",
    baseUrl: "http://localhost:5000/api/integration2",
    auth: {
      type: "basic",
    },
    endpoints: [
      {
        id: "getData",
        name: "Get Data",
        method: "GET",
        path: "/data",
        description: "Retrieve data",
        parameters: [
          {
            name: "type",
            type: "select",
            options: ["type1", "type2", "type3"],
            required: true,
            description: "Type of data to retrieve"
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

  // Current integration and endpoint objects
  const currentIntegration = selectedIntegration ? integrations[selectedIntegration] : null;
  const currentEndpoint = currentIntegration && selectedEndpoint 
    ? currentIntegration.endpoints.find(e => e.id === selectedEndpoint) 
    : null;

  // Reset parameters when endpoint changes
  useEffect(() => {
    setParamValues({});
  }, [selectedEndpoint]);

  // Handle integration selection
  const handleIntegrationChange = (e) => {
    setSelectedIntegration(e.target.value);
    setSelectedEndpoint('');
    setAuthData({});
    setResponse(null);
    setError('');
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

    // Process path parameters
    let path = currentEndpoint.path;
    Object.keys(paramValues).forEach(paramName => {
      // Replace path parameters in the format {param_name}
      const pathParamRegex = new RegExp(`{${paramName}}`, 'g');
      if (pathParamRegex.test(path)) {
        path = path.replace(pathParamRegex, paramValues[paramName]);
      }
    });

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json'
    };

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
      // Use the path as is without forcing mock data
      const url = `${currentIntegration.baseUrl}${path}`;
      
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

  // Render authentication form
  const renderAuthForm = () => {
    if (!currentIntegration || !currentIntegration.auth) return null;

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

  // JSONViewer component for rendering JSON with syntax highlighting and collapsible sections
  const JSONViewer = ({ data }) => {
    const [expandedPaths, setExpandedPaths] = useState({});
    
    const toggleExpand = (path) => {
      setExpandedPaths(prev => ({
        ...prev,
        [path]: !prev[path]
      }));
    };
    
    const isExpanded = (path) => {
      return expandedPaths[path] === true;
    };
    
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
        
        const expanded = isExpanded(path);
        
        return (
          <div style={{ textAlign: 'left' }}>
            <span 
              className={`json-toggle ${expanded ? 'open' : ''}`} 
              onClick={() => toggleExpand(path)}
            />
            <span className="json-mark">[</span>
            {expanded ? (
              <div className="json-line-content" style={{ textAlign: 'left' }}>
                {value.map((item, index) => (
                  <div key={`${path}-${index}`} className="json-line">
                    {renderValue(item, `${path}.${index}`, level + 1)}
                    {index < value.length - 1 && <span className="json-mark">,</span>}
                  </div>
                ))}
              </div>
            ) : (
              <span className="json-collapsed">...</span>
            )}
            <div className="json-line">
              <span className="json-mark">]</span>
            </div>
          </div>
        );
      }
      
      if (typeof value === 'object') {
        const keys = Object.keys(value);
        
        if (keys.length === 0) {
          return <span className="json-mark">{}</span>;
        }
        
        const expanded = isExpanded(path);
        
        return (
          <div style={{ textAlign: 'left' }}>
            <span 
              className={`json-toggle ${expanded ? 'open' : ''}`} 
              onClick={() => toggleExpand(path)}
            />
            <span className="json-mark">{'{'}</span>
            {expanded ? (
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
            ) : (
              <span className="json-collapsed">...</span>
            )}
            <div className="json-line">
              <span className="json-mark">{'}'}</span>
            </div>
          </div>
        );
      }
      
      return <span>{String(value)}</span>;
    }, [expandedPaths]);
    
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
          
          {currentIntegration && (
            <div className="endpoint-selector">
              <label htmlFor="endpoint-select">Select Endpoint:</label>
              <select 
                id="endpoint-select"
                value={selectedEndpoint}
                onChange={handleEndpointChange}
                disabled={!currentIntegration}
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
          
          {currentEndpoint && (
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
