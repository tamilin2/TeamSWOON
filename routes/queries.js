/**
 * Created by Jeffers on 2/26/2017.
 */
let authenticator = require('./authenticator');
let queries = module.exports = {

    insert_student: function (req, res, err, conn) {
        let query = "insert into student (first_name, last_name, email, phone, password, age) VALUES (?, ?, ?, ?, ?, ?)";
        // MySQL query to insert into student table
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email;
        let phone = authenticator.parse_phoneNum(req.body.phone);
        let age = req.body.age;
        let password = req.body.password;
        let conf_password = req.body.conf_pass;

        if (err) {
            console.error('Failed to connect to database');
        }
        else {
            if (authenticator.verify_password(password, conf_password) &&  authenticator.verify_ucsd_email(email)) {
                console.log('Entering query', [firstname, lastname, email, phone, password, age]);
                conn.query(query, [firstname, lastname, email, phone, password, age], function (err, results) {
                    if (err) {
                        console.error('Failed to create account onto database', err);
                        conn.release();
                    }
                    else {
                        res.render('pages/index');
                    }
                });
            }
            else {
                //TODO Handle inccorect credentials e.g. mismatching passwords
                console.error("Credentials are incorrectly formatted");
            }
        }
    }
};