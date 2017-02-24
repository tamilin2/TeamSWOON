let express = require('express');
let expressLayouts = require('express-ejs-layouts');
let bodyParser = require('body-parser');
let app = express();
let port = process.env.PORT || 9999;
let mysql = require('mysql');

/* Creates MySQL connection instance*/
let connection = mysql.createPool({
    connectionLimit: 2,
    host: "us-cdbr-azure-west-b.cleardb.com",
    user: "bba003a662e9c4",
    password: "17ce3e64",
    database: "swoondb"
});

/* Connects to MySQL swoondb database*/
function handle_database(req,res) {

    connection.getConnection(function(err,connection){
        if (err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.on('error', function(err) {
            res.json({"code" : 100, "status" : "Error in connection database"});
        });
    });
}

/* Allows MySQL connection to be referenced*/
module.exports = connection;


//use ejs and express layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);

//use body parser
app.use(bodyParser.urlencoded({extended: true}));

//route our router
let router = require('./app/routes');
app.use('/', router);

/* Handle database connections*/
app.get("/",function(req,res){-
    handle_database(req,res);
});

//static files i.e. css
//app.use(express.static(__dirname + '/public'));

//start server
app.listen(port, function () {
   console.log("App started")
});

