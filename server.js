let express = require('express');
let path = require('path');
let expressLayouts = require('express-ejs-layouts');
let bodyParser = require('body-parser');
let expressValidator = require('express-validator');
let session = require('express-session');
let flash = require('connect-flash');
let app = express();
let port = process.env.PORT || 8080;

let routes = require('./routes/routes');
let users = require('./routes/users');

//static files i.e. css, js, etc.
app.use(express.static(path.join(__dirname,'/public')));
//use ejs and express layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);

//use body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Express session to preserve login values
app.use(session({
      secret: 'secret',
      resave: false,
      saveUninitialized: true
}));

// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

// Connect flash
app.use(flash());

// Set global vars for flash
app.use(function (req, res, next) {
    res.locals.successMsg = req.flash('successMsg');
    res.locals.errorMsg = req.flash('errorMsg');
    res.locals.error = req.flash('error');
    // Used to identify a logged in user
    res.locals.user = req.session.name;
    res.locals.email = req.session.email;
    next();
});

// Let app use our routes
app.use('/users', users);
app.use('/', routes);

//start server
app.listen(port, function () {
   console.log("App started on port: " + port);
});

