/**
 * Created by Jeffers on 2/25/2017.
 */
let express = require('express');
let router = express.Router();
let authenticator = require('./authenticator');
let queries = require('./queries');
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

//Initial connection to test database connectivity
pool.getConnection(function (err, conn) {
    if (err) { console.error('Failed to connect to database'); }
    else { console.log('Database connected'); conn.release(); }
});

/*Loads create user profile page*/
router.get('/create_user_profile', function (req, res) {
    res.render('pages/create_user_profile');
});

/*Sends new user credentials to upload page*/
router.post('/create_user_profile', function (req, res) {
    /** Server validation of credentials
     *  -verifies passwords match
     *  -verifies age is correct
     */
    //TODO Handle same ucsd email case
    pool.getConnection(function (err, conn) {
        queries.insert_student(req, res, err, conn);
    });
});


/*Loads edit user profile page*/
router.get('/edit_user_profile', function (req, res) {
    res.render('pages/edit_user_profile');
});

/*Loads edit club profile page*/
router.get('/edit_club_profile', function (req, res) {
    res.render('pages/edit_club_profile');
});

// Login
router.get('/login', function (req, res) {
    res.render('pages/login');
});


module.exports = router;