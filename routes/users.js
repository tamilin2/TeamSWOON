/**
 * Created by Jeffers on 2/25/2017.
 */
let express = require('express');
let router = express.Router();
let authenticator = require('./../public/js/authenticator');
let queries = require('./../models/queries');

/*Loads create User profile page*/
router.get('/create_user_profile', function (req, res) {
    // No errors will be pass
    res.render('pages/create_user_profile', {errors: null});
});

/*Sends new User credentials to upload page*/
router.post('/create_user_profile', function (req, res) {

    /** Server validation of credentials
     *  -verifies passwords match
     *  -verifies age is correct
     */
    //TODO Handle same ucsd email case
    queries.insert_student(req, res);
});

/*Loads edit User profile page*/
router.get('/edit_user_profile', function (req, res) {
    res.render('pages/edit_user_profile');
});

/*Loads edit club profile page*/
router.get('/edit_club_profile', function (req, res) {
    res.render('pages/edit_club_profile');
});

// Login
router.get('/login', function (req, res) {
    res.render('pages/login', {errors: null, user:false});
});

/* User login */
router.post('/login',
    function (req, res) {
        queries.login(req, res);
});

/* User logout*/
router.get('/logout',
    function (req, res) {
        req.flash('success_msg', "You are logged out");
        req.session.name = null;
        res.redirect('/users/login');
    });

module.exports = router;