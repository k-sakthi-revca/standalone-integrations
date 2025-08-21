const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();

const {
    EGNYTE_CLIENT_ID,
    EGNYTE_CLIENT_SECRET,
    EGNYTE_REDIRECT_URI,
} = process.env;

router.use(cookieParser());

// Helper function to make requests to Egnyte API
const fetchFromEgnyte = async (url, token, subdomain) => {
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    return response.data;
};

/**
 * GET /auth/egnyte
 * Redirect user to Egnyte OAuth consent page
 * Accepts ?subdomain=sakthi333&frontEndUrl=https://your-frontend.com
 */
router.get('/auth/egnyte', (req, res) => {
    const { subdomain, frontEndUrl } = req.query;

    if (!subdomain) {
        return res.status(400).json({ error: 'Missing subdomain in query params' });
    }

    if (!frontEndUrl) {
        return res.status(400).json({ error: 'Missing frontEndUrl in query params' });
    }

    const state = Math.random().toString(36).substring(2, 15); // Optional CSRF protection
console.log(subdomain)
    const authorizeUrl = `https://${subdomain}.egnyte.com/puboauth/authorize?response_type=code&client_id=${EGNYTE_CLIENT_ID}&redirect_uri=${encodeURIComponent(EGNYTE_REDIRECT_URI)}&state=${state}`;

    // Save both subdomain and frontend URL in cookies
    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000
    });

    res.cookie('egnyteSubdomain', subdomain, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000
    });

    res.redirect(authorizeUrl);
});


router.get('/auth/egnyte/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontEndUrl = req.cookies.frontEndUrl;
    const subdomain = req.cookies.egnyteSubdomain;

    if (error) return res.status(400).send('Access denied or OAuth error');
    if (!code) return res.status(400).send('Missing authorization code');
    if (!frontEndUrl || !subdomain) return res.status(400).send('Missing cookies');

    try {
        const tokenUrl = `https://${subdomain}.egnyte.com/puboauth/token`;

        const payload = qs.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: EGNYTE_CLIENT_ID,
            client_secret: EGNYTE_CLIENT_SECRET,
            redirect_uri: EGNYTE_REDIRECT_URI
        });

        const tokenResponse = await axios.post(tokenUrl, payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('📁 Egnyte OAuth Tokens:');
        console.log({ access_token, refresh_token, expires_in });

        res.clearCookie('frontEndUrl');
        res.clearCookie('egnyteSubdomain');

        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}`;
        return res.redirect(redirectWithTokens);
    } catch (err) {
        console.error('Egnyte OAuth callback error:', err.response?.data || err.message);
        return res.status(500).send('Token exchange failed');
    }
});


// Get user information
router.get("/egnyte/user", async (req, res) => {
    const { token, subdomain } = req.query;

    if (!token || !subdomain) {
        return res.status(400).json({ message: "token and subdomain are required" });
    }

    try {
        const data = await fetchFromEgnyte(`https://${subdomain}.egnyte.com/pubapi/v1/userinfo`, token, subdomain);
        res.json(data);
    } catch (error) {
        console.error("❌ User fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch user info", error: error.message });
    }
});

// Get folder contents
router.get("/egnyte/folders", async (req, res) => {
    const { token, subdomain } = req.query;
    const path = req.query.path || "/Shared";

    if (!token || !subdomain) {
        return res.status(400).json({ message: "token and subdomain are required" });
    }

    try {
        const data = await fetchFromEgnyte(`https://${subdomain}.egnyte.com/pubapi/v1/fs${path}`, token, subdomain);
        res.json(data);
    } catch (error) {
        console.error("❌ Folder fetch error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch folder contents", error: error.message });
    }
});

// Get file metadata
router.get("/egnyte/files/:filePath(*)/info", async (req, res) => {
    const { token, subdomain } = req.query;
    const { filePath } = req.params;

    if (!token || !subdomain || !filePath) {
        return res.status(400).json({ message: "token, subdomain, and filePath are required" });
    }

    try {
        const data = await fetchFromEgnyte(`https://${subdomain}.egnyte.com/pubapi/v1/fs/${filePath}?list_content=false`, token, subdomain);
        res.json(data);
    } catch (error) {
        console.error("❌ File metadata error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch file metadata", error: error.message });
    }
});

// Endpoint to get Egnyte files in a tree structure
router.get("/egnyte-tree", async (req, res) => {
    const { token, subdomain } = req.query;

    if (!token || !subdomain) {
        return res.status(400).json({ message: "Token and subdomain are required in query params" });
    }

    try {
        // Create the root node
        const rootNode = {
            id: "Shared",
            name: "Shared",
            path: "/Shared",
            type: "folder",
            children: []
        };

        // Function to recursively fetch folder contents and build the tree
        const fetchFolderContents = async (parentNode) => {
            try {
                console.log(`Fetching contents of folder: ${parentNode.name} (${parentNode.path})`);
                const folderData = await fetchFromEgnyte(`https://${subdomain}.egnyte.com/pubapi/v1/fs${parentNode.path}`, token, subdomain);
                
                // Process folders
                if (folderData.folders && folderData.folders.length > 0) {
                    for (const folder of folderData.folders) {
                        const folderNode = {
                            id: folder.name,
                            name: folder.name,
                            path: folder.path,
                            type: "folder",
                            parent: { id: parentNode.id, path: parentNode.path },
                            children: []
                        };
                        
                        // Add to parent's children
                        parentNode.children.push(folderNode);
                        
                        // Recursively fetch contents of this folder
                        await fetchFolderContents(folderNode);
                    }
                }
                
                // Process files
                if (folderData.files && folderData.files.length > 0) {
                    for (const file of folderData.files) {
                        const fileNode = {
                            id: file.name,
                            name: file.name,
                            path: file.path,
                            type: "file",
                            parent: { id: parentNode.id, path: parentNode.path },
                            children: []
                        };
                        
                        // Add to parent's children
                        parentNode.children.push(fileNode);
                    }
                }
            } catch (error) {
                console.error(`Error fetching folder ${parentNode.path}:`, error.message);
                // Continue with other folders even if one fails
            }
        };
        
        // Start the recursive process from the root
        await fetchFolderContents(rootNode);
        
        res.json(rootNode);
    } catch (error) {
        console.log("Error in fetching Egnyte tree", error.message);
        res.status(500).json({
            message: "Error in fetching Egnyte tree",
            error: error.message
        });
    }
});

// Endpoint to move a file or folder to a new parent
router.patch("/move-file", async (req, res) => {
    const { token, subdomain } = req.query;
    const { sourcePath, destinationPath } = req.body;

    if (!token || !subdomain) {
        return res.status(400).json({ message: "Token and subdomain are required in query params" });
    }

    if (!sourcePath || !destinationPath) {
        return res.status(400).json({ message: "sourcePath and destinationPath are required in request body" });
    }

    try {
        // Make the API call to move the item
        const response = await axios.post(
            `https://${subdomain}.egnyte.com/pubapi/v1/fs${sourcePath}`,
            {
                action: "move",
                destination: destinationPath
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
            message: "Item moved successfully",
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
