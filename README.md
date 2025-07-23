# Standalone Integrations

A flexible web interface for interacting with various API integrations. This project provides a simple, user-friendly way to select different integrations, choose endpoints, and execute API requests with customizable parameters.

## Features

- **Integration Selection**: Choose from multiple available integrations via a dropdown menu
- **Dynamic Endpoint Selection**: Endpoints are dynamically populated based on the selected integration
- **Parameter Form Generation**: Input forms are automatically generated based on the selected endpoint's required parameters
- **Response Visualization**: View API responses in a tabbed interface (Response, Headers, Raw)
- **Error Handling**: Clear error messages for failed requests

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Select an integration from the dropdown in the top-right corner
4. Choose an endpoint from the available options
5. Fill in any required parameters
6. Click "Execute Request" to see the results

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling for the application
- `script.js` - JavaScript functionality including integration configurations

## Adding New Integrations

To add a new integration, edit the `integrations` object in `script.js`. Follow the existing pattern:

```javascript
newIntegration: {
    name: "Integration Name",
    baseUrl: "https://api.example.com",
    auth: {
        type: "apiKey", // or "oauth", "basic", etc.
        keyName: "api-key",
        // Add other auth details as needed
    },
    endpoints: [
        {
            id: "uniqueEndpointId",
            name: "Endpoint Name",
            method: "GET", // or POST, PUT, DELETE, etc.
            path: "/endpoint-path",
            description: "Description of what this endpoint does",
            parameters: [
                {
                    name: "paramName",
                    type: "text", // or number, select, textarea
                    required: true, // or false
                    default: "defaultValue", // optional
                    description: "Parameter description"
                    // For select type, add options: ["option1", "option2"]
                }
            ]
        }
    ]
}
```

## Customization

- Modify the CSS in `styles.css` to change the appearance
- Update the mock data generation in `generateMockData()` function to simulate different responses
- Add authentication handling in the `simulateApiCall()` function for real API integration

## Future Enhancements

- Add authentication UI for different auth types
- Implement persistent storage for saved requests
- Add request history
- Support for file uploads
- Response data visualization (charts, graphs)
