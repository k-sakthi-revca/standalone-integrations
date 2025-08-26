const express = require('express');
const router = express.Router();
const axios = require('axios');
const cookieParser = require('cookie-parser');
const qs = require('qs')
router.use(cookieParser());

const {
    XERO_CLIENT_ID,
    XERO_CLIENT_SECRET,
    XERO_REDIRECT_URI,
    XERO_SCOPES
} = process.env;

router.get('/auth/xero', (req, res) => {
    const { frontEndUrl } = req.query;
    const authUrl = `https://login.xero.com/identity/connect/authorize?client_id=${XERO_CLIENT_ID}&redirect_uri=${XERO_REDIRECT_URI}&scope=${XERO_SCOPES}&state=test123&response_type=code`;
    
    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000 // 10 mins
    });

    res.redirect(authUrl);

});

router.get('/auth/callback', async (req, res) => {
    const { state, error, code } = req.query;
    const { frontEndUrl } = req.cookies;
    if (!code) return res.status(400).json({message:"Authentication code missing"});
    if (error) return res.status(500).json({message:"Error in authentication", error});

    try{
        const body = qs.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: XERO_REDIRECT_URI
        })
        const tokenResponse = await axios.post('https://identity.xero.com/connect/token', body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64')}`
            }
        })

        const { access_token, refresh_token } = tokenResponse.data;

        console.log("We got xero access token");
        console.log(access_token);

        res.clearCookie('frontEndUrl');
        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}`;

        res.redirect(redirectWithTokens);

    }catch(error){
        console.log("Error while exchange token", error.message);
        res.status(500).json({
            message: 'Error while exchange token',
            error: error.message
        })
    }
});

router.get('/get-organizations', async(req, res) => {
    const { token } = req.query;

    if(!token) return res.status(400).json({message: "Token in missing in the request"})

    try{

        const response = await axios.get('https://api.xero.com/connections',{
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })

        res.json(response.data);

    }catch(error){
        console.log("Error in getting organiztions", error.message);
        res.status(500).json({
            message: "Error in getting organiztions",
            error: error.message
        })
    }

});

module.exports = router;