const mysql = require('mysql');

// Creates a pool of connections to draw from to connect to MySQL
let pool = mysql.createPool({
    host            :  'us-cdbr-azure-west-b.cleardb.com',
    user            :  'bba003a662e9c4',
    password        :  '17ce3e64',
    database        :  'swoondb',
    // 60 seconds until connection times out
    connect_timeout :  60,
    interactive_timeout : 40000,
    wait_timeout    : 40000,
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
module.exports = getConnection;