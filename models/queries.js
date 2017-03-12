/**
 * Created by Jeffers on 2/26/2017.
 */
let authenticator = require('./../routes/authenticator');
let connection = require('./user');
async = require('async');
let nodemailer = require('nodemailer');
// Js file to get email and password for gmail. This keeps your privacy for gmail
let config = require('../../config');
let fs = require('fs');

module.exports = {

    /**
     * User requesting to create profile
     */
    insert_student: function (req, res) {
        // MySQL query to insert into student table
        let query = "insert into student (first_name, last_name, email, phone, password, about) VALUES (?, ?, ?, ?, ?, ?)";

        //Gets all user data passed from the view
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email;
        let about = req.body.about;
        let phone = authenticator.parse_phoneNum(req.body.phone);
        let password = req.body.password;
        let password2 = req.body.password2;

        // Required fields that we want
        req.checkBody('firstname', 'First name is required').notEmpty();
        req.checkBody('lastname', 'Last name is required').notEmpty();
        req.checkBody('phone', 'Phone number is required').notEmpty();
        req.checkBody('email', 'UCSD Email is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        // Requires the user to enter matching passwords as confirmation
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
        let errors = req.validationErrors();

        req.session.profile = { fname:firstname, lname:lastname, phone:phone, email: email, about: about};

        if (errors) {
            // Render the page again with error notification of missing fields
            res.render('pages/createUserProfile', {errors: errors, profile : req.session.profile});
        }
        else if( authenticator.verifyCredentials(req, res, email, phone)) {
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
                    conn.query(query, [firstname, lastname, email, phone, password, about], function (err) {
                        conn.release();
                        if (err) {
                            // Error in duplicate email
                            req.flash('errorMsg', (err.message).substr(13,17) + email);
                            res.redirect('/users/createUserProfile');
                        }
                        else {
                            req.session.profile = undefined;
                            req.flash('successMsg', 'Registration complete: You may login');
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
        let query = "replace into student (first_name, last_name, email, phone, password, about) VALUES (?, ?, ?, ?, ?, ?)";
        
        let fname = req.session.user.fname;
        let lname = req.session.user.lname;
        let phone = authenticator.parse_phoneNum(req.body.phone);
        let about = req.body.about;

        /* Notifies user if request to update with all null data */
        if (!phone && !about) {
            req.flash('errorMsg', 'No data entered');
            res.redirect('/users/editUserProfile');
            return;
        }
        // If input field is empty then insert old data back into db entry
        if (!phone) {
            phone = req.session.user.phone;
        }
        if (!about) {
            about = req.session.user.about;
        }

        /**
         * After null check, check if credentials are valid
         */
        if( !authenticator.verify_phone(req, res, phone)) {
            res.redirect('/users/editUserProfile');
        }
        else {
            // Query to update user profile
            connection(function (err, conn) {
                if (err) {
                    req.flash('errorMsg', 'Bad connection with database');
                    res.redirect('/users/editUserProfile');
                }
                else {
                    // Replace existing db entry with modified data
                    conn.query(query, [fname, lname, req.session.user.email, phone, req.session.user.password, about], function (err, rows) {
                        if (err) {
                            req.flash('errorMsg', 'Failed to update account', err);
                            res.redirect('/users/editUserProfile');
                        }
                        else {
                            // Since update success, represent session with the user's new credential
                            req.session.user = {
                                fname : fname,
                                lname : lname,
                                email : req.session.user.email,
                                phone : phone,
                                password : req.session.user.password,
                                about: about
                            };
                            req.flash('successMsg', 'Updated profile');
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    },

    /**
     * User requesting to update password
     */
    update_password: function (req, res) {
        let query = "replace into student (first_name, last_name, email, phone, password, about) VALUES (?, ?, ?, ?, ?, ?)";
        let oldPassword = req.body.oldPassword;
        let password = req.body.password;
        let password2 = req.body.password2;

        req.checkBody('oldPassword', 'Old password doesn\'t match').equals(req.session.user.password);
        req.checkBody('password', 'New password doesn\'t match').equals(password2);
        let errors = req.validationErrors();

        if (errors) {
            // Redirect back to change password page if passwords don't match
            res.render('pages/changePassword', {errors: errors});
        }
        else {
            connection(function (err, conn) {
                if (err) {
                    req.flash('errorMsg', 'Bad connection with database');
                    res.redirect('/users/changePassword');
                }
                else {
                    // Replace existing db entry with modified data
                    conn.query(query, [req.session.user.fname, req.session.user.lname, req.session.user.email, req.session.user.phone, password, req.session.user.about], function (err, rows) {
                        if (err) {
                            req.flash('errorMsg', 'Failed to update password', err);
                            res.redirect('/users/changePassword');
                        }
                        else {
                            // Since update success, represent session with the user's new credential
                            req.session.user.password = password;
                            req.flash('successMsg', 'Updated password');
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
        // MySQL query to insert into club table
        let query = "insert into club (leaderEmail, phone, description, name, clubEmail, socialLink,img) values (?, ?, ?, ?, ?, ?, ?) ";

        // MySQL query to insert into club_interest table
        let query_cl = "insert into club_interest (club_name, interest) values (?, ?) ";
        
        // MySQL query to insert into club_schedule table
        let query_sched = "insert into club_schedule (clubName, day, startTime, endTime, location) values (?,?,?,?,?) ";
      


        //Gets all user data passed from the view
        let clubname = req.body.clubname;
        let email = req.body.email;
        let phone = authenticator.parse_phoneNum(req.body.phone);
        let socialLink = req.body.website;
        let description = req.body.description;
        let interests = req.body.interests;
        let day = req.body.day;
        let start = req.body.startTime;
        let end = req.body.endTime;
        let location = req.body.location;
        let pic = null;
        if (req.file !== undefined) { pic = req.file.originalname; }

        // Required fields that we want
        req.checkBody('clubname', 'Club name is required').notEmpty();
        req.checkBody('phone', 'Require phone number').notEmpty();
        req.checkBody('email', 'Required email is not valid').isEmail();
        req.checkBody('description', 'Club description is required').notEmpty();
        req.checkBody('day', 'Club meeting day is required').notEmpty();
        req.checkBody('start', 'Club start time is required')!=null;
        req.checkBody('end', 'Club end time is required')!=null;
        req.checkBody('location', 'Club location is required').notEmpty();


        req.session.profile = { name:clubname, phone:phone, email: email, about: description};
        let errors = req.validationErrors();

        // Throws error notification if there exists errors or interest tags weren't filled
        if (errors) {
            // Render the page again with error notification of missing fields
            res.render('pages/createClubProfile', {errors: errors, profile: req.session.profile});
        }
        else if(!interests) {
            req.flash('errorMsg', 'Please select at least one Category');
            res.redirect('/users/createClubProfile');
        }
        else {
            connection(function (err, conn) {
                if (err) {
                    req.flash('errorMsg', 'Bad connection with database');
                    res.redirect('/users/createClubProfile');
                }
                else {
                    // Create new club row with given credentials on database
                    conn.query(query, [req.session.user.email, phone, description, clubname, email, socialLink, pic], function (err) {
                        if (err) {
                            req.flash('errorMsg', 'Failed to create club: Creation');
                            res.redirect('/users/createClubProfile');
                        }
                        else {
                            // tentatively set var used to check if any errors were thrown during the following loop
                            var errCheck = false;
                            var errorCheck = false;
                            
                            // loop through the interests array, inserting each as a row in the club_interest table
                            for (var i = 0; i < interests.length; i++) {
                                console.log(interests[i]);
                                conn.query(query_cl, [clubname, interests[i]], function (err) {
                                    if (err) {
                                        errCheck = true;
                                        throw err;
                                    }
                                    
                            
                            // loop through all fields of schedule array, inserting each as a row in the club_schedule table
                            for (var s = 0; s < day.length; s++){
                                console.log(day[s]);
                                conn.query(query_sched, [clubname, day[s],start[s],end[s],location[s]], 
                                function (err) {
                                if (err) {
                                    errorCheck = true;
                                    throw err;
                                }
                                });
                                if (errorCheck) {break;}
                            }
                                
                            
                                });
                                
                                if (errCheck) {break;}
                            }
                            
                         
                            conn.release();

                            if (errCheck) { //error check for club interests
                                req.flash('errorMsg', 'Failed to create club: Interests');
                                res.redirect('/users/createClubProfile');
                            }
                            else {
                                // Saves club info to load onto club page
                                req.session.club = {
                                    name: clubname,
                                    phone: authenticator.format_phone(phone),
                                    clubEmail: email,
                                    socialLink: socialLink,
                                    description: description,
                                    leaderEmail: req.session.user.email,
                                    img : pic
                                };
                                
                                  // Saves club schedule info to load onto club page
                                 req.session.club_schedule = {
                                    day: day,
                                    start: start,
                                    end: end,
                                    location: location
                                };
                                
                                req.session.profile = undefined;
                                res.render('pages/clubPage', {club: req.session.club,club_schedule: req.session.club_schedule});
                                
                              
                                
                               
                            }
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
        let query = "replace into club (name, leaderEmail, clubEmail, phone, socialLink, description, img) values (?, ?, ?, ?, ?, ?, ?) ";

        let name = req.body.clubName;
        let clubEmail = req.body.clubEmail;
        let leaderEmail= req.session.club.leaderEmail;
        let description= req.body.description;
        let phone= req.body.phone;
        let socialLink = req.body.socialLink;
        let img = null;
        if (req.file !== undefined) { img = req.file.originalname; }

        /* Notifies user if request to update with all null data */
        if (!name && !clubEmail && !description && !phone&& !socialLink) {
            req.flash('errorMsg', 'No data entered');
            res.redirect('/users/editClubProfile');
            return;
        }

        // If input field is empty then insert old data back into db entry
        // Else input field is not empty so overwrite old saved data
        if (!name) {
            name = req.session.club.name;
        } else {
            req.session.club.name = name;
        }
        if (!clubEmail) {
            clubEmail= req.session.club.email;
        } else {
            req.session.club.clubEmail = clubEmail;
        }
        if (!description) {
            description = req.session.club.description;
        } else {
            req.session.club.description = description;
        }
        if (!socialLink) {
            socialLink = req.session.club.socialLink;
        }
        // If phone is null, use old formatted club number
        if (!phone) {
            phone = authenticator.parse_phoneNum(req.session.club.phone);
        } else {
                // New phone entry is given so format it
            phone = authenticator.parse_phoneNum(phone);
            req.session.club.phone = authenticator.format_phone(phone);
        }
        if (!img) {
            img = req.session.club.img;
        } else {
            // New phone entry is given so format it
            req.session.club.img= img;
        }

        // Querying with verified input data
        connection(function (err, conn) {
            if (err) {
                req.flash('errorMsg', 'Bad connection with database');
                res.redirect('/users/editClubProfile');
            }
            else {
                // Replace existing db entry with modified data
                //TODO replace null with img
                conn.query(query, [name, leaderEmail, clubEmail, phone, socialLink, description, img], function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', 'Failed to update account');
                        res.redirect('/users/editClubProfile');
                    }
                    else {
                        req.session.club = {
                            name: name,
                            leaderEmail: leaderEmail,
                            phone: phone,
                            description: description,
                            clubEmail: clubEmail,
                            socialLink: socialLink,
                            img: img
                        };
                        res.render('pages/clubPage', {club: req.session.club});
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
        let query = "Delete FROM club WHERE club.name = ? AND club.clubEmail = ?";
        let interest_query = "Delete FROM club_interest WHERE club_interest.club_name = ? ";

        let name = req.body.clubName;
        let email = req.body.clubEmail;
        let img = req.body.img;

        // Query to delete club from club list
        connection(function (err, conn) {
            if (err) {
                req.flash('errorMsg', 'Bad connection with database');
                res.redirect('/users/editClubProfile');
                return;
            }
            else {
                // Replace existing db entry with modified data
                conn.query(query, [name, email], function (err, rows) {
                    conn.release();
                    if (err) {
                        req.flash('errorMsg', 'Bad connection with database');
                        res.redirect('/users/editClubProfile');
                        return ;
                    }
                });
            }
        });

        // Query to delete club's interest relation in club_interest
        connection(function (err, conn) {
            if (err) {
                req.flash('errorMsg', 'Bad connection with database');
                res.redirect('/users/editClubProfile');
                return;
            }
            else {
                // Replace existing db entry with modified data
                conn.query(interest_query, [name], function (err, rows) {
                    conn.release();
                    if (err) {
                        req.flash('errorMsg', 'Bad connection with database');
                        res.redirect('/users/editClubProfile');
                        return;
                    }
                    else {
                        req.flash('successMsg', 'Successfully deleted club');
                        res.redirect('/');
                    }
                });
            }
        });

        // Delete club's local profile image if it exists
        try {
            if (img !== undefined) {
                fs.unlinkSync('public/img/' + img);
            }
        }
        catch (e) {
            console.error('Image path not found / Image not delete');
        }
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
                    // Saves last interacted club
                    req.session.club = {
                        name: rows[0].name,
                        leaderEmail: rows[0].leaderEmail,
                        phone: authenticator.format_phone(rows[0].phone),
                        description: rows[0].description,
                        clubEmail: rows[0].clubEmail,
                        socialLink: rows[0].socialLink,
                        img: rows[0].img
                    };
                    res.render('pages/clubPage', {club: req.session.club});
                }
            });
            con.release();
        })
    },

    /**
     * System requesting club info of all clubs to post on search page
     */
    getAllClubs: function (req, res) {
        let query_action = "SELECT * FROM club Order By club.name ASC";
        let query_interest = "select * from club_interest";
        connection(function (err, con) {
            if (err) {
                res.render('/users/login', {errors: errors});
            }
            else {
                con.query(query_action, function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', 'Failed to connect to database: clubs');
                        res.redirect('/');
                    }
                    // When no clubs shows up
                    else if (rows[0] == null) {
                        res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: null});
                    }
                    // Query returns found clubs so load them on search page
                    else {
                        con.query(query_interest, function(erro, search_interest_rows) {
                            if(erro) {
                                req.flash('errorMsg', 'Failed to connect to database: interests');
                                res.redirect('/');
                            }
                            else if(search_interest_rows[0] == null) {
                                res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: null});
                            }
                            else {
                                res.render('pages/searchPage', {clubs: rows, search_interests: search_interest_rows, search : null});
                            }
                        });
                    }
                });
                con.release();
            }
        });
    },

    /**
     * System requesting club info by name or club interest
     */
    getClubBySearch: function (req, res) {
        /*
         * Query searches for clubs whose name or interest matches a given string
         */
        let query_action = "SELECT DISTINCT club.leaderEmail, club.phone, club.description, club.name, club.clubEmail, " +
                            "club.socialLink, club.img FROM club LEFT JOIN club_interest " +
                            "ON club.name = club_interest.club_name WHERE club.name LIKE ? " +
                            "OR club_interest.interest LIKE ? ORDER BY club.name";

        let query_interest = "SELECT * FROM club_interest";


        let search = req.body.searchbar;
        
        connection(function (err, con) {
            if (err) {
                res.render('/', {errors: errors});
            }
            else {
                con.query(query_action, ['%'+search+'%', '%'+search+'%'],function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', 'Failed to connect to database');
                        res.redirect('/');
                    }
                    // Assures the query returns a club entry
                    else if (rows[0] == null) {
                        res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: search});
                    }
                    // Query returns found clubs so load them on search page
                    else {
                        con.query(query_interest, function(erro, search_interest_rows) {
                            if(erro) {
                                req.flash('errorMsg', 'Failed to connect to database: interests');
                                res.redirect('/');
                            }
                            else if(search_interest_rows[0] == null) {
                                res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: search});
                            }
                            else {
                                res.render('pages/searchPage', {clubs: rows, search_interests: search_interest_rows, search : search});
                            }
                        });
                    }
                });
                con.release();
            }
        })
    },

    /**
     * System requesting all clubs made by a user
     */
    getClubsCreated: function (req, res) {
        let query_action = "SELECT club.name FROM club WHERE club.leaderEmail = ? Order by club.name";

        connection(function (err, con) {
            if (err) {
                res.render('/', {errors: errors});
            }
            else {
                con.query(query_action, [req.session.user.email],function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', 'Failed to connect to database');
                        res.redirect('/');
                    }
                    // Assures the query returns a club entry
                    else if (rows[0] == null) {
                        res.render('pages/userProfilePage', {clubs: null, user: req.session.user});
                    }
                    // Query returns found clubs so load them on search page
                    else {
                        res.render('pages/userProfilePage', {clubs: rows, user: req.session.user});
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
        let query_action = "SELECT * FROM student WHERE student.email = ? AND student.password = ?";

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

                            // Since login success, represent session with the user's name credential
                            req.session.user = {
                                fname : user.first_name,
                                lname : user.last_name,
                                email : user.email,
                                phone : user.phone,
                                password : user.password,
                                about: user.about
                            };
                            req.flash('successMsg', "Welcome", req.session.user.fname);
                            res.redirect('/');
                        }
                    });
                    con.release();
                }
            });
        }
    },

    /**
     * User sends an email to club leader
     */
    sendEmail: function (req, res) {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                //TODO Authenticate your Gmail account here
                /* config.email/pass is locally set email and password to use nodemailer */
                user: config.email || null,
                pass: config.pass || null
            }
        });

        let mailOptions = {
            from: req.body.fromEmail,
            to: req.body.toEmail,
            subject: req.body.subject,
            text: req.body.body,
            html: "<p>" + req.body.body + "</p>"
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.error(err);
                req.flash('errorMsg', 'Failed to send email');
            }
            else {
                req.flash('successMsg', 'Email was successfully sent');
            }
            res.redirect('/');
        });
    },

    /**
     * System sends user their account credentials via given email
     */
    requestAccount: function (req, res) {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                //TODO Authenticate your Gmail account here
                /* config.email/pass is locally set email and password to use nodemailer */
                user: config.email || null,
                pass: config.pass || null
            }
        });

        let userEmail = req.body.email;

        let query = "SELECT student.password FROM student WHERE student.email = ?";

        connection(function (err, con) {
            con.query(query, [userEmail],function (err, rows) {
                if (err) {
                    req.flash('errorMsg', 'Failed to query to database');
                    res.redirect('/credentialRequest');
                }
                // Assures the query returns a club entry
                else if (rows[0] == null) {
                    req.flash('errorMsg', 'Email not found');
                    res.redirect('/credentialRequest');
                }
                // Query returns found clubs so load them on search page
                else {
                    let userPassword = rows[0].password;
                    let bodyMsg = "Your requested account credentials are the following:\nEmail: " + userEmail + "\nPassword: " + userPassword;
                    let mailOptions = {
                        from: 'noreply@ucsd.edu',
                        to: userEmail,
                        subject: 'Request Account Recovery',
                        text: bodyMsg,
                        html: "<p>" + bodyMsg + "</p>"
                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            req.flash('errorMsg', 'Failed to send email');
                        }
                        else {
                            req.flash('successMsg', 'Email was successfully sent to: ', userEmail);
                        }
                        res.redirect('/');
                    });
                }
            });
            con.release();
        });
    }
};
