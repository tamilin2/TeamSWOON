/**
 * Created by Jeffers on 2/26/2017.
 */
let authenticator = require('./../routes/authenticator');
let connection = require('./user');

// var nodemailer = require('nodemailer');
// var transporter = nodemailer.createTransport();

/* Example code to send emails */
// transporter.sendMail({
//     from: 'sender@address',
//     to: 'receiver@address',
//     subject: 'hello',
//     html: '<b>hello world!</b>',
//     text: 'hello world!'
// });


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
        req.checkBody('email', 'Require UCSD email').isEmail();
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

        /* Notifies user if request to update with all null data */
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
                    conn.query( query, [clubname, req.session.user.email, email, phone, website, description ], function (err) {
                        conn.release();
                        if (err) {
                            req.flash('errorMsg', 'Failed to create club : Bad credentials');
                            res.redirect('/users/createClubProfile');
                        }
                        else {
                            let club = {
                                name : clubname,
                                phone : authenticator.format_phone(phone),
                                club_email: email,
                                social_link: website,
                                description : description,
                                leader_email : req.session.user.email
                            };
                            res.render('pages/clubPage', {club: club});
                        }
                    });
                }
            });
        }
    },

    /**
     * User requesting to edit club profile
     */
    edit_club : function (req, res) {
        let query = "replace into club (name, leaderEmail, clubEmail, phone, socialLink, description) values (?, ?, ?, ?, ?, ?) ";

        let name = req.body.clubName;
        let email = req.body.email;
        let leaderEmail= req.session.club.clubLeaderEmail;
        let description= req.body.description;
        let phone= req.body.phone;
        let socialLink = req.body.socialLink;

        /* Notifies user if request to update with all null data */
        if (!name && !email && !description&& !phone&& !socialLink) {
            req.flash('errorMsg', 'No data entered');
            res.redirect('/users/editClubProfile');
            return;
        }

        // If input field is empty then insert old data back into db entry
        if (!name) {
            name = req.session.club.name;
        }
        if (!email) {
            email= req.session.club.email;
        }
        if (!description) {
            description = req.session.club.description;
        }
        if (!socialLink) {
            socialLink = req.session.club.socialLink;
        }
        // If phone is null, use old formatted club number
        if (!phone) {
            phone = authenticator.parse_phoneNum(req.session.club.phone);
        }
        // New phone entry is given so format it
        else {
            phone = authenticator.parse_phoneNum(phone);
        }

        // Querying with verified input data
        connection(function (err, conn) {
            if (err) {
                req.flash('errorMsg', 'Bad connection with database');
                res.redirect('/users/editClubProfile');
            }
            else {
                // Replace existing db entry with modified data
                conn.query(query, [name, leaderEmail, email, phone, socialLink, description ], function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', 'Failed to update account');
                        res.redirect('/users/editClubProfile');
                        throw err;
                    }
                    else {
                        req.session.club = [ name, email, leaderEmail , description, socialLink, phone];
                        let club = {
                            name : name,
                            clubEmail : email,
                            leaderEmail : leaderEmail,
                            description : description,
                            phone : authenticator.format_phone(phone),
                            socialLink : socialLink
                        };
                        res.render('pages/clubPage', {club: club});
                    }
                });
                conn.release();
            }
        });
    },

    /**
     * User requesting to delete club profile
     */
    delete_club : function (req, res) {
        let query = "Delete FROM club WHERE club.name = ? AND club.club_email = ?";

        let name = req.session.club.name;
        let email = req.session.club.email;

        connection(function (err, conn) {
            if (err) {
                req.flash('errorMsg', 'Bad connection with database');
                res.redirect('/users/editClubProfile');
            }
            else {
                // Replace existing db entry with modified data
                conn.query(query, [name, email], function (err, rows) {
                    if (err) {
                        throw err;
                        // req.flash('errorMsg', 'Bad connection with database');
                        // res.redirect('/users/editClubProfile');
                    }
                    else {
                        req.flash('successMsg', 'Successfully deleted club');
                        res.redirect('/');
                    }
                });
                conn.release();
            }
        });
    },

    /**
     * Get a single club's info for club page profile
     */
    getClub : function (req, res) {
        let clubname = req.body.clubname;

        let query_action = "SELECT * FROM club WHERE club.name = ?";

        connection(function (err, con) {
            con.query(query_action, [clubname],function (err, rows) {
                if (err) {
                    req.flash('errorMsg', 'Failed to query to database');
                    res.redirect('/');
                }
                // Assures the query returns a club entry
                else if (rows[0] == null) {
                    req.flash('errorMsg', 'Failed to get club profile');
                    res.redirect('/');
                }
                // Query returns found clubs so load them on search page
                else {
                    rows[0].phone = authenticator.format_phone(rows[0].phone);
                    console.log(rows[0]);
                    res.render('pages/clubPage', {club: rows[0]});
                }
            });
            con.release();
        })
    },

    /**
     * System requesting club info of all clubs to post on search page
     */
    getAllClubs: function (req, res) {
        let query_action = "SELECT * FROM club Order By club.name ASC LIMIT 20 ";
        connection(function (err, con) {
            if (err) {
                res.render('/users/login', {errors: errors});
            }
            else {
                con.query(query_action, function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', 'Failed to connect to database');
                        res.redirect('/');
                        throw err;
                    }
                    // When no clubs shows up
                    else if (rows[0] == null) {
                        res.render('pages/searchPage', {clubs: undefined, search: null});
                    }
                    // Query returns found clubs so load them on search page
                    else {
                        res.render('pages/searchPage', {clubs: rows, search : null});
                    }
                });
                con.release();
            }
        });
    },

    /**
     * System requesting club info by name
     */
    getClubByName: function (req, res) {
        let query_action = "SELECT * FROM club WHERE club.name LIKE ? Order by club.name";

        connection(function (err, con) {
            if (err) {
                res.render('/', {errors: errors});
            }
            else {
                con.query(query_action, ['%'+req.body.searchbar+'%'],function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', 'Failed to connect to database');
                        res.redirect('/');
                    }
                    // Assures the query returns a club entry
                    else if (rows[0] == null) {
                        res.render('pages/searchPage', {clubs: undefined, search: req.body.searchbar});
                    }
                    // Query returns found clubs so load them on search page
                    else {
                        res.render('pages/searchPage', {clubs: rows, search : req.body.searchbar});
                    }
                });
                con.release();
            }
        })
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
                            req.session.user = {
                                fname : user.first_name,
                                lname : user.last_name,
                                email : user.email,
                                phone : user.phone
                            };

                            req.flash('successMsg', "Welcome", req.session.user.fname);
                            res.redirect('/');
                        }
                    });
                    con.release();
                }
            });
        }
    }
};