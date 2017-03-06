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
router.post('/clubPage', function (req, res) {
    queries.getClub(req, res);
});

/*Loads search page*/
router.get('/searchPage', function (req, res) {
    queries.getAllClubs(req, res);
});
/*Loads search page by name*/
router.post('/searchPage', function (req, res) {
    // Search is only requested if search value is not empty
    if (req.body.searchbar.length > 0) { queries.getClubByName(req,res); }
    else { res.redirect('/'); }
});

// Communicates this router to server.js
module.exports = router;