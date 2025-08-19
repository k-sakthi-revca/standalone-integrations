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
            id: "getRoot",
            name: "Get Root",
            method: "GET",
            path: "/sharepoint/root",
            description: "Retrieve root folder in Sharepoint",
            parameters: []
        },
        {
            id: "getRootFiles",
            name: "Get Root Files",
            method: "GET",
            path: "/sharepoint/root/files",
            description: "Retrieve root files in Sharepoint",
            parameters: []
        },
        {
            id: "getFilesInFolder",
            name: "Get Files",
            method: "GET",
            path: "/sharepoint/folder/{folderPath}",
            description: "Retrieve lists of files from a specific Sharepoint folder",
            parameters: [
                {
                    name: "folderPath",
                    type: "text",
                    required: true,
                    description: "Folder Path"
                }
            ]
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
