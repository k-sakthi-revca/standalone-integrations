const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
const archiver = require('archiver');
require('dotenv').config();

const router = express.Router();

const {
    MS_CLIENT_ID,
    MS_CLIENT_SECRET,
    MS_REDIRECT_URI,
    MS_SCOPES
} = process.env;

router.use(cookieParser());

// Helper function to make requests to Microsoft Graph API
const fetchFromSharepoint = async (url, token) => {
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    return response.data;
};

// Helper function to make POST/PATCH/PUT requests to Microsoft Graph API
const modifySharepoint = async (url, method, data, token) => {
    const response = await axios({
        method,
        url,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        data,
    });
    return response.data;
};

/**
 * GET /auth/office365
 * Redirect user to Microsoft login consent screen
 * Accepts ?frontEndUrl=https://your-frontend.com
 */
router.get('/auth/office365', (req, res) => {
    const { frontEndUrl } = req.query;
    if (!frontEndUrl) {
        return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
    }

    const authorizeUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${MS_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(MS_REDIRECT_URI)}` +
        `&response_mode=query` +
        `&scope=${encodeURIComponent(MS_SCOPES)}`;

    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000 // 10 mins
    });

    res.redirect(authorizeUrl);
});

/**
 * GET /auth/office365/callback
 * Handle OAuth callback, exchange code for token, then redirect to frontend
 */
router.get('/auth/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontEndUrl = req.cookies.frontEndUrl;

    if (error) return res.status(400).send(`Access denied or OAuth error: ${error}`);
    if (!code) return res.status(400).send('Missing authorization code');
    if (!frontEndUrl) return res.status(400).send('Missing frontEndUrl cookie');

    try {
        const tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;

        const payload = qs.stringify({
            client_id: MS_CLIENT_ID,
            scope:MS_SCOPES,
            code,
            redirect_uri: MS_REDIRECT_URI,
            grant_type: 'authorization_code',
            client_secret: MS_CLIENT_SECRET
        });

        const tokenResponse = await axios.post(tokenUrl, payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('🔑 Microsoft Access Token:', access_token);

        res.clearCookie('frontEndUrl');
        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;

        return res.redirect(redirectWithTokens);
    } catch (err) {
        console.error('Microsoft OAuth callback error:', err.response?.data || err.message);
        return res.status(500).send('Token exchange failed');
    }
});

// Get User Info
router.get('/office365/user', async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromSharepoint('https://graph.microsoft.com/v1.0/me', token);
        res.json(data);
    } catch (error) {
        console.error("❌ Sharepoint user fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch user info", error: error.message });
    }
});

// Get Sites
router.get('/office365/sites', async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromSharepoint('https://graph.microsoft.com/v1.0/sites?search=*', token);
        res.json(data);
    } catch (error) {
        console.error("❌ Sharepoint sites fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch sites", error: error.message });
    }
});

// Get Lists for a specific site
router.get('/office365/sites/:siteId/lists', async (req, res) => {
    const { token } = req.query;
    const { siteId } = req.params;

    if (!token) return res.status(400).json({ message: "token is required" });
    if (!siteId) return res.status(400).json({ message: "siteId is required" });

    try {
        const data = await fetchFromSharepoint(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists`, token);
        res.json(data);
    } catch (error) {
        console.error("❌ Sharepoint lists fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch lists", error: error.message });
    }
});

// Get List Items for a specific list
router.get('/office365/sites/:siteId/lists/:listId/items', async (req, res) => {
    const { token } = req.query;
    const { siteId, listId } = req.params;

    if (!token) return res.status(400).json({ message: "token is required" });
    if (!siteId) return res.status(400).json({ message: "siteId is required" });
    if (!listId) return res.status(400).json({ message: "listId is required" });

    try {
        const data = await fetchFromSharepoint(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?expand=fields`, token);
        res.json(data);
    } catch (error) {
        console.error("❌ Sharepoint list items fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch list items", error: error.message });
    }
});
// Get SharePoint Root
router.get('/office365/root', async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromSharepoint('https://graph.microsoft.com/v1.0/me/drive/root', token);
        res.json(data);
    } catch (error) {
        console.error("❌ SharePoint root fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch SharePoint root", error: error.message });
    }
});

// Get Files in SharePoint Root Folder
router.get('/office365/root/files', async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromSharepoint('https://graph.microsoft.com/v1.0/me/drive/root/children', token);
        res.json(data);
    } catch (error) {
        console.error("❌ SharePoint root files fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch files in root folder", error: error.message });
    }
});

// Get Files in Specific Folder
router.get('/office365/folder/:folderPath', async (req, res) => {
    const { token } = req.query;
    const {folderPath} = req.params;
    
    if (!token || !folderPath) {
        return res.status(400).json({ message: "token and folderPath are required" });
    }

    try {
        // Fetch files inside folder
        const data = await fetchFromSharepoint(
            `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}:/children`,
            token
        );
        res.json(data);
    } catch (error) {
        console.error("❌ SharePoint folder fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch folder files", error: error.message });
    }
});

// Endpoint to get SharePoint files in a tree structure
router.get("/sharepoint-tree", async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token missing in query params" });
    }

    try {
        // Create the root node
        const rootNode = {
            id: "root",
            name: "All Files",
            folder: { childCount: 0 },
            children: []
        };

        // Function to recursively fetch folder contents and build the tree
        const fetchFolderContents = async (parentNode, itemPath = '') => {
            try {
                console.log(`Fetching contents of folder: ${parentNode.name} (${parentNode.id})`);
                
                // Determine the API endpoint based on whether it's the root or a subfolder
                let endpoint;
                if (parentNode.id === "root") {
                    endpoint = `https://graph.microsoft.com/v1.0/me/drive/root/children`;
                } else if (itemPath) {
                    endpoint = `https://graph.microsoft.com/v1.0/me/drive/root:/${itemPath}:/children`;
                } else {
                    endpoint = `https://graph.microsoft.com/v1.0/me/drive/items/${parentNode.id}/children`;
                }
                
                const folderItems = await fetchFromSharepoint(endpoint, token);
                
                // Process each item in the folder
                for (const item of folderItems.value) {
                    const node = {
                        id: item.id,
                        name: item.name,
                        folder: item.folder,
                        parentReference: item.parentReference,
                        children: []
                    };
                    
                    // Add to parent's children
                    parentNode.children.push(node);
                    
                    // If it's a folder, recursively fetch its contents
                    if (item.folder) {
                        const newPath = itemPath ? `${itemPath}/${item.name}` : item.name;
                        await fetchFolderContents(node, newPath);
                    }
                }
            } catch (error) {
                console.error(`Error fetching folder ${parentNode.id}:`, error.message);
                // Continue with other folders even if one fails
            }
        };
        
        // Start the recursive process from the root
        await fetchFolderContents(rootNode);
        
        res.json(rootNode);
    } catch (error) {
        console.log("Error in fetching SharePoint tree", error.message);
        res.status(500).json({
            message: "Error in fetching SharePoint tree",
            error: error.message
        });
    }
});

// Download a file directly
router.get("/download-file", async (req, res) => {
    const { token, id } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });
    if (!id) return res.status(400).json({ message: "id is required" });

    try {
        // First get file metadata to get the file name
        const metadataResponse = await axios({
            method: 'get',
            url: `https://graph.microsoft.com/v1.0/me/drive/items/${id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const fileName = metadataResponse.data.name;

        // Get the download URL
        const downloadResponse = await axios({
            method: 'get',
            url: `https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            responseType: 'arraybuffer'
        });

        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Send the file data
        res.send(downloadResponse.data);
    } catch (error) {
        console.error("❌ File download error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to download file", error: error.message });
    }
});

// Download a folder as zip
router.get("/download-folder", async (req, res) => {
    const { token, id } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });
    if (!id) return res.status(400).json({ message: "id is required" });

    

    try {
        // First get folder metadata to get the folder name
        const metadataResponse = await axios({
            method: 'get',
            url: `https://graph.microsoft.com/v1.0/me/drive/items/${id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const folderName = metadataResponse.data.name;

        // Set up the response headers for a zip file
        res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
        res.setHeader('Content-Type', 'application/zip');

        // Create a zip archive
        const archive = archiver('zip', {
            zlib: { level: 5 } // Compression level
        });

        // Pipe the archive to the response
        archive.pipe(res);

        // Function to recursively add files to the archive
        const addFolderToArchive = async (folderId, folderPath = '') => {
            try {
                // Get all items in the folder
                const folderContents = await axios({
                    method: 'get',
                    url: `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                // Process each item in the folder
                for (const item of folderContents.data.value) {
                    const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name;

                    if (item.folder) {
                        // If it's a folder, recursively add its contents
                        await addFolderToArchive(item.id, itemPath);
                    } else {
                        // If it's a file, download it and add to the archive
                        try {
                            const fileResponse = await axios({
                                method: 'get',
                                url: `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}/content`,
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                responseType: 'arraybuffer'
                            });

                            // Add the file to the archive
                            archive.append(fileResponse.data, { name: itemPath });
                        } catch (fileError) {
                            console.error(`Error downloading file ${item.name}:`, fileError.message);
                            // Continue with other files even if one fails
                        }
                    }
                }
            } catch (folderError) {
                console.error(`Error processing folder ${folderId}:`, folderError.message);
                // Continue with other folders even if one fails
            }
        };

        // Start the recursive process from the specified folder
        await addFolderToArchive(id);

        // Finalize the archive
        archive.finalize();
    } catch (error) {
        console.error("❌ Folder download error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to download folder", error: error.message });
    }
});

// Endpoint to move a file or folder to a new parent
router.patch("/move-file", async (req, res) => {
    const { token } = req.query;
    const { fileId, newParentId, oldParentId } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token missing in query params" });
    }

    if (!fileId || !newParentId) {
        return res.status(400).json({ message: "fileId and newParentId are required in request body" });
    }

    try {
        // Make the API call to move the item
        const response = await modifySharepoint(
            `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
            'PATCH',
            {
                parentReference: { 
                    id: newParentId === "root" ? null : newParentId,
                    driveId: "me" 
                }
            },
            token
        );

        res.json({
            success: true,
            message: "Item moved successfully",
            data: response
        });
    } catch (error) {
        console.log("Error moving item:", error.response?.data || error.message);
        res.status(500).json({
            message: "Error moving item",
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;
