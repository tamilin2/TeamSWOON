/**
 * Created by Jeffers on 2/25/2017.
 */
let express = require('express');
let router = express.Router();
let path = require('path');
let authenticator = require('./authenticator');

/*Loads create user profile page*/
router.get('/create_user_profile', function (req, res) {
    res.render('pages/create_user_profile');
});

/*Sends new user credentials to upload page*/
router.post('/create_user_profile', function (req, res) {
    // MySQL query to insert into student table
    let query = "insert into student (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)";

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let phone = authenticator.parse_phoneNum(req.body.phone);
    let age = req.body.age;
    let password = req.body.password;
    let conf_password = req.body.conf_pass;

    /** Server validation of credentials
     *  -verifies passwords match
     *  -verifies age is correct
     */
    //TODO Handle same ucsd email case
    if (authenticator.verify_password(password, conf_password) &&  authenticator.verify_ucsd_email(email)) {
        pool.getConnection(function (err, conn) {
            if (err) {
                console.error('Failed to connect to database');
            }
            else {
                console.log('Entering query', [firstname, lastname, email, phone, password]);
                conn.query(query, [firstname, lastname, email, phone, password], function (err, results) {
                    if (err) {
                        console.error('Failed to create account onto database');
                        conn.release();
                    }
                    else {
                        res.render('pages/index');
                    }
                });
            }
        });
    }
    else {
        //TODO Handle inccorect credentials e.g. mismatching passwords
        console.error("Credentials are incorrectly formatted");
    }


});

// Login
router.get('/login', function (req, res) {
    res.render('pages/login');
});



module.exports = router;