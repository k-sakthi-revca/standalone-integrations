const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
const router = express.Router();

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URL
} = process.env;

router.use(cookieParser());

router.get('/auth/gdrive', async (req, res) => {
    const { frontEndUrl } = req.query;

    if (!frontEndUrl) {
        return res.status(400).json({ message: "Missing frontEndUrl in query params" });
    }
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URL)}&response_type=code&scope=https://www.googleapis.com/auth/drive&access_type=offline&prompt=consent`;

    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000 // 10 mins
    });

    res.redirect(authUrl);
});

/**
 * GET /auth/callback
 * Handle OAuth callback and exchange code for token, then redirect to frontEndUrl
 */
router.get('/auth/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontEndUrl = req.cookies.frontEndUrl;

    if (error) return res.status(400).send(`Access denied or OAuth error: ${error}`);
    if (!code) return res.status(400).send('Missing authorization code');
    if (!frontEndUrl) return res.status(400).send('Missing frontEndUrl cookie');

    try {
        const tokenUrl = 'https://oauth2.googleapis.com/token';

        const payload = qs.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URL
        });

        const tokenResponse = await axios.post(tokenUrl, payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('🔑 Google Access Token:');
        console.log({ access_token });

        res.clearCookie('frontEndUrl');
        // Redirect to frontend with tokens
        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}`;

        return res.redirect(redirectWithTokens);
    } catch (err) {
        console.error('Google OAuth callback error:', err.response?.data || err.message);
        return res.status(500).send('Token exchange failed');
    }
});

const fetchFromGoogleDrive = async(url, token) => {
    const response = await axios.get(`https://www.googleapis.com/drive/v3${url}`,{
        headers:{
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })

    return response.data;
};

// Function to build a tree structure from flat list of files
function buildTree(files) {
    const ROOT_ID = "root";
    const root = {
        id: ROOT_ID,
        name: "My Drive",
        mimeType: "application/vnd.google-apps.folder",
        children: [],
    };
    const map = { [ROOT_ID]: root };

    // create nodes
    for (const f of files) {
        map[f.id] = { ...f, children: [] };
    }

    // attach children
    for (const f of files) {
        const parentId = f.parents ? f.parents[0] : ROOT_ID;
        (map[parentId] || root).children.push(map[f.id]);
    }

    return root;
}

router.get('/get-all-files-and-folders', async(req, res)=>{

    const { token } = req.query;

    if(!token){
        return res.status(400).json({message:"Token missing in query params"})
    }
    try{
        const url = '/files?pageSize=1000&fields=files(id,name,mimeType,parents)'
        const data = await fetchFromGoogleDrive(url, token)

        res.json(data)
    }catch(error){
        console.log("Error in fetching files and folders", error.message);
        res.status(500).json({
            message:"Error in fetching files and folders",
            error:error.message
        })
    }
})

// New endpoint to get files in a tree structure
router.get('/drive-tree', async(req, res)=>{
    const { token } = req.query;

    if(!token){
        return res.status(400).json({message:"Token missing in query params"})
    }
    try{
        const url = '/files?pageSize=1000&fields=files(id,name,mimeType,parents)&q=trashed=false'
        const data = await fetchFromGoogleDrive(url, token)
        
        // Build tree structure from flat list
        const tree = buildTree(data.files)
        
        res.json(tree)
    }catch(error){
        console.log("Error in fetching drive tree", error.message);
        res.status(500).json({
            message:"Error in fetching drive tree",
            error:error.message
        })
    }
})

// Endpoint to move a file or folder to a new parent
router.patch('/move-file', async(req, res)=>{
    const { token } = req.query;
    const { fileId, newParentId, oldParentId } = req.body;

    if(!token){
        return res.status(400).json({message:"Token missing in query params"})
    }

    if(!fileId || !newParentId){
        return res.status(400).json({message:"fileId and newParentId are required in request body"})
    }
    
    // Default to "root" if oldParentId is not provided
    const sourceParentId = oldParentId || "root";

    try {
        // Construct the URL with query parameters
        const url = `/files/${fileId}?addParents=${newParentId}&removeParents=${sourceParentId}`;
        
        // Make PATCH request to Google Drive API
        const response = await axios.patch(`https://www.googleapis.com/drive/v3${url}`, {}, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
})
module.exports = router;
