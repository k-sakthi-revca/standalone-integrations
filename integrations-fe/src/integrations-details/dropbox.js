// dropbox integration configuration
const dropbox = {
    name: "Dropbox",
    baseUrl: "http://localhost:5000/api/dropbox",
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
            path: "/dropbox/user",
            description: "Retrieve information about the authenticated Dropbox user",
            parameters: []
        },
        {
            id: "getFiles",
            name: "Get Files",
            method: "GET",
            path: "/dropbox/files",
            description: "Retrieve files and folders from Dropbox root",
            parameters: []
        },
        {
            id: "getFolderContents",
            name: "Get Folder Contents",
            method: "GET",
            path: "/dropbox/folders/{path}",
            description: "Retrieve contents of a specific folder",
            parameters: [
                {
                    name: "path",
                    type: "text",
                    required: true,
                    description: "Folder path (use '' for root folder)"
                }
            ]
        },
        {
            id: "getFileInfo",
            name: "Get File Info",
            method: "GET",
            path: "/dropbox/files/{path}/info",
            description: "Retrieve information about a specific file",
            parameters: [
                {
                    name: "path",
                    type: "text",
                    required: true,
                    description: "File path"
                }
            ]
        },
        {
            id: "getFileContent",
            name: "Get File Content URL",
            method: "GET",
            path: "/dropbox/files/{path}/content",
            description: "Get redirect URL to download or read file content",
            parameters: [
                {
                    name: "path",
                    type: "text",
                    required: true,
                    description: "File path"
                }
            ]
        }
    ]
};

export default dropbox;
