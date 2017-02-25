let express = require('express');
let expressLayouts = require('express-ejs-layouts');
let bodyParser = require('body-parser');
let app = express();
let port = process.env.PORT || 8080;


//use ejs and express layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);

//use body parser
app.use(bodyParser.urlencoded({extended: true}));

//gets our router
let router = require('./app/routes');
app.use('/', router);

//static files i.e. css, js, etc.
app.use(express.static(__dirname + '/public'));

//start server
app.listen(port, function () {
   console.log("App started")
});

