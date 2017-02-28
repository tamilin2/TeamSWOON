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
let getConnection = function (cb) {
    pool.getConnection(function (err, conn) {
        if (err) { throw err; }
        cb(null, conn);
    });
};

// Export reference to MySQL connection pool
let User = module.exports = getConnection;