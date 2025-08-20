const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const {
    BOX_CLIENT_ID,
    BOX_CLIENT_SECRET,
    BOX_REDIRECT_URI
} = process.env;

router.post('/webhook', express.json(), (req, res) => {
    const payload = req.body;

    console.log('📦 Box Webhook Received:', JSON.stringify(payload, null, 2));

    // ✅ Send 200 OK to acknowledge receipt
    res.sendStatus(200);
});

router.use(cookieParser());

/**
 * GET /auth/box
 * Redirect user to Box OAuth consent page
 * Accepts ?frontEndUrl=https://your-frontend.com
 */
router.get('/auth/box', (req, res) => {
    const { frontEndUrl } = req.query;

    if (!frontEndUrl) {
        return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
    }

    const state = Math.random().toString(36).substring(2, 15); // Optional CSRF protection

    const authorizeUrl = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${BOX_CLIENT_ID}&redirect_uri=${encodeURIComponent(BOX_REDIRECT_URI)}&state=${state}`;

    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000 // 10 mins
    });

    res.redirect(authorizeUrl);
});

/**
 * GET /auth/box/callback
 * Handle OAuth callback and print token, then redirect to frontEndUrl
 */
router.get('/auth/box/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontEndUrl = req.cookies.frontEndUrl;

    if (error) return res.status(400).send('Access denied or OAuth error');
    if (!code) return res.status(400).send('Missing authorization code');
    if (!frontEndUrl) return res.status(400).send('Missing frontEndUrl cookie');

    try {
        const tokenUrl = 'https://api.box.com/oauth2/token';

        const payload = qs.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: BOX_CLIENT_ID,
            client_secret: BOX_CLIENT_SECRET,
            redirect_uri: BOX_REDIRECT_URI
        });

        const tokenResponse = await axios.post(tokenUrl, payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('📦 Box OAuth Tokens:');
        console.log({ access_token, refresh_token, expires_in });

        res.clearCookie('frontEndUrl');
        // Example: pass token info to frontend via URL query params
        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}`;

        return res.redirect(redirectWithTokens);
    } catch (err) {
        console.error('Box OAuth callback error:', err.response?.data || err.message);
        return res.status(500).send('Token exchange failed');
    }
});

// Helper function to make requests to Box API
const fetchFromBox = async (url, token) => {
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    return response.data;
};

router.get("/box/user", async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromBox("https://api.box.com/2.0/users/me", token);
        res.json(data);
    } catch (error) {
        console.error("❌ User fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch user info", error: error.message });
    }
});

router.get("/box/folders", async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromBox("https://api.box.com/2.0/folders/0", token);
        res.json(data);
    } catch (error) {
        console.error("❌ Folder fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch folders", error: error.message });
    }
});

router.get("/box/folders/:folderId/items", async (req, res) => {
    const { token } = req.query;
    const { folderId } = req.params;

    if (!token || !folderId) {
        return res.status(400).json({ message: "token and folderId are required" });
    }

    try {
        const data = await fetchFromBox(`https://api.box.com/2.0/folders/${folderId}/items`, token);
        res.json(data);
    } catch (error) {
        console.error("❌ Folder items fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch folder items", error: error.message });
    }
});

router.get("/box/files/:fileId", async (req, res) => {
    const { token } = req.query;
    const { fileId } = req.params;

    if (!token || !fileId) {
        return res.status(400).json({ message: "token and fileId are required" });
    }

    try {
        const data = await fetchFromBox(`https://api.box.com/2.0/files/${fileId}`, token);
        res.json(data);
    } catch (error) {
        console.error("❌ File metadata error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch file metadata", error: error.message });
    }
});

router.get("/box/files/:fileId/content", async (req, res) => {
    const { token } = req.query;
    const { fileId } = req.params;

    if (!token || !fileId) {
        return res.status(400).json({ message: "token and fileId are required" });
    }

    try {
        // This returns a redirect to actual file download URL
        const response = await axios.get(`https://api.box.com/2.0/files/${fileId}/content`, {
            headers: { Authorization: `Bearer ${token}` },
            maxRedirects: 0, // prevent auto redirect
            validateStatus: status => status === 302,
        });

        const downloadUrl = response.headers.location;
        res.json({ downloadUrl });
    } catch (error) {
        console.error("❌ File content error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to get file content URL", error: error.message });
    }
});

router.get("/box/events", async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "token is required" });

    try {
        const data = await fetchFromBox("https://api.box.com/2.0/events", token);
        res.json(data);
    } catch (error) {
        console.error("❌ Events fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch event logs", error: error.message });
    }
});

// Endpoint to get Box files in a tree structure
router.get("/box-tree", async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token missing in query params" });
    }

    try {
        // Create the root node
        const rootNode = {
            id: "0",
            name: "All Files",
            type: "folder",
            children: []
        };

        // Function to recursively fetch folder contents and build the tree
        const fetchFolderContents = async (parentNode) => {
            try {
                console.log(`Fetching contents of folder: ${parentNode.name} (${parentNode.id})`);
                const folderItems = await fetchFromBox(`https://api.box.com/2.0/folders/${parentNode.id}/items?limit=1000`, token);
                
                // Process each item in the folder
                for (const item of folderItems.entries) {
                    const node = {
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        parent: { id: parentNode.id },
                        children: []
                    };
                    
                    // Add to parent's children
                    parentNode.children.push(node);
                    
                    // If it's a folder, recursively fetch its contents
                    if (item.type === "folder") {
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
        console.log("Error in fetching Box tree", error.message);
        res.status(500).json({
            message: "Error in fetching Box tree",
            error: error.message
        });
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
        // Determine if it's a file or folder
        let itemType;
        try {
            await fetchFromBox(`https://api.box.com/2.0/files/${fileId}`, token);
            itemType = "files";
        } catch (err) {
            itemType = "folders";
        }

        // Make the API call to move the item
        const response = await axios.put(
            `https://api.box.com/2.0/${itemType}/${fileId}`,
            {
                parent: { id: newParentId }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            success: true,
            message: `${itemType === "files" ? "File" : "Folder"} moved successfully`,
            data: response.data
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
