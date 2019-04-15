var LocalStrategy = require('passport-local').Strategy; //For authenticating email and password


module.exports = function (passport, dbClient) {

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

                //console.log("[Auth] checking if user is logged in for email: " + email + " password " + password);

                dbClient.query(
                    "SELECT * FROM account WHERE EMAIL= $1", [email],
                    (err, res) => {
                        if (res && res.rowCount > 0) {
                            if (!err) {
                                //res.rows.forEach((item) => console.log(item));
                                //console.log("RESULT::::" + res.rows[0]);
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
                    if (result.password == password){

                        dbClient.query(
                            "UPDATE account SET last_login= Now() where email=$1", [email],
                            (err, res) => {
                                if (err)
                                    console.log("[Auth] there was an error updating account " + email);

                                return done(null, result);

                            }
                        );

                    }
                    else
                        return done(null, false, req.flash("login", "Incorrect Password"));

                };


            }

        )
    );

    passport.use(
        'local-register',
        new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback : true

        },

        function (req, email, password, done) {
            //check if the passwords match
            var additionalData = [req.body.confirmPassword, req.body.fname, req.body.lname, req.body.phone];

            for (i in additionalData) {
                console.log(" data: " + additionalData[i]);
                if (additionalData[i] == "" || additionalData[i] == undefined)
                    return done(null, false, req.flash("register", "Something was left blank. All fields are mandatory."));
            }

            if (password == additionalData[0]) {
                //check if the user already exists in the database
                dbClient.query(
                    "SELECT * FROM account WHERE EMAIL= $1", [email],
                    (err, res) => {
                        if (res) {
                            if (res.rowCount > 0) {
                                console.log("[Register] That username has already been take. " + email);
                                return done(null, false, req.flash("register", "Sorry that user name has already been taken."));
                            } else {
                                dbClient.query(
                                    "INSERT INTO account(email, password, fname, lname, phone, created_on, last_login) VALUES ($1, $2, $3, $4, $5, Now(), Now());",
                                    [email, password, additionalData[1], additionalData[2], additionalData[3]],
                                    (err, res) => {
                                        if (res) {
                                            //console.log(res);
                                            var user = {
                                                email: email,
                                                password: password,
                                                fname: additionalData[1],
                                                lname: additionalData[2],
                                                phone: additionalData[3]
                                            };
                                            //console.log("User: " + JSON.stringify(user));
                                            return done(null, user);
                                        } else {
                                            console.log("There was an error inserting user into database");
                                            done(err);
                                        }


                                    }
                                )
                            }
                        } else if (err) {
                            done(err);
                        }
                    }
                );


            } else {
                console.log("[Register] Passwords do not match");
                return done(null, false, req.flash("register", "Passwords do not match."));

            }
        }
    )
    )

};
