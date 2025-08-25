const express = require('express');
const router = express.Router();
const axios = require('axios');
const cookieParser = require('cookie-parser');
const qs = require('qs')

const {
    QB_CLIENT_ID,
    QB_CLIENT_SECRET,
    QB_REDIRECT_URI,
    QB_SCOPES
} = process.env;

router.use(cookieParser());

router.get('/auth/quickbooks', (req, res) => {
    const { frontEndUrl } = req.query;
    console.log("QB_CLIENT_ID", QB_CLIENT_ID)

    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${QB_CLIENT_ID}&redirect_uri=${QB_REDIRECT_URI}&scope=${QB_SCOPES}&state=teststate123&response_type=code`;

    res.cookie('frontEndUrl', frontEndUrl, {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000 // 10 mins
    })

    res.redirect(authUrl);

});

router.get('/auth/callback', async (req, res) => {
    const { state, realmId, error, code } = req.query;
    const { frontEndUrl } = req.cookies;
    if (!code) return res.status(400).json({message:"Authentication code missing"});
    if (error) return res.status(500).json({message:"Error in authentication", error});

    console.log("realmId", realmId);

    try{
        const body = qs.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: QB_REDIRECT_URI
        })
        const tokenResponse = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64')}`
            }
        })

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log("We got quickbooks access token");
        console.log(access_token, realmId);

        res.clearCookie('frontEndUrl');
        const redirectWithTokens = `${frontEndUrl}?access_token=${access_token}&refresh_token=${refresh_token}&realmId=${realmId}`;

        res.redirect(redirectWithTokens);

    }catch(error){
        console.log("Error while exchange token", error.message);
        res.status(500).json({
            message: 'Error while exchange token',
            error: error.message
        })
    }
});

router.get('/company-details', async(req, res) => {
    const { token, realmId } = req.query;
    try{
        const response = await axios.get(`https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,{
            headers:{
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data)


    } catch(error){
        console.log("Error in fetching company details", error.message);
        res.status(500).json({
            message: "Error in fetching company details",
            error: error.message
        })
    }

});

module.exports = router;