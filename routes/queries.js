/**
 * Created by Jeffers on 2/26/2017.
 */
let authenticator = require('./authenticator');
let User = require('../models/user');
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
                    if (err) { console.error('Failed to connect to database'); }
                    else {
                        con.query(query, [firstname, lastname, email, phone, password], function (err) {
                            if (err) {
                                console.error('Failed to create account onto database', err);
                            }
                        });
                    }
                });
                req.flash('success_msg', 'Registration complete; Login');
                res.redirect('/users/login');
            }
            else {
                //TODO Handle incorrect credentials e.g. mismatching passwords
                console.error("Credentials are incorrectly formatted");
            }
        }
    }
};