/**
 * Created by Jeffers on 2/21/2017.
 * Routes: Handles page transitions and MySQL queries
 */
let express = require('express');
let router = express.Router();
let queries = require('../models/queries');

/*Loads home page*/
router.get('/', function (req, res) {
    res.render('pages/index');
});

/**
 * Loads email club page
 */
router.get('/contactClub', function (req,res) {
    let fromEmail = ""; let toEmail = "";
    // Catches undefined access
    if (req.session.user !== undefined) { fromEmail = req.session.user.email;}
    if (req.session.club !== undefined) { toEmail = req.session.club.clubEmail;}


    let emails = {
        to : toEmail ,
        from : fromEmail
    };
    res.render('pages/contactClub', {errors : null, emails : emails});
});
/*Loads club page*/
router.post('/clubPage', function (req, res) {
    queries.getClub(req, res);
});

/*Loads search page*/
router.get('/searchPage', function (req, res) {
    queries.getAllClubs(req, res);
});
/*Loads search page by name*/
router.post('/searchPage', function (req, res) {
    // Search is only requested if search value is not empty
    if (req.body.searchbar.length > 0) { queries.getClubByName(req,res); }
    else { queries.getAllClubs(req,res); }
});

/**
 * User requests email/password credentials sent to their email
 */
router.get('/credentialRequest', function (req, res) {
   res.render('pages/credentialRequest');
});
/**
 * User requests email/password credentials sent to their email
 */
router.post('/credentialRequest', function (req, res) {
    queries.requestAccount(req, res);
});

// Communicates this router to server.js
module.exports = router;