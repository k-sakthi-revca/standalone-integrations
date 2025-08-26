// Quickbooks integration configuration
const xero = {
    name: "Xero",
    baseUrl: "http://localhost:5000/api/xero",
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
            id: "getOrgs",
            name: "Get Orgs",
            method: "GET",
            path: "/get-organizations",
            description: "Retrieve Organizations",
            parameters: []
        }
    ]
};

export default xero;
