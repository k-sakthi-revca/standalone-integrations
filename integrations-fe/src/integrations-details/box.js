// Box integration configuration
const box = {
    name: "Box",
    baseUrl: "http://localhost:5000/api/box",
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
            path: "/box/user",
            description: "Retrieve information about the authenticated Box user",
            parameters: []
        },
        {
            id: "getRootFolder",
            name: "Get Root Folder",
            method: "GET",
            path: "/box/folders",
            description: "Retrieve the contents of the root folder (folder ID 0)",
            parameters: []
        },
        {
            id: "getFolderItems",
            name: "Get Folder Items",
            method: "GET",
            path: "/box/folders/{folderId}/items",
            description: "Retrieve items in a specific folder",
            parameters: [
                {
                    name: "folderId",
                    type: "text",
                    required: true,
                    description: "Folder ID (use '0' for root folder)"
                }
            ]
        },
        {
            id: "getFileInfo",
            name: "Get File Info",
            method: "GET",
            path: "/box/files/{fileId}",
            description: "Retrieve information about a specific file",
            parameters: [
                {
                    name: "fileId",
                    type: "text",
                    required: true,
                    description: "File ID"
                }
            ]
        },
        {
            id: "getFileContent",
            name: "Get File Content URL",
            method: "GET",
            path: "/box/files/{fileId}/content",
            description: "Get redirect URL to download or read file content",
            parameters: [
                {
                    name: "fileId",
                    type: "text",
                    required: true,
                    description: "File ID"
                }
            ]
        },
        {
            id: "getEventLogs",
            name: "Get Event Logs",
            method: "GET",
            path: "/box/events",
            description: "Retrieve event logs for the Box account",
            parameters: []
        }
    ]
};

export default box;
