// Sharepoint integration configuration
const sharepoint = {
    name: "Sharepoint",
    baseUrl: "http://localhost:5000/api/sharepoint",
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
            path: "/sharepoint/user",
            description: "Retrieve information about the authenticated Sharepoint user",
            parameters: []
        },
        {
            id: "getSites",
            name: "Get Sites",
            method: "GET",
            path: "/sharepoint/sites",
            description: "Retrieve available sites from Sharepoint",
            parameters: []
        },
        {
            id: "getLists",
            name: "Get Lists",
            method: "GET",
            path: "/sharepoint/sites/{siteId}/lists",
            description: "Retrieve lists from a specific Sharepoint site",
            parameters: [
                {
                    name: "siteId",
                    type: "text",
                    required: true,
                    description: "Site ID"
                }
            ]
        },
        {
            id: "getListItems",
            name: "Get List Items",
            method: "GET",
            path: "/sharepoint/sites/{siteId}/lists/{listId}/items",
            description: "Retrieve items from a specific Sharepoint list",
            parameters: [
                {
                    name: "siteId",
                    type: "text",
                    required: true,
                    description: "Site ID"
                },
                {
                    name: "listId",
                    type: "text",
                    required: true,
                    description: "List ID"
                }
            ]
        }
    ]
};

export default sharepoint;
