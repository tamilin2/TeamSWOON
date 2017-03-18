/**
 * Created by Jeffers on 2/26/2017.
 */
let authenticator = require('./../routes/authenticator');
let connection = require('./user');
async = require('async');
let nodemailer = require('nodemailer');
let fs = require('fs');

// Create Gmail transport to compose emails with given account
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        /* set email and password to use nodemailer */
        user: 'do.not.reply.ucsd.clubs@gmail.com',
        pass: 'ce101901'
    }
});

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
        req.checkBody('phone', 'Phone number is required').notEmpty();
        req.checkBody('email', 'UCSD Email is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        // Requires the user to enter matching passwords as confirmation
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
        let errors = req.validationErrors();

        req.session.profile = { fname:firstname, lname:lastname, phone:phone, email: email};

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
                    req.flash('errorMsg', err.message);
                    res.redirect('/users/createUserProfile');
                }
                else {
                    conn.query(query, [firstname, lastname, email, phone, password], function (err) {
                        conn.release();
                        if (err) {
                            // Error in duplicate email
                            req.flash('errorMsg', err.message);
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
        let query = "UPDATE student SET "; let queryActions = '';
        let queryCondition = " WHERE student.email = \'" + req.session.user.email + "\'";
        
        let fname = req.body.firstname;
        let lname = req.body.lastname;
        let phone = authenticator.parse_phoneNum(req.body.phone);

        // Query to update user profile
        connection(function (err, conn) {
            if (err) {
                req.flash('errorMsg', err.message);
                res.redirect('/users/editUserProfile');
            }
            else {
                /* Checks if user has entered new info to update*/
                if (phone !== req.session.user.phone) {
                    queryActions += "student.phone = " + conn.escape(phone) + ", ";
                }
                if (fname !== req.session.user.fname) {
                    queryActions += "student.first_name= " + conn.escape(fname) + ", ";
                }
                if (lname!== req.session.user.lname) {
                    queryActions += "student.last_name= " + conn.escape(lname) + ", ";
                }
                if(!authenticator.verify_phone(req, res, phone)) {
                    res.redirect('/users/editUserProfile');
                }
                else if (queryActions !== '') {
                    // Truncate last comma in queryActions and concatenates query with given action strings and club specifier
                    query += (queryActions.substring(0, queryActions.length - 2) + queryCondition);
                    // Replace existing db entry with modified data
                    let cmd = conn.query(query, [fname, lname, req.session.user.email, phone, req.session.user.password], function (err, rows) {
                        console.log(cmd.sql);
                        if (err) {
                            req.flash('errorMsg', err.message);
                            res.redirect('/users/editUserProfile');
                        }
                        else {
                            // Since update success, represent session with the user's new credential
                            req.session.user = {
                                fname: fname,
                                lname: lname,
                                email: req.session.user.email,
                                phone: phone,
                                password: req.session.user.password
                            };
                            req.flash('successMsg', 'Updated profile');
                            res.redirect('/');
                        }
                    });
                }
                else {
                    req.flash('errorMsg', 'Nothing new to update');
                    res.redirect('/users/editUserProfile');
                }
            }
            conn.release();
        });
    },

    /**
     * User requesting to update password
     */
    update_password: function (req, res) {
        let query = "replace into student (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)";
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
                    req.flash('errorMsg', err.message);
                    res.redirect('/users/changePassword');
                }
                else {
                    // Replace existing db entry with modified data
                    conn.query(query, [req.session.user.fname, req.session.user.lname, req.session.user.email, req.session.user.phone, password], function (err, rows) {
                        if (err) {
                            req.flash('errorMsg', err.message);
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

        // Initializes session schedules as array
        req.session.schedules = [];

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
        else { pic = 'default.jpg'; }

        // Required fields that we want
        req.checkBody('clubname', 'Club name is required').notEmpty();
        req.checkBody('phone', 'Require phone number').notEmpty();
        req.checkBody('email', 'Required email is not valid').isEmail();
        req.checkBody('description', 'Club description is required').notEmpty();
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
                    req.flash('errorMsg', err.message);
                    res.redirect('/users/createClubProfile');
                }
                else {
                    // Create new club row with given credentials on database
                    conn.query(query, [req.session.user.email, phone, description, clubname, email, socialLink, pic], function (err) {
                        if (err) {
                            req.flash('errorMsg', err.message);
                            res.redirect('/users/createClubProfile');
                        }
                        else {
                            // tentatively set var used to check if any errors were thrown during the following loop
                            var errCheck = false;
                            // loop through all fields of schedule array, inserting each as a row in the club_schedule table
                            var errorCheck = false;
                            
                            // loop through the interests array, inserting each as a row in the club_interest table
                            for (var i = 0; i < interests.length; i++) {
                                conn.query(query_cl, [clubname, interests[i]], function (err) {
                                    if (err) {
                                        errCheck = true;
                                        throw err;
                                    }

                                });
                                
                                if (errCheck) {break;}
                            }
                            
                            for (var s = 0; s < day.length; s++){
                                conn.query(query_sched, [clubname, day[s],start[s],end[s],location[s]],
                                    function (err) {
                                        if (err) {
                                            errorCheck = true;
                                            throw err;
                                        }
                                    });
                                if (errorCheck) {break;}
                                // Saves club schedule info to load onto club page
                                req.session.schedules.push({day: day[s], startTime: start[s], endTime: end[s], location: location[s]});
                            }
                            conn.release();

                            if (errCheck) { //error check for club interests
                                req.flash('errorMsg', 'Failed to create club: Interests');
                                res.redirect('/users/createClubProfile');
                            }
                            else if(errorCheck) {
                                    req.flash('errorMsg', 'Failed to create club: Schedule');
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

                                 // Clears saved user input in creation forms
                                req.session.profile = undefined;

                                res.render('pages/clubPage', {club: req.session.club, schedules: req.session.schedules});
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
        // Saves current club name
        let currClubName = req.session.club.name;

        let updateClubQuery = "UPDATE club SET "; let updateClubQueryCond = " WHERE club.name = ?";
        let queryActions = "";

        // MySQL query to insert into club_interest table
        let delInterestQuery = "Delete FROM club_interest WHERE club_interest.club_name = ? ";
        let insInterestQuery = "INSERT INTO club_interest (club_name, interest) VALUES (?, ?) ";

        // MySQL query to insert into club_schedule table

        let insSchedQuery = "INSERT INTO club_schedule (clubName, day, startTime, endTime, location) VALUES (?,?,?,?,?) ";
        let delSchedQuery = "DELETE FROM club_schedule WHERE club_schedule.clubName = ? ";

        // Tracks if error exists
        let error = null, query = null;

        // User input from request body
        let name = req.body.clubName;
        let clubEmail = req.body.clubEmail;
        let description= req.body.description;
        let phone= req.body.phone;
        let socialLink = req.body.socialLink;
        let interests = req.body.interests;
        let day = req.body.day;
        let start = req.body.startTime;
        let end = req.body.endTime;
        let location = req.body.location;
        let img = null;
        if (req.file !== undefined) { img = req.file.originalname; }

        // Query to modify club info
        connection(function (err, conn) {
            if (err) {
                // Keep error to display later
                error = err;
            }
            else {
                // If an input field is not empty then update it onto db entry
                if (name) {
                    req.session.club.name = name;
                    queryActions += "club.name = " + conn.escape(name) + ", ";
                }
                if (clubEmail) {
                    req.session.club.clubEmail = clubEmail;
                    queryActions += "club.clubEmail = " + conn.escape(clubEmail) + ", ";
                }
                if (description && (description !== req.session.club.description)) {
                    req.session.club.description = description;
                    queryActions += "club.description = " + conn.escape(description) + ", ";
                }
                if (socialLink) {
                    req.session.club.socialLink = socialLink;
                    queryActions += "club.socialLink = " + conn.escape(socialLink) + ", ";
                }
                if (phone) {
                    phone = authenticator.parse_phoneNum(phone);
                    req.session.club.phone = authenticator.format_phone(phone);
                    queryActions += "club.phone = " + conn.escape(phone) + ", ";
                }
                if (img) {
                    req.session.club.img = img;
                    queryActions += "club.img = " + conn.escape(img) + ", ";
                }

                /* Handles modified club information if there exists  */
                if (queryActions !== '') {
                    // Truncate last comma in queryActions and concatenates query with given action strings and club specifier
                    updateClubQuery += (queryActions.substring(0, queryActions.length - 2) + updateClubQueryCond);
                    conn.query(updateClubQuery, [currClubName], function (err) {
                        if (err) {
                            error = err;
                        }
                    });
                }else if (!interests ) {
                    error = {message: 'No data was added'};
                }
            }
            conn.release();
        });

        // Requires users to have at least one club category selected; each schedule must have a day
        if(!interests) {
            error = {message: 'No interests were added'};
        }
        // Insert data if there was not an error in previous queries
        else if (error === null) {
            /* Query to delete all interests and schedules a club has */
            connection( function (err, conn) {
                if (err) {
                    // Keep error to display later
                    error = err;
                }
                // Delete club interests
                conn.query(delInterestQuery, req.session.club.name, function (err, rows) {
                    if (err) {
                        error = err;
                    }
                });
                if (error === null) {
                    // Delete club schedules if deleting club interests didn't cause an error
                    conn.query(delSchedQuery, req.session.club.name, function (err, rows) {
                        if (err) {
                            error = err;
                        }
                        else {
                            // Clear out club schedules if no errors
                            req.session.schedules = [];
                        }
                    });
                }
                conn.release();
            });
        }

        // Loads error page if there exists an error
        if (error) {
            req.flash('errorMsg', error.message);
            res.redirect('/users/editClubProfile');
        }
        // Continue with inserting interests if error wasn't set
        else {
            // Empty current schedules when recording new schedules
            req.session.schedules = [];

            // Query to insert new club interests and schedules
            connection( function (err, conn) {
                // loop through the interests array, inserting each as a row in the club_interest table
                for (var i = 0; i < interests.length; i++) {
                    // Insert new row of a club's interest using up to date name
                    conn.query(insInterestQuery, [req.session.club.name, interests[i]], function (err) {
                        if (err) {
                            error = err;
                        }
                    });
                    // Breaks insert interests if error exists
                    if (error !== null) {
                        break;
                    }
                }
                // Continue with inserting schedules if error wasn't set
                if (error === null) {
                    for (var s = 0; s < day.length; s++) {
                        // Insert new row of a club's schedule using up to date name
                        conn.query(insSchedQuery, [req.session.club.name, day[s], start[s], end[s], location[s]], function (err) {
                            if (err) {
                                error = err;
                            }
                        });
                        // Break insert schedule if there exists error
                        if (error !== null) {
                            break;
                        }

                        // Saves club schedule info to load onto club page
                        req.session.schedules.push({
                            day: day[s],
                            startTime: start[s],
                            startTime12: authenticator.formatTime(start[s]),
                            endTime: end[s],
                            endTime12: authenticator.formatTime(end[s]),
                            location: location[s]
                        });
                    }

                    // Load club page with up to date club info, interest, and schedule
                    res.render('pages/clubPage', {club: req.session.club, schedules: req.session.schedules});
                }
                conn.release();
            });
        }
    },

    /**
     * User requesting to delete club profile
     */
    delete_club : function (req, res) {
        let query = "Delete FROM club WHERE club.name = ? AND club.clubEmail = ?";
        let interest_query = "Delete FROM club_interest WHERE club_interest.club_name = ? ";
        let schedule_query = "Delete FROM club_schedule WHERE club_schedule.clubName = ? ";

        let name = req.body.clubName;
        let email = req.body.clubEmail;

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
                });
            }
        });

        // Query to delete club's schedule relation in club_schedule
        connection(function (err, conn) {
            if (err) {
                req.flash('errorMsg', 'Bad connection with database');
                res.redirect('/users/editClubProfile');
                return;
            }
            else {
                // Replace existing db entry with modified data
                conn.query(schedule_query, [name], function (err, rows) {
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
    },

    /**
     * Get a single club's info for club page profile
     */
    getClub : function (req, res)   {
        let clubname = req.body.clubname;

        let query_action = "SELECT * FROM club WHERE club.name = ?";
        let query_schedule = "SELECT TIME_FORMAT(startTime, '%H:%i') AS 'startTime'," +
                             "TIME_FORMAT(endTime, '%H:%i') AS 'endTime'," +
                             "TIME_FORMAT(startTime, '%h:%i%p') AS 'startTime12'," +
                             "TIME_FORMAT(endTime, '%h:%i%p') AS 'endTime12'," +
                             "day, location " +
                             "FROM club_schedule WHERE club_schedule.clubName = ?";

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

                    // Query searches for schedules with of given club
                    con.query(query_schedule, [clubname],function (err, rows) {
                        con.release();
                        if (err) {
                            req.flash('errorMsg', 'Failed to query to database');
                            res.redirect('/');
                        }
                        // Query returns found clubs with schedule so load them on search page
                        else {
                            req.session.schedules = rows;
                            res.render('pages/clubPage', {club: req.session.club, schedules: req.session.schedules});
                        }
                    });
                }
            });
        });
    },
    
    /**
     * Get clubs matching interests and schedule
     */
    getClubByFilter: function (req, res) {
        let queryByFilter = "SELECT DISTINCT club.leaderEmail, club.phone, club.description, club.name, club.clubEmail, " +
                            "club.socialLink, club.img FROM club " +
                            "JOIN club_interest ON club.name = club_interest.club_name " +
                            "JOIN club_schedule ON club.name = club_schedule.clubName " +
                            "WHERE";
        let queryResultOrder = ' ORDER BY club.name ASC';

        let queryClubInterests = "select * from club_interest";

        // Loop through all selected interests to filter if selected
        if ( req.body.checkbox && req.body.checkbox.length > 0) {
            for (item in req.body.checkbox) {
                queryByFilter += ' club_interest.interest = \'' + req.body.checkbox[item] + '\' OR';
            }
            // Remove the last 'OR' string for query syntax and insert 'AND' for extra search conditions based on schedule
            queryByFilter = queryByFilter.substring(0, queryByFilter.length - 3) + ' AND';
        }

        // Add day preference if selected, else make it blank
        if (req.body.day !== 'N/A') {
            queryByFilter += ' club_schedule.day = \'' + req.body.day + '\' AND';
        } else { req.body.day = ''; }
        // Add start time preference if selected, else make it blank
        if (req.body.startTime) {
            queryByFilter += ' \'' + req.body.startTime + '\' <= club_schedule.startTime AND';
        }else { req.body.startTime = ''; }
        // Add end time preference if selected, else make it blank
        if (req.body.endTime) {
            queryByFilter += ' club_schedule.endTime <= \'' + req.body.endTime + '\'';
        } else {
            req.body.endTime= '';
            // Remove last 'AND' if user doesn't search for club meeting end time
            queryByFilter = queryByFilter.substring(0, queryByFilter.length - 4);
        }

        // Saves user time preference as object
        let userTimePref = {
            day: req.body.day,
            startTime: authenticator.formatTime(req.body.startTime),
            endTime: authenticator.formatTime(req.body.endTime),
            timeFormat: (req.body.startTime !== '' && req.body.endTime !== '') ? '-' : ' '
        };
        console.log(userTimePref);

        connection(function (err, con) {
            if (err) {
                res.render('/', {errors: errors});
            }
            else {
                con.query(queryByFilter + queryResultOrder,function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', err.message);
                        res.redirect('/');
                    }
                    else if (rows[0] == null) {
                        // Renders search page without found clubs
                        res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: req.body.checkbox, timePref: userTimePref});
                    }
                    // Query returns found clubs so find their corresponding tags to load
                    else {
                        con.query(queryClubInterests, function(erro, search_interest_rows) {
                            if(erro) {
                                req.flash('errorMsg', erro.message);
                                res.redirect('/');
                            }
                            else if(search_interest_rows[0] == null) {
                                // Renders search page with clubs without interest tags
                                res.render('pages/searchPage', {clubs: rows, search_interests: undefined, search: req.body.checkbox, timePref: userTimePref});
                            }
                            else {
                                res.render('pages/searchPage', {clubs: rows, search_interests: search_interest_rows, search : req.body.checkbox, timePref: userTimePref});
                            }
                        });
                    }
                });
                con.release();
            }
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
                        req.flash('errorMsg', err.message);
                        res.redirect('/');
                    }
                    // When no clubs shows up
                    else if (rows[0] == null) {
                        res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: null, timePref: null});
                    }
                    // Query returns found clubs so load them on search page
                    else {
                        con.query(query_interest, function(erro, search_interest_rows) {
                            if(erro) {
                                req.flash('errorMsg', error.message);
                                res.redirect('/');
                            }
                            else if(search_interest_rows[0] == null) {
                                res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: null, timePref: null});
                            }
                            else {
                                res.render('pages/searchPage', {clubs: rows, search_interests: search_interest_rows, search : null, timePref: null});
                            }
                        });
                    }
                });
                con.release();
            }
        });
    },

    /**
     * System requesting club info by name
     */
    getClubBySearch: function (req, res) {
        /*
         * Query searches for clubs whose name or interest matches a given string
         */
        let query_action = "SELECT DISTINCT club.leaderEmail, club.phone, club.description, club.name, club.clubEmail, " +
                            "club.socialLink, club.img FROM club WHERE club.name LIKE ?";

        let query_interest = "SELECT * FROM club_interest";


        let search = req.body.searchbar;
        
        connection(function (err, con) {
            if (err) {
                res.render('/', {errors: errors});
            }
            else {
                con.query(query_action, ['%'+search+'%', '%'+search+'%'],function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', err.message);
                        res.redirect('/');
                    }
                    // Assures the query returns a club entry
                    else if (rows[0] == null) {
                        res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: search, timePref: null});
                    }
                    // Query returns found clubs so load them on search page
                    else {
                        con.query(query_interest, function(erro, search_interest_rows) {
                            if(erro) {
                                req.flash('errorMsg', 'Failed to connect to database: interests');
                                res.redirect('/');
                            }
                            else if(search_interest_rows[0] == null) {
                                res.render('pages/searchPage', {clubs: undefined, search_interests: undefined, search: search, timePref: null});
                            }
                            else {
                                res.render('pages/searchPage', {clubs: rows, search_interests: search_interest_rows, search : search, timePref: null});
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
        let query_action = "SELECT * FROM club WHERE club.leaderEmail = ? Order by club.name";
        
        connection(function (err, con) {
            if (err) {
                res.render('/', {errors: errors});
            }
            else {
                con.query(query_action, [req.session.user.email],function (err, rows) {
                    if (err) {
                        req.flash('errorMsg', err.message);
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
                            req.flash('errorMsg', err.message);
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
        let mailOptions = {
            from: req.body.fromEmail,
            to: req.body.toEmail,
            subject: req.body.subject,
            text: req.body.body,
            html: "<div><p>" + req.body.body + '</p><br><p>' + '\nFrom: ' + req.body.fromEmail + "</p></div>"
        };

        console.log(mailOptions);
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.error(err);
                req.flash('errorMsg', err.message);
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
        let userEmail = req.body.email;

        let query = "SELECT student.password FROM student WHERE student.email = ?";

        connection(function (err, con) {
            con.query(query, [userEmail],function (err, rows) {
                if (err) {
                    req.flash('errorMsg', err.message);
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
                            req.flash('errorMsg', err.message);
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
