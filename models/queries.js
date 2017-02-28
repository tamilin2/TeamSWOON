/**
 * Created by Jeffers on 2/26/2017.
 */
let authenticator = require('./../routes/authenticator');
let connection = require('./user');

module.exports = {

    /**
     * Connection requesting to create profile
     */
    insert_student: function (req, res) {
        let query = "insert into student (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)";
        // MySQL query to insert into student table
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email;
        let phone = authenticator.parse_phoneNum(req, res);
        let password = req.body.password;
        let password2 = req.body.password2;

        // Required fields that we want
        req.checkBody('firstname', 'First name is required').notEmpty();
        req.checkBody('lastname', 'Last name is required').notEmpty();
        req.checkBody('phone', 'Require phone number').notEmpty();
        req.checkBody('email', 'Required email is not valid').isEmail();
        req.checkBody('password', 'Password is required').notEmpty();
        // Requires the user to enter matching passwords as confirmation
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
        let errors = req.validationErrors();

        if (errors) {
            // Render the page again with error notification of missing fields
            res.render('pages/create_user_profile', {errors: errors});
        }
        else {

            // Create new student row with given credentials on database
            connection(function (err, conn) {
                if (err) {
                    req.flash('error_msg', 'Bad connection with database');
                    res.redirect('/users/create_user_profile');
                }
                else {
                    conn.query(query, [firstname, lastname, email, phone, password], function (err) {
                        conn.release();
                        if (err) {
                            req.flash('error_msg', (err.message).substr(13,17) + email);
                            res.redirect('/users/create_user_profile');
                        }
                        else {
                            req.flash('success_msg', 'Registration complete; Login');
                            res.redirect('/users/login');
                        }
                    });
                }
            });
        }
    },

    /**
     * Connection requesting to log in.
     */
    login: function (req, res) {
        // MySQL query to search student table
        let query_action = " SELECT student.first_name, student.last_name, student.email ,student.password FROM student WHERE student.email = ? AND student.password = ?";

        let email = req.body.email;
        let password = req.body.password;

        // Assure these fields are filled
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        let errors = req.validationErrors();

        if (errors) {
            // Render the page again with error notification of missing fields
            res.render('pages/login', {errors: errors});
        }
        else {
            // Gets connection to database
            connection(function (err, con) {
                if (err) {
                    res.render('/users/login', {errors: errors});
                }
                else {
                    con.query(query_action, [email, password], function (err, rows) {
                        if (err) {
                            req.flash('error_msg', 'Failed to connect to database');
                            res.redirect('/users/login');
                        }
                        // Assures provided credentials return a valid account
                        else if (rows[0] == null) {
                            req.flash('error_msg', 'Email/Password is invalid');
                            res.redirect('/users/login');
                        }
                        // Set current session as logged in
                        else {
                            let user = rows[0];
                            req.flash('success_msg', 'Welcome ' + user.first_name);
                            // Since login success, represent session with the user's name
                            req.session.name = user.first_name + " " + user.last_name;
                            res.redirect('/');
                        }
                    });
                }
                con.release();
            });
        }

    }
};