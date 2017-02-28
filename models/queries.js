/**
 * Created by Jeffers on 2/26/2017.
 */
let authenticator = require('./../public/js/authenticator');
let User = require('./user');
let queries = module.exports = {

    insert_student: function (req, res, err) {
        let query = "insert into student (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)";
        // MySQL query to insert into student table
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email;
        let phone = authenticator.parse_phoneNum(req.body.phone);
        let password = req.body.password;
        let password2 = req.body.password2;

        req.checkBody('firstname', 'First name is required').notEmpty();
        req.checkBody('lastname', 'Last name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
        let errors = req.validationErrors();

        if (errors) {
            // Render the page again with error notification
            res.render('pages/create_user_profile', {errors: errors});
        }
        else {
            if (authenticator.isRegisterValid(email, password, password2)) {
                console.log('Entering query', [firstname, lastname, email, phone, password]);
                User(function (err, con) {
                    if (err) {
                        req.flash('error_msg', 'Failed to create account');
                        res.redirect('/users/create_user_profile');
                    }
                    else {
                        con.query(query, [firstname, lastname, email, phone, password], function (err) {
                            if (err) {
                                req.flash('error_msg', 'Failed to connect to database');
                                res.redirect('/users/create_user_profile');
                            }
                        req.flash('success_msg', 'Registration complete; Login');
                        res.redirect('/users/login');
                        });
                    }
                });
            }
            else {
                //TODO Handle incorrect credentials e.g. mismatching passwords
                console.error("Credentials are incorrectly formatted");
            }
        }
    },

    login: function (req, res) {
        // MySQL query to search student table
        let query_action = " SELECT student.first_name, student.email, student.password FROM student WHERE student.email = ? AND student.password = ?";

        let email = req.body.email;
        let password = req.body.password;

        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        let errors = req.validationErrors();

        if (errors) {
            // Render the page again with error notification
            res.render('pages/login', {errors: errors});
        }
        else {
            User(function (err, con) {
                if (err) {
                    req.flash('error_msg', 'Failed to create account');
                    res.redirect('/users/create_user_profile');
                    console.log(err);
                }
                else {
                    con.query(query_action, [email, password], function (err, rows) {
                        if (err) {
                            req.flash('error_msg', 'Failed to connect to database');
                            res.redirect('/users/login');
                        }
                        else if (rows[0] == null) {
                            req.flash('error_msg', 'Email/Password is invalid');
                            res.redirect('/users/login');
                        }
                        else {
                            req.flash('success_msg', 'Welcome ' + rows[0].first_name);
                            req.session.name = rows[0].first_name;
                            res.redirect('/');
                        }
                    });
                }
                con.release();
            });
        }

    }
};