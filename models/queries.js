/**
 * Created by Jeffers on 2/26/2017.
 */
let authenticator = require('./../routes/authenticator');
let connection = require('./user');

module.exports = {

    /**
     * User requesting to create profile
     */
    insert_student: function (req, res) {
        // MySQL query to insert into student table
        let query = "insert into student (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)";

        //Gets all user data passed from the view
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email;
        let phone = authenticator.parse_phoneNum(req.body.phone);
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
            res.render('pages/createUserProfile', {errors: errors});
        }
        else if(!authenticator.verify_email(req, res, email) || !authenticator.verify_phone(req, res, phone)) {
            res.redirect('/users/createUserProfile');
        }
        else {
            // Create new student row with given credentials on database
            connection(function (err, conn) {
                if (err) {
                    req.flash('errorMsg', 'Bad connection with database');
                    res.redirect('/users/createUserProfile');
                }
                else {
                    conn.query(query, [firstname, lastname, email, phone, password], function (err) {
                        conn.release();
                        if (err) {
                            // Error in duplicate email
                            req.flash('errorMsg', (err.message).substr(13,17) + email);
                            res.redirect('/users/createUserProfile');
                        }
                        else {
                            req.flash('successMsg', 'Registration complete : You may login');
                            res.redirect('/users/login');
                        }
                    });
                }
            });
        }
    },

    /**
     * User requesting to update profile
     */
    update_student: function (req, res) {
        let query = "replace into student (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)";

        let fname = req.body.firstname;
        let lname = req.body.lastname;
        let phone = req.body.phone;
        let email = req.body.email;
        let password = req.body.password;
        let password2 = req.body.password2;

        console.log(req.body);

        /* Notifies user if request to update with null data */
        if (!fname && !lname && !phone && !email && !password && !password2) {
            req.flash('errorMsg', 'No data entered');
            res.redirect('/users/editUserProfile');
            return;
        }
        req.checkBody('password', 'Passwords don\'t match').equals(password2);
        let errors = req.validationErrors();

        if (errors) {
            res.render('pages/editUserProfile', {errors: errors});
        }
        else {
            // If input field is empty then insert old data back into db entry
            if (!fname) {
                fname = req.session.fname;
            }
            if (!lname) {
                lname = req.session.lname;
            }
            if (!email) {
                email = req.session.email;
            }
            if (!phone) {
                phone = req.session.phone;
            }
            if (!password) {
                password = req.session.password;
            }

            connection(function (err, conn) {
                if (err) {
                    req.flash('errorMsg', 'Bad connection with database');
                    res.redirect('/users/editUserProfile');
                }
                else {
                    // Replace existing db entry with modified data
                    conn.query(query, [fname, lname, email, phone, password], function (err, rows) {
                        if (err) {
                            req.flash('errorMsg', 'Failed to update account');
                            res.redirect('/users/editUserProfile');
                        }
                        else {
                            req.flash('successMsg', 'Updated profile');
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    },

    /**
     * User requesting to create club profile
     */
    insert_club: function (req, res) {
        // MySQL query to insert into student table
        let query = "insert into club (name, leader_email, club_email, phone, social_link, description) values (?, ?, ?, ?, ?, ?) ";

        //Gets all user data passed from the view
        let clubname = req.body.clubname;
        let email = req.body.email;
        let phone = authenticator.parse_phoneNum(req.body.phone);
        let website = req.body.website;
        let description = req.body.description;
        let interests = req.body.interest;

        // Required fields that we want
        req.checkBody('clubname', 'Club name is required').notEmpty();
        req.checkBody('phone', 'Require phone number').notEmpty();
        req.checkBody('email', 'Required email is not valid').isEmail();
        req.checkBody('description', 'Club description is required').notEmpty();

        let errors = req.validationErrors();

        // Throws error notification if there exists errors or interest tags weren't filled
        if (errors || interests.length === 0) {
            // Render the page again with error notification of missing fields
            res.render('pages/createClubProfile', {errors: errors});
        }
        else {
        // Create new student row with given credentials on database
            connection(function (err, conn) {
                if (err) {
                    req.flash('errorMsg', 'Bad connection with database');
                    res.redirect('/users/createUserProfile');
                }
                else {
                    conn.query( query, [clubname, req.session.email, email, phone, website, description ], function (err) {
                        conn.release();
                        if (err) {
                            req.flash('errorMsg', 'Failed to create club : Bad credentials');
                            res.redirect('/users/createClubProfile');
                        }
                        else {
                            req.flash('successMsg', 'Club created');
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    },

    getClub: function (req, res) {
        let query_action = "SELECT * FROM club";
        connection(function (err, con) {
            if (err) {
                res.render('/users/login', {errors: errors});
            }
            else {
                con.query(query_action, function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', 'Failed to connect to database');
                        res.redirect('/users/login');
                    }
                    // Assures the query returns a club entry
                    else if (rows[0] == null) {
                        req.flash('errorMsg', 'No clubs exists');
                        res.redirect('/searchPage');
                    }
                    else {
                        let club = rows[0];
                        console.log(club.name, club.leader_email, club. club_email, club.social_link, club. phone, club.description );
                        res.render('pages/clubPage', {club: club});
                    }
                });
                con.release();
            }
        });
    },

    /**
     * User requesting to log in.
     */
    login: function (req, res) {
        // MySQL query to search student table
        let query_action = "SELECT student.first_name, student.last_name, student.email, student.phone FROM student WHERE student.email = ? AND student.password = ?";

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
        else if(!authenticator.verify_email(req, res, email)) {
            res.redirect('/users/login');
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
                            req.flash('errorMsg', 'Failed to connect to database');
                            res.redirect('/users/login');
                        }
                        // Assures provided credentials return a valid account
                        else if (rows[0] == null) {
                            req.flash('errorMsg', 'Email/Password is invalid');
                            res.redirect('/users/login');
                        }
                        // Set current session as logged in
                        else {
                            let user = rows[0];

                            // Since login success, represent session with the user's name and email
                            req.session.fname = authenticator.capitalize_name(user.first_name)
                            req.session.lname = authenticator.capitalize_name(user.last_name);
                            req.session.email = user.email;
                            req.session.phone = user.phone;

                            req.flash('successMsg', "Welcome", req.session.fname);
                            res.redirect('/');
                        }
                    });
                    con.release();
                }
            });
        }
    }
};