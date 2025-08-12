// Salesforce integration configuration
const salesforce = {
    name: "Salesforce",
    baseUrl: "http://localhost:5000/api/salesforce",
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
            id: "getUserInfo",
            name: "Get User Info",
            method: "GET",
            path: "/salesforce/user",
            description: "Retrieve information about the authenticated Salesforce user",
            parameters: []
        },
        {
            id: "getAccounts",
            name: "Get Accounts",
            method: "GET",
            path: "/salesforce/accounts",
            description: "Retrieve accounts from Salesforce",
            parameters: []
        },
        {
            id: "getContacts",
            name: "Get Contacts",
            method: "GET",
            path: "/salesforce/contacts",
            description: "Retrieve contacts from Salesforce",
            parameters: []
        }
    ]
};

export default salesforce;
