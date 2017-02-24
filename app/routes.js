/**
 * Created by Jeffers on 2/21/2017.
 * Routes
 */
let express = require('express');
let path = require('path');
let connection = require('../server');
let router = express.Router();

module.exports = router;

/*Loads home page*/
router.get('/', function (req, res) {
    res.render('pages/index');
});

router.get('/edit_profile', function (req, res) {
    res.render('pages/edit_profile');
});