const express = require('express');
const axios = require('axios');
const router = express.Router();
const passport = require('passport');

// Configure the OpenId Connect Strategy
// with credentials obtained from OneLogin
const SamlStrategy = require('passport-saml').Strategy;
const fs = require('fs');

const {
    ONELOGIN_ENTRYPOINT,
    ONELOGIN_ISSUER,
    ONELOGIN_REDIRECT_URI
} = process.env;


passport.use(new SamlStrategy(
  {
    entryPoint: ONELOGIN_ENTRYPOINT,
    issuer: ONELOGIN_ISSUER, // same as Entity ID
    callbackUrl: ONELOGIN_REDIRECT_URI,
    cert: fs.readFileSync('./onelogin.pem', 'utf-8'), // from OneLogin
  },
  function(profile, done) {
    console.log("SAML Profile:", profile);
    return done(null, profile);
  }
));


// Trigger login
router.get('/login',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    res.redirect('/');
  }
);

// Callback after IdP authenticates
router.post('/saml/callback',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    // Successful login
    res.redirect(`http://localhost:3000/home`);
  }
);

module.exports = router;