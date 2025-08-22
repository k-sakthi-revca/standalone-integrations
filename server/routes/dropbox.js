const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const {
    DROPBOX_CLIENT_ID,
    DROPBOX_CLIENT_SECRET,
    DROPBOX_REDIRECT_URI
} = process.env;

router.use(cookieParser());

/**
 * GET /auth/dropbox
 * Redirect user to Dropbox OAuth consent page
 * Accepts ?frontEndUrl=https://your-frontend.com
 */
router.get('/auth/dropbox', (req, res) => {
    const { frontEndUrl } = req.query;

    if (!frontEndUrl) {
        return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
    }

    const state = Math.random().toString(36).substring(2, 15); // Optional CSRF protection

    const authorizeUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_CLIENT_ID}&redirect_uri=${encodeURIComponent(DROPBOX_REDIRECT_URI)}&token_access_type=offline&response_type=code&state=${state}`;

    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000 // 10 mins
    });

    res.redirect(authorizeUrl);
});

/**
 * GET /auth/dropbox/callback
 * Handle OAuth callback and print token, then redirect to frontEndUrl
 */
router.get('/auth/dropbox/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontEndUrl = req.cookies.frontEndUrl;

    if (error) return res.status(400).send('Access denied or OAuth error');
    if (!code) return res.status(400).send('Missing authorization code');
    if (!frontEndUrl) return res.status(400).send('Missing frontEndUrl cookie');

    try {
        const tokenUrl = 'https://api.dropboxapi.com/oauth2/token';

        const payload = qs.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: DROPBOX_CLIENT_ID,
            client_secret: DROPBOX_CLIENT_SECRET,
            redirect_uri: DROPBOX_REDIRECT_URI
        });

        const tokenResponse = await axios.post(tokenUrl, payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('📦 Dropbox OAuth Tokens:');
        console.log({ access_token, refresh_token, expires_in });

        res.clearCookie('frontEndUrl');
        // Example: pass token info to frontend via URL query params
        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}`;

        return res.redirect(redirectWithTokens);
    } catch (err) {
        console.error('Dropbox OAuth callback error:', err.response?.data || err.message);
        return res.status(500).send('Token exchange failed');
    }
});

// Helper function to make requests to Dropbox API
const fetchFromDropbox = async (endpoint, token, params = {}) => {
    try {
        const response = await axios({
            method: 'post',
            url: `https://api.dropboxapi.com/2${endpoint}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: params
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching from Dropbox API: ${error.message}`);
        throw error;
    }
};

// Get user info
router.get("/dropbox/user", async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromDropbox('/users/get_current_account', token, null);
        res.json(data);
    } catch (error) {
        console.error("❌ User fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch user info", error: error.message });
    }
});

// Get files from root
router.get("/dropbox/files", async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromDropbox('/files/list_folder', token, { path: "" });
        res.json(data);
    } catch (error) {
        console.error("❌ Files fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch files", error: error.message });
    }
});

// Get folder contents
router.get("/dropbox/folders/:path", async (req, res) => {
    const { token } = req.query;
    let { path } = req.params;

    if (!token) return res.status(400).json({ message: "token is required" });

    // Handle URL-encoded paths
    path = decodeURIComponent(path);
    
    try {
        const data = await fetchFromDropbox('/files/list_folder', token, { path: path || "" });
        res.json(data);
    } catch (error) {
        console.error("❌ Folder contents fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch folder contents", error: error.message });
    }
});

// Get file info
router.get("/dropbox/files/:path/info", async (req, res) => {
    const { token } = req.query;
    let { path } = req.params;

    if (!token) return res.status(400).json({ message: "token is required" });

    // Handle URL-encoded paths
    path = decodeURIComponent(path);

    try {
        const data = await fetchFromDropbox('/files/get_metadata', token, { path });
        res.json(data);
    } catch (error) {
        console.error("❌ File info fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch file info", error: error.message });
    }
});

// Get file content URL
router.get("/dropbox/files/:path/content", async (req, res) => {
    const { token } = req.query;
    let { path } = req.params;

    if (!token) return res.status(400).json({ message: "token is required" });

    // Handle URL-encoded paths
    path = decodeURIComponent(path);

    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.dropboxapi.com/2/files/get_temporary_link',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: { path }
        });

        res.json({ downloadUrl: response.data.link });
    } catch (error) {
        console.error("❌ File content URL fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to get file content URL", error: error.message });
    }
});

// Download a file directly
router.get("/download-file", async (req, res) => {
    const { token, path } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });
    if (!path) return res.status(400).json({ message: "path is required" });

    try {
        // First get file metadata to get the file name
        const metadataResponse = await axios({
            method: 'post',
            url: 'https://api.dropboxapi.com/2/files/get_metadata',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: { path }
        });

        const fileName = metadataResponse.data.name;

        // Use the temporary link API instead of direct download
        // This is more reliable and avoids some API restrictions
        const tempLinkResponse = await axios({
            method: 'post',
            url: 'https://api.dropboxapi.com/2/files/get_temporary_link',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: { path }
        });

        // Get the temporary download URL
        const downloadUrl = tempLinkResponse.data.link;

        // Download the file from the temporary URL
        const fileResponse = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'arraybuffer'
        });

        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Send the file data
        res.send(fileResponse.data);
    } catch (error) {
        console.error("❌ File download error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to download file", error: error.message });
    }
});

// Download a folder as zip
router.get("/download-folder", async (req, res) => {
    const { token, path } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });
    if (!path) return res.status(400).json({ message: "path is required" });

    try {
        // Get folder metadata to get the folder name
        const metadataResponse = await axios({
            method: 'post',
            url: 'https://api.dropboxapi.com/2/files/get_metadata',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: { path }
        });

        const folderName = metadataResponse.data.name;

        // Create a zip download of the folder
        // Note: The correct format for the Dropbox-API-Arg header
        const response = await axios({
            method: 'post',
            url: 'https://content.dropboxapi.com/2/files/download_zip',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Dropbox-API-Arg': JSON.stringify({ path }),
                'Content-Type': '' // Empty content type as required by Dropbox API
            },
            responseType: 'arraybuffer'
        });

        // Set appropriate headers for zip file download
        res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
        res.setHeader('Content-Type', 'application/zip');
        
        // Send the zip file data
        res.send(response.data);
    } catch (error) {
        // Provide more detailed error information
        let errorMessage = error.message;
        if (error.response && error.response.data) {
            try {
                // Try to parse the error data if it's a buffer
                if (Buffer.isBuffer(error.response.data)) {
                    errorMessage = error.response.data.toString('utf8');
                } else {
                    errorMessage = JSON.stringify(error.response.data);
                }
            } catch (e) {
                // If parsing fails, use the original error message
                console.error("Error parsing error response:", e);
            }
        }
        
        console.error("❌ Folder download error:", errorMessage);
        res.status(500).json({ 
            message: "Failed to download folder", 
            error: errorMessage,
            status: error.response ? error.response.status : 'unknown'
        });
    }
});

// Endpoint to get Dropbox files in a tree structure
router.get("/dropbox-tree", async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token missing in query params" });
    }

    try {
        // Create the root node
        const rootNode = {
            id: "",
            name: "All Files",
            type: "folder",
            children: []
        };

        // Function to recursively fetch folder contents and build the tree
        const fetchFolderContents = async (parentNode) => {
            try {
                console.log(`Fetching contents of folder: ${parentNode.name} (${parentNode.id})`);
                const folderItems = await fetchFromDropbox('/files/list_folder', token, { path: parentNode.id });
                
                // Process each item in the folder
                for (const item of folderItems.entries) {
                    const node = {
                        id: item.path_display,
                        name: item.name,
                        type: item['.tag'], // 'folder' or 'file'
                        parent: { id: parentNode.id },
                        children: []
                    };
                    
                    // Add to parent's children
                    parentNode.children.push(node);
                    
                    // If it's a folder, recursively fetch its contents
                    if (item['.tag'] === "folder") {
                        await fetchFolderContents(node);
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
        console.log("Error in fetching Dropbox tree", error.message);
        res.status(500).json({
            message: "Error in fetching Dropbox tree",
            error: error.message
        });
    }
});

// Endpoint to move a file or folder to a new location
router.post("/move-file", async (req, res) => {
    const { token } = req.query;
    const { from_path, to_path } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token missing in query params" });
    }

    if (!from_path || !to_path) {
        return res.status(400).json({ message: "from_path and to_path are required in request body" });
    }

    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.dropboxapi.com/2/files/move_v2',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                from_path,
                to_path,
                allow_shared_folder: false,
                autorename: true,
                allow_ownership_transfer: false
            }
        });

        res.json({
            success: true,
            message: "File moved successfully",
            data: response.data
        });
    } catch (error) {
        console.log("Error moving file:", error.response?.data || error.message);
        res.status(500).json({
            message: "Error moving file",
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;
