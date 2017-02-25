/**
 * Created by Jeffers on 2/21/2017.
 * Routes: Handles page transitions and MySQL queries
 */
let express = require('express');
let path = require('path');
let router = express.Router();
let authenticator = require('./authenticator');
let mysql = require('mysql');

// Creates a pool of connections to draw from to connect to MySQL
let pool = mysql.createPool({
    host            :  'us-cdbr-azure-west-b.cleardb.com',
    user            :  'bba003a662e9c4',
    password        :  '17ce3e64',
    database        :  'swoondb',
    // Since connection limit is 4 on free trial server
    connectionLimit : 4
});

// Initial connection to test database connectivity
// pool.getConnection(function (err) {
//     if (err) { console.error('Failed to connect to database'); }
//     else { console.log('Database connected'); }
// });

// Communicates this router to server.js
module.exports = router;

/*Loads home page*/
router.get('/', function (req, res) {
    res.render('pages/index');
});

/*Loads edit user profile page*/
router.get('/edit_user_profile', function (req, res) {
    res.render('pages/edit_user_profile');
});

/*Loads create user profile page*/
router.get('/create_user_profile', function (req, res) {
    res.render('pages/create_user_profile');
});

/*Sends new user credentials to upload page*/
router.post('/create_user_profile', function (req, res) {
    // MySQL query to insert into student table
    let query = "replace into student (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)";

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
    if (authenticator.verify_password(password, conf_password) ) {
        pool.getConnection(function (err, conn) {
            if (err) {
                console.error('Failed to connect to database');
            }
            else {
                console.log('Entering query', [firstname, lastname, email, phone, password]);
                conn.query(query, [firstname, lastname, email, phone, password], function (err, results) {
                    if (err) {
                        console.error('Failed to create account', err);
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
    }
    

});

/*Loads edit club profile page*/
router.get('/edit_club_profile', function (req, res) {
    res.render('pages/edit_club_profile');
});