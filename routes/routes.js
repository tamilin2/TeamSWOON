/**
 * Created by Jeffers on 2/21/2017.
 * Routes: Handles page transitions and MySQL queries
 */
let express = require('express');
let router = express.Router();

/*Loads home page*/
router.get('/', function (req, res) {
    res.render('pages/index');
});

// Communicates this router to server.js
module.exports = router;