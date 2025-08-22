// Office365 integration configuration
const office365 = {
    name: "Office 365",
    baseUrl: "http://localhost:5000/api/office365",
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
            path: "/office365/user",
            description: "Retrieve information about the authenticated Sharepoint user",
            parameters: []
        },
        {
            id: "getRoot",
            name: "Get Root",
            method: "GET",
            path: "/office365/root",
            description: "Retrieve root folder in Sharepoint",
            parameters: []
        },
        {
            id: "getRootFiles",
            name: "Get Root Files",
            method: "GET",
            path: "/office365/root/files",
            description: "Retrieve root files in Sharepoint",
            parameters: []
        },
        {
            id: "getFilesInFolder",
            name: "Get Files",
            method: "GET",
            path: "/office365/folder/{folderPath}",
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
            path: "/office365/sites",
            description: "Retrieve available sites from Sharepoint",
            parameters: []
        },
        {
            id: "getLists",
            name: "Get Lists",
            method: "GET",
            path: "/office365/sites/{siteId}/lists",
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
            path: "/office365/sites/{siteId}/lists/{listId}/items",
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
        },
        {
            id: "getSharepointTree",
            name: "Get Folder Hierarchy",
            method: "GET",
            path: "/sharepoint-tree",
            description: "Retrieve the complete folder hierarchy from SharePoint",
            parameters: []
        },
        {
            id: "moveFile",
            name: "Move File",
            method: "PATCH",
            path: "/move-file",
            description: "Move a file or folder to a different location in SharePoint",
            parameters: [
                {
                    name: "fileId",
                    type: "text",
                    required: true,
                    description: "ID of the file or folder to move"
                },
                {
                    name: "newParentId",
                    type: "text",
                    required: true,
                    description: "ID of the destination folder"
                },
                {
                    name: "oldParentId",
                    type: "text",
                    required: false,
                    description: "ID of the current parent folder"
                }
            ]
        }
    ]
};

export default office365;
