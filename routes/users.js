/**
 * Created by Jeffers on 2/25/2017.
 */
let express = require('express');
let router = express.Router();
let authenticator = require('./authenticator');
let queries = require('./../models/queries');

/*Loads create user profile page*/
router.get('/create_user_profile', function (req, res) {
    // No errors will be pass
    res.render('pages/create_user_profile', {errors: null});
});
/*Sends new user credentials to upload page*/
router.post('/create_user_profile', function (req, res) {

    /** Server validation of credentials
     *  -verifies passwords match
     *  -verifies age is correct
     */
    queries.insert_student(req, res);
});


/*Loads edit user profile page*/
router.get('/edit_user_profile', function (req, res) {
    res.render('pages/edit_user_profile');
});
/*Loads edit user profile page*/
router.post('/edit_user_profile', function (req, res) {
    res.render('pages/index');
});


/*Loads edit club profile page*/
router.get('/edit_club_profile', function (req, res) {
    res.render('pages/edit_club_profile');
});


// Loads user login
router.get('/login', function (req, res) {
    res.render('pages/login', {errors: null, user:null});
});
/* Connection login */
router.post('/login', function (req, res) {
        queries.login(req, res);
});


/* Connection logout*/
router.get('/logout',
    function (req, res) {
        req.flash('success_msg', "You are logged out");
        // Sets the current session to null to represent logging out
        req.session.name = null;
        res.redirect('/users/login');
    });

module.exports = router;