/**
 * Created by Jeffers on 2/25/2017.
 */
let express = require('express');
let router = express.Router();
let authenticator = require('./authenticator');
let queries = require('./../models/queries');
let path = require('path');
let multer = require('multer');
let fs = require('fs');

/*Loads create user profile page*/
router.get('/createUserProfile', function (req, res) {
    // No errors will be pass and session profile will be empty
    let profile = {
        fname:"",
        lname:"",
        phone:"",
        email:"",
        about:""
    };

    // Session profiles saves last entered input from create User profile
    if (req.session.profile !== undefined) {
        profile = {
            fname: req.session.profile.fname,
            lname: req.session.profile.lname,
            phone: req.session.profile.phone,
            email: req.session.profile.email,
            about: req.session.profile.about
        };
    }

    res.render('pages/createUserProfile', {errors: null, profile: profile});
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
 * System sends email to specified email address with a given message
 */
router.post('/sendEmail', function (req, res) {
    queries.sendEmail(req,res);
});

/**
 * System processes given image upload
 */
var storage = multer.diskStorage({
    // Sets the destination of uploaded images
    destination: function (req, file, cb) {
        cb(null, 'public/img')
    },
    // Sets the name of uploaded images with file extension
    filename: function (req, file, cb) {
        // Assures all images posted are unique by using date
        cb(null, file.originalname)
    }
});
let upload = multer({
    storage: storage,
    // Assures user uploads images only
    fileFilter: function (req, file, cb) {

        let filetypes = /jpeg|jpg|png|gif|bmp/;
        let mimetype = filetypes.test(file.mimetype);
        let extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        // checks file type and file extension
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: File upload only supports the following filetypes - jpeg, jpg, png, gif, bmp");
    }
}).single('profilePic');


/*Loads create club profile page*/
router.get('/createClubProfile', authenticator.ensureLoggedIn, function (req, res) {
    // No errors will be pass and session profile will be empty
    let profile = {
        name :"",
        phone: req.session.user.phone,
        email: req.session.user.email,
        about:""
    };

    // Session profiles saves last entered input from create User profile
    if (req.session.profile !== undefined) {
        profile = {
            name: req.session.profile.name,
            phone: req.session.profile.phone,
            email: req.session.profile.email,
            about: req.session.profile.about
        };
    }
    res.render('pages/createClubProfile', {errors: null, profile: profile});
});
/*Sends new club credentials to db*/
router.post('/createClubProfile', function (req, res) {
   upload(req, res, function (err) {
       if (err) {
           req.flash('errorMsg', err);
           res.redirect('/users/createClubProfile');
       }
       else {
           queries.insert_club(req, res);
       }
   })
});


/*Loads edit user profile page if user is logged in*/
router.get('/editUserProfile', authenticator.ensureLoggedIn , function (req, res) {
    res.render('pages/editUserProfile', {user: req.session.user});
});
/*Sends user profile changes to db*/
router.post('/editUserProfile', function (req, res) {
    queries.update_student(req, res, {user: req.session.user});
});


/*Loads change password page if user is logged in*/
router.get('/changePassword', authenticator.ensureLoggedIn , function (req, res) {
    res.render('pages/changePassword', {errors: null});
});
/*Sends password changes to db*/
router.post('/changePassword', function (req, res) {
    queries.update_password(req, res);
});


/*Loads user profile page if user is logged in*/
router.get('/userProfilePage', authenticator.ensureLoggedIn , function (req, res) {
    queries.getClubsCreated(req, res);
});


/**
 * Loads edit club profile if user is creator
 */
router.get('/editClubProfile',function (req, res) {
    console.log(typeof req.session.schedules);
    res.render('pages/editClubProfile', {club: req.session.club, schedules: req.session.schedules});
});
/**
 * Sends club profile changes to db
 */
router.post('/editClubProfile',function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            req.flash('errorMsg', err);
            res.redirect('/users/editClubProfile');
        }
        else {
            queries.edit_club(req, res);
        }
    })
});
/**
 * System sends club info to server
 */
router.post('/postClub', function (req, res) {
    res.render('pages/editClubProfile', {club : req.session.club});
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
router.get('/logout', function (req, res) {
        // Sets the current session to undefined to represent logging out
        if (req.session.user !== undefined) {
            req.session.user.fname = undefined;
            req.session.user.lname = undefined;
            req.session.user.email = undefined;
            req.session.user.phone = undefined;
            req.session.user.about = undefined;
        }
        req.session.user = undefined;

        // Send logged off user back to home page
        res.redirect('/');
    });

module.exports = router;