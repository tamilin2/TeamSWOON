/**
 * Created by Jeffers on 2/25/2017.
 */
let express = require('express');
let router = express.Router();
let authenticator = require('./authenticator');
let queries = require('./../models/queries');

/*Loads create user profile page*/
router.get('/createUserProfile', function (req, res) {
    // No errors will be pass
    res.render('pages/createUserProfile', {errors: null});
});
/*Sends new user credentials to db*/
router.post('/createUserProfile', function (req, res) {

    /** Server validation of credentials
     *  -verifies passwords match
     *  -verifies age is correct
     */
    // TODO Integrate schedule and interest to student profile
    queries.insert_student(req, res);
});
/**
 * System sends confirmation email to ucsd address
 */
router.post('/sendEmail', function (req, res) {
    queries.sendEmail(req,res);
});

/*Loads create club profile page*/
router.get('/createClubProfile', authenticator.ensureLoggedIn, function (req, res) {
    // No errors will be pass
    res.render('pages/createClubProfile', {errors: null});
});
/*Sends new club credentials to db*/
router.post('/createClubProfile', function (req, res) {
    //TODO integrate interests with club creation
    queries.insert_club(req, res);
});


/*Loads edit user profile page if user is logged in*/
router.get('/editUserProfile', authenticator.ensureLoggedIn , function (req, res) {
    res.render('pages/editUserProfile');
});
/*Sends user profile changes to db*/
router.post('/editUserProfile', function (req, res) {
    let user = req.session.user;
    queries.update_student(req, res, {user : user});
});

/*Loads edit club profile if user is creator*/
router.get('/editClubProfile',function (req, res) {
    res.render('pages/editClubProfile')
});
/**
 * System sends club info to server
 */
router.post('/postClub', function (req, res) {
    let club = {
        clubName : req.body.clubName,
        clubEmail: req.body.clubEmail,
        clubLeaderEmail: req.body.clubLeaderEmail,
        description: req.body.description,
        phone : req.body.phone,
        socialLink : req.body.socialLink
    };
    req.session.club = club;
    res.render('pages/editClubProfile', {club : club});
});
/*Sends club profile changes to db*/
router.post('/editClubProfile',function (req, res) {
    queries.edit_club(req, res);
});
/**
 * User requests to delete club
 */
router.post('/deleteClub', function (req, res) {
    if (req.body.delete === 'delete') {
        queries.delete_club(req,res);
    }
});


// Loads user login page
router.get('/login', function (req, res) {
    res.render('pages/login', {errors: null, user: null});
});
/* Connection login */
router.post('/login', function (req, res) {
        queries.login(req, res);
});


/* Connection logout*/
router.get('/logout',
    function (req, res) {
        // Sets the current session to undefined to represent logging out
        if (req.session.user !== undefined) {
            req.session.user.fname = undefined;
            req.session.user.lname = undefined;
            req.session.user.email = undefined;
            req.session.user.phone = undefined;
        }
        req.session.user = undefined;

        // Send logged off user back to home page
        res.redirect('/');
    });

module.exports = router;