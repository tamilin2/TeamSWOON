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
    queries.insert_student(req, res);
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
    queries.update_student(req, res);
});


/*Loads edit club profile page if user is club leader*/
router.get('/editClubProfile', authenticator.ensureLoggedIn ,function (req, res) {
    res.render('pages/editClubProfile');
});
/*Sends club profile changes to db*/
router.post('/editClubProfile',function (req, res) {
    //TODO query replace club
    console.log('Update');
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
        req.flash('successMsg', "Log out successful");
        // Sets the current session to undefined to represent logging out
        req.session.fname= undefined;
        req.session.lname= undefined;
        req.session.email= undefined;
        req.session.phone= undefined;
        req.session.password= undefined;

        // Send logged off user back to home page
        res.redirect('/');
    });

module.exports = router;