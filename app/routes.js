/**
 * Created by Jeffers on 2/21/2017.
 * Routes: Handles page transitions and MySQL queries
 */
let express = require('express');
let path = require('path');
let router = express.Router();
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
    let phone = parse_phoneNum(req.body.phone);
    let age = req.body.age;
    let password = req.body.password;
    let conf_password = req.body.conf_pass;

    /** Server validation of credentials
     *  -verifies passwords match
     *  -verifies age is correct
     */
    if (verify_password(password, conf_password) ) {
        pool.getConnection(function (err, conn) {
            if (err) {
                console.error('Failed to connect to database');
            }
            else {
                console.log('Entering query', [firstname, lastname, email, phone, password]);
                conn.query(query, [firstname, lastname, email, phone, password], function (err, results) {
                    if (err) {
                        console.error('Failed to create account');
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
        //TODO Handle failed queries
    }
    

});

/*Loads edit club profile page*/
router.get('/edit_club_profile', function (req, res) {
    res.render('pages/edit_club_profile');
});

/**
 * Verifies if user password matches
 * @param password: original password
 * @param conf_password: copy password
 * Returns: true if equal, else false
 */
function verify_password(password, conf_password) {
    return password === conf_password;
}

/**
 * Extracts a phone number from a given string
 * @param phone_number: given input string
 * @returns
 *      - a 10 digit phone number, if formatted correctly
 *      - null, if formatted incorrectly
 */
function parse_phoneNum(phone_number) {
    if (phone_number == null) { return phone_number; }
    let number = "";

    for (let idx = 0; idx < phone_number.length; idx++) {
        let curr_dig = phone_number.charAt(idx);
        // Verifies if current symbol is a number
        if ( !isNaN(curr_dig)) {
            number += curr_dig;
        }
    }

    // Assures final phone number is valid, else it's null
    if (number.length != 10) { number=""; }

    return number;
}