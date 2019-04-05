var LocalStrategy = require('passport-local').Strategy; //For authenticating email and password


//db stuff
var dbConn = require('../config/database');
var pg = require('pg');
var dbClient = new pg.Client(dbConn.conn);

dbClient.connect();


module.exports = function (passport) {

// Session Setup ==============================================================
// Needed for persistent logins

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    /**
     * LOGIN
     * */
    passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback : true
            },

            function (req, email, password, done) {

                console.log("[Auth] checking if user is logged in for email: " + email + " password " + password);

                dbClient.query(
                    "SELECT * FROM account WHERE EMAIL= $1", [email],
                    (err, res) => {
                        if (res && res.rowCount > 0) {
                            if (!err) {
                                res.rows.forEach((item) => console.log(item));
                                console.log("RESULT::::" + res.rows[0]);
                                return (checkPasswordMatches(res.rows[0])); //there should only be one match
                            } else {
                                console.log(err.stack);
                                return done(err);
                            }
                        } else {
                            return done (null, false, req.flash("login", "Incorrect Password or Username"));
                        }
                    }
                );

                var checkPasswordMatches = function(result) {
                    if (result.password == password)
                        return done(null, result);
                    else
                        return done(null, false, req.flash("login", "Incorrect Password"));

                };


            }

        )
    );

};