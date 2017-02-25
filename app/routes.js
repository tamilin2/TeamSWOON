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
    // Since connection limit is 4 on free trial server
    connectionLimit : 4,
    database        :  'swoondb',
    host            :  'us-cdbr-azure-west-b.cleardb.com',
    user            :  'bba003a662e9c4',
    password        :  '17ce3e64'
});

// Initial connection to test database connectivity
pool.getConnection(function (res, err, connection) {
    if (err) {
        console.error("Database failed to connect");
    }
    else {
        console.log("Database connected");
        connection.release();
    }
});

function handle_Database(context) {
    pool.getConnection(function (req, res, err, connection) {
        if (err) {
            console.log("Database failed to connect");
        }
        else {
            console.log("Database connected");
        }
        connection.release();
    });
}

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
    console.log('upload data');
    res.render('pages/index');
});

/*Loads edit club profile page*/
router.get('/edit_club_profile', function (req, res) {
    res.render('pages/edit_club_profile');
});