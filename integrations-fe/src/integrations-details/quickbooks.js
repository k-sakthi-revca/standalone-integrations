// Quickbooks integration configuration
const quickbooks = {
    name: "Quick Books",
    baseUrl: "http://localhost:5000/api/quickbooks",
    auth: {
        type: "oauth",
        keyName: "Authorization"
    },
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    },
    endpoints: [
        {
            id: "getComnpanyDetails",
            name: "Get Comnpany Details",
            method: "GET",
            path: "/company-details",
            description: "Retrieve information about the Comnpany of quickbooks user",
            parameters: []
        }
    ]
};

export default quickbooks;
