/**
 * Created by Jeffers on 2/21/2017.
 * Routes: Handles page transitions and MySQL queries
 */
let express = require('express');
let router = express.Router();
let queries = require('../models/queries');

/*Loads home page*/
router.get('/', function (req, res) {
    res.render('pages/index');
});

/*Loads club page*/
router.get('/clubPage', function (req, res) {
    queries.getAllClubs(req, res);
});

/*Loads search page*/
router.get('/searchPage', function (req, res) {
    res.render('pages/searchPage', {clubs: null, search: null});
});
/*Loads all clubs to be shown*/
router.get('/viewAllClubs', function (req, res) {
    queries.getAllClubs(req, res);
});
/*Loads search page by name*/
router.post('/searchPage', function (req, res) {
    // Search is only requested if search value is not empty
    if (req.body.searchbar.length > 0) { queries.getClubByName(req,res); }
    else { res.redirect('/searchPage'); }
});

// Communicates this router to server.js
module.exports = router;