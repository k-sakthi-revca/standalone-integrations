// Egnyte integration configuration
const egnyte = {
    name: "Egnyte",
    baseUrl: "http://localhost:5000/api/egnyte",
    auth: {
        type: "oauth",
        keyName: "Authorization",
        additionalParams: ["subdomain"]
    },
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    },
    hasTreeView: true,
    treeViewComponent: "EgnyteTreeView",
    endpoints: [
        {
            id: "getUserInfo",
            name: "Get User Info",
            method: "GET",
            path: "/egnyte/user",
            description: "Retrieve information about the authenticated Egnyte user",
            parameters: []
        },
        {
            id: "getRootFolder",
            name: "Get Root Folder",
            method: "GET",
            path: "/egnyte/folders",
            description: "Retrieve the contents of the root folder",
            parameters: []
        },
        {
            id: "getFolderItems",
            name: "Get Folder Items",
            method: "GET",
            path: "/egnyte/folders/{folderPath}",
            description: "Retrieve items in a specific folder",
            parameters: [
                {
                    name: "folderPath",
                    type: "text",
                    required: true,
                    description: "Folder path (e.g., '/Shared')"
                }
            ]
        },
        {
            id: "getFileInfo",
            name: "Get File Info",
            method: "GET",
            path: "/egnyte/files/{filePath}/info",
            description: "Retrieve information about a specific file",
            parameters: [
                {
                    name: "filePath",
                    type: "text",
                    required: true,
                    description: "File path (e.g., '/Shared/file.txt')"
                }
            ]
        }
    ]
};

export default egnyte;
