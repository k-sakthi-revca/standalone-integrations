// Integration configurations
const integrations = {
    axonius: {
        name: "Axonius",
        baseUrl: "https://example.com/api/axonius", // Replace with actual API URL
        auth: {
            type: "apiKey", // or "oauth", "basic", etc.
            keyName: "api-key",
            // Add other auth details as needed
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
            },
            {
                id: "runQuery",
                name: "Run Custom Query",
                method: "POST",
                path: "/query",
                description: "Run a custom query",
                parameters: [
                    {
                        name: "query",
                        type: "textarea",
                        required: true,
                        description: "Query in JSON format"
                    },
                    {
                        name: "type",
                        type: "select",
                        options: ["devices", "users", "vulnerabilities"],
                        required: true,
                        description: "Type of entities to query"
                    }
                ]
            }
        ]
    },
    integration2: {
        name: "Integration 2",
        baseUrl: "https://example.com/api/integration2",
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
    },
    integration3: {
        name: "Integration 3",
        baseUrl: "https://example.com/api/integration3",
        auth: {
            type: "oauth",
        },
        endpoints: [
            {
                id: "listItems",
                name: "List Items",
                method: "GET",
                path: "/items",
                description: "List all items",
                parameters: []
            },
            {
                id: "createItem",
                name: "Create Item",
                method: "POST",
                path: "/items",
                description: "Create a new item",
                parameters: [
                    {
                        name: "name",
                        type: "text",
                        required: true,
                        description: "Item name"
                    },
                    {
                        name: "description",
                        type: "textarea",
                        required: false,
                        description: "Item description"
                    }
                ]
            }
        ]
    }
};

// DOM Elements
const integrationDropdown = document.getElementById('integration-dropdown');
const endpointSelect = document.getElementById('endpoint-select');
const paramsForm = document.getElementById('params-form');
const executeBtn = document.getElementById('execute-btn');
const responseData = document.getElementById('response-data');
const headersData = document.getElementById('headers-data');
const rawData = document.getElementById('raw-data');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Current state
let currentIntegration = null;
let currentEndpoint = null;

// Initialize the page
function init() {
    console.log('Initializing page...');
    
    // Check if DOM elements exist
    if (!integrationDropdown) {
        console.error('Integration dropdown not found!');
    } else {
        console.log('Integration dropdown found, setting up event listener');
        // Set up event listeners
        integrationDropdown.addEventListener('change', handleIntegrationChange);
    }
    
    if (!endpointSelect) {
        console.error('Endpoint select not found!');
    } else {
        endpointSelect.addEventListener('change', handleEndpointChange);
    }
    
    if (!executeBtn) {
        console.error('Execute button not found!');
    } else {
        executeBtn.addEventListener('click', executeRequest);
    }
    
    // Set up tabs
    if (tabButtons.length === 0) {
        console.error('Tab buttons not found!');
    } else {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                const tabId = `${button.dataset.tab}-tab`;
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // Disable execute button initially
    executeBtn.disabled = true;
    
    console.log('Page initialization complete');
}

// Handle integration selection change
function handleIntegrationChange(event) {
    const integrationId = event.target.value;
    
    if (integrationId && integrations[integrationId]) {
        currentIntegration = integrations[integrationId];
        
        // Clear and populate endpoint dropdown
        endpointSelect.innerHTML = '<option value="" disabled selected>Select Endpoint</option>';
        
        currentIntegration.endpoints.forEach(endpoint => {
            const option = document.createElement('option');
            option.value = endpoint.id;
            option.textContent = `${endpoint.method} ${endpoint.name}`;
            endpointSelect.appendChild(option);
        });
        
        // Enable endpoint select
        endpointSelect.disabled = false;
        
        // Clear parameters and results
        paramsForm.innerHTML = '';
        clearResults();
        
        // Disable execute button until endpoint is selected
        executeBtn.disabled = true;
    }
}

// Handle endpoint selection change
function handleEndpointChange(event) {
    const endpointId = event.target.value;
    
    if (endpointId && currentIntegration) {
        currentEndpoint = currentIntegration.endpoints.find(e => e.id === endpointId);
        
        if (currentEndpoint) {
            // Generate parameter form
            generateParameterForm(currentEndpoint.parameters);
            
            // Enable execute button
            executeBtn.disabled = false;
            
            // Clear results
            clearResults();
        }
    }
}

// Generate parameter form based on endpoint parameters
function generateParameterForm(parameters) {
    paramsForm.innerHTML = '';
    
    if (parameters.length === 0) {
        paramsForm.innerHTML = '<p>No parameters required for this endpoint.</p>';
        return;
    }
    
    parameters.forEach(param => {
        const paramGroup = document.createElement('div');
        paramGroup.className = 'param-group';
        
        // Create label
        const label = document.createElement('label');
        label.setAttribute('for', `param-${param.name}`);
        label.textContent = `${param.name}${param.required ? ' *' : ''}`;
        
        // Create input based on type
        let input;
        
        switch (param.type) {
            case 'select':
                input = document.createElement('select');
                
                // Add default empty option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select...';
                defaultOption.disabled = param.required;
                defaultOption.selected = true;
                input.appendChild(defaultOption);
                
                // Add options
                param.options.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option;
                    optionEl.textContent = option;
                    input.appendChild(optionEl);
                });
                break;
                
            case 'textarea':
                input = document.createElement('textarea');
                input.placeholder = param.description || '';
                break;
                
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.placeholder = param.description || '';
                if (param.default !== undefined) {
                    input.value = param.default;
                }
                break;
                
            default: // text, etc.
                input = document.createElement('input');
                input.type = 'text';
                input.placeholder = param.description || '';
                if (param.default !== undefined) {
                    input.value = param.default;
                }
        }
        
        // Set common attributes
        input.id = `param-${param.name}`;
        input.name = param.name;
        input.required = param.required;
        
        // Add description as help text if available
        let helpText = null;
        if (param.description) {
            helpText = document.createElement('small');
            helpText.className = 'help-text';
            helpText.textContent = param.description;
        }
        
        // Append elements to param group
        paramGroup.appendChild(label);
        paramGroup.appendChild(input);
        if (helpText) {
            paramGroup.appendChild(helpText);
        }
        
        // Append param group to form
        paramsForm.appendChild(paramGroup);
    });
}

// Execute API request
async function executeRequest() {
    if (!currentIntegration || !currentEndpoint) {
        showError('Please select an integration and endpoint.');
        return;
    }
    
    // Collect parameters
    const params = {};
    const formData = new FormData(paramsForm);
    
    currentEndpoint.parameters.forEach(param => {
        const inputEl = document.getElementById(`param-${param.name}`);
        if (inputEl) {
            params[param.name] = inputEl.value;
        }
    });
    
    // Show loading state
    executeBtn.disabled = true;
    executeBtn.innerHTML = '<span class="loading"></span> Executing...';
    clearResults();
    
    try {
        // In a real implementation, this would make an actual API call
        // For demo purposes, we'll simulate a response
        const response = await simulateApiCall(currentIntegration, currentEndpoint, params);
        
        // Display results
        displayResults(response);
    } catch (error) {
        showError(`Error: ${error.message}`);
    } finally {
        // Reset button state
        executeBtn.disabled = false;
        executeBtn.textContent = 'Execute Request';
    }
}

// Simulate API call (replace with actual implementation)
async function simulateApiCall(integration, endpoint, params) {
    // This is a placeholder for actual API call implementation
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Generate mock response based on endpoint
            const mockResponse = {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': generateRandomId(),
                    'Date': new Date().toUTCString()
                },
                data: generateMockData(endpoint, params)
            };
            
            resolve(mockResponse);
            
            // Simulate error (uncomment to test error handling)
            // reject(new Error('API request failed'));
        }, 1000);
    });
}

// Generate mock data based on endpoint
function generateMockData(endpoint, params) {
    switch (endpoint.id) {
        case 'getDevices':
            return {
                total: 100,
                limit: params.limit || 10,
                offset: 0,
                items: Array(parseInt(params.limit) || 10).fill(0).map((_, i) => ({
                    id: generateRandomId(),
                    name: `Device-${i + 1}`,
                    type: ['Laptop', 'Server', 'Mobile', 'IoT'][Math.floor(Math.random() * 4)],
                    os: ['Windows', 'Linux', 'macOS', 'Android'][Math.floor(Math.random() * 4)],
                    lastSeen: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
                }))
            };
            
        case 'getUsers':
            return {
                total: 50,
                limit: params.limit || 10,
                offset: 0,
                items: Array(parseInt(params.limit) || 10).fill(0).map((_, i) => ({
                    id: generateRandomId(),
                    username: `user${i + 1}`,
                    email: `user${i + 1}@example.com`,
                    role: ['Admin', 'User', 'Guest'][Math.floor(Math.random() * 3)],
                    lastLogin: new Date(Date.now() - Math.random() * 86400000 * 10).toISOString()
                }))
            };
            
        case 'runQuery':
            return {
                query: params.query,
                type: params.type,
                results: Array(5).fill(0).map((_, i) => ({
                    id: generateRandomId(),
                    name: `Result-${i + 1}`,
                    score: Math.floor(Math.random() * 100),
                    matched: Math.random() > 0.5
                }))
            };
            
        default:
            return {
                message: 'Success',
                timestamp: new Date().toISOString(),
                params: params
            };
    }
}

// Display results in the UI
function displayResults(response) {
    // Format and display response data
    responseData.textContent = JSON.stringify(response.data, null, 2);
    
    // Format and display headers
    headersData.textContent = Object.entries(response.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    
    // Format and display raw response
    rawData.textContent = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
    }, null, 2);
    
    // Show response tab
    document.querySelector('.tab-btn[data-tab="response"]').click();
}

// Clear results
function clearResults() {
    responseData.textContent = '';
    headersData.textContent = '';
    rawData.textContent = '';
}

// Show error message
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error';
    errorEl.textContent = message;
    
    // Clear previous errors
    const existingErrors = paramsForm.querySelectorAll('.error');
    existingErrors.forEach(el => el.remove());
    
    // Add error to form
    paramsForm.prepend(errorEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorEl.remove();
    }, 5000);
}

// Generate random ID (helper function)
function generateRandomId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
