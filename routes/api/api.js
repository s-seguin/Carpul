var express = require('express');
var router = express.Router();

var dbClient;

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

function isAdmin(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){
        console.log(req.user.user_id);
        dbClient.query(
            "SELECT * FROM admin WHERE USER_ID=$1", [req.user.user_id],
            (err, dbRes) => {
                if (dbRes && dbRes.rowCount === 1) {
                    console.log('Got response from DB');
                    if (!err) {
                        //res.rows.forEach((item) => console.log(item));
                        //console.log("RESULT::::" + dbRes.rows[0]);
                        return next(); //there should only be one match
                    } else {
                        console.log('There was an error');
                        console.log(err.stack);
                        res.sendStatus(403);
                    }
                } else {
                    console.log('Not admin');
                    res.sendStatus(403);
                }
            }
        );
    } else {
        // if they aren't redirect them to the home page
        res.redirect('/login');
    }


}

module.exports = function(passport, db) {

    dbClient = db;


    /***
     * Return a list of users without password data
     */
    router.get('/users', isAdmin, function(req, res, next) {

        dbClient.query(
            "SELECT email, fname, lname, phone, last_login, created_on FROM account",
            (err, dbRes) => {
                if (dbRes && dbRes.rowCount > 0) {

                    if (!err) {
                        //res.rows.forEach((item) => console.log(item));
                        //console.log("RESULT::::" + dbRes.rows[0]);
                        return res.send({data: dbRes.rows, requester:req.user.email});; //there should only be one match
                    } else {
                        console.log(err.stack);
                        res.sendStatus(500);
                    }
                } else {
                    res.sendStatus(500);
                }
            }
        );


    });

    /***
     * Delete a user through a post request
     */
    router.post('/user/delete', isAdmin, function(req, res, next) {

        dbClient.query(
            "DELETE FROM account where EMAIL=$1", [req.body.email],
            (err, dbRes) => {
                if (dbRes) {
                    if (!err) {
                        //res.rows.forEach((item) => console.log(item));
                        //console.log("RESULT::::" + dbRes.rows[0]);
                        //return res.send({data: dbRes.rows, requester:req.user.email});; //there should only be one match
                        console.log(dbRes);
                        res.sendStatus(200);
                    } else {
                        console.log(err.stack);
                        res.sendStatus(500);
                    }
                } else {
                    res.sendStatus(500);
                }
            }
        );
    });

    ///todo: Cannot request spots in your own car
    ///todo: Cannot request multiple spots in a car
    ///REQUEST
    router.post('/request/new', isLoggedIn, function(req, res, next){
        dbClient.query(
            "INSERT INTO REQUEST(ride_id, user_id, updated_on, created_on) VALUES($1, $2, Now(), Now())", [req.body.ride_id, req.user.user_id],
            (err, dbRes) => {
                if (dbRes) {
                    if (!err) {
                       // console.log(dbRes);
                        res.sendStatus(200);
                    } else {
                        console.log(err.stack);
                        res.sendStatus(500);
                    }
                } else {
                    console.log(err.stack);

                    res.sendStatus(500);
                }
            }
        );
    });

    ///TODO: add logic to check capacity
    router.post('/request/accept', isLoggedIn, function(req, res, next){
        dbClient.query(
            "select ride.ride_id, ride.capacity, ride.available from ride join request on(ride.ride_id=request.ride_id) where request.request_id=$1",
            [req.body.request_id],
            (err, dbRes) => {
                if (dbRes) {
                    if (!err) {
                        console.log(dbRes.rows[0]);
                        //if there is still room in the car
                        if (dbRes.rows[0].available > 0 ) {
                            dbClient.query(
                                "UPDATE request SET accepted = 'TRUE', updated_on = Now() WHERE request_id = $1", [req.body.request_id],
                                (err, dbRes1) => {
                                    if (dbRes1) {
                                        if (!err) {
                                            //console.log(dbRes);
                                            //res.sendStatus(200);
                                            dbClient.query(
                                                "update ride set available = $1 where ride_id = $2",
                                                [dbRes.rows[0].available - 1, dbRes.rows[0].ride_id],
                                                (err, dbRes2) => {
                                                    if (!err)
                                                        res.sendStatus(200);
                                                    else
                                                        res.sendStatus(500);
                                                }
                                            );
                                        } else {
                                            console.log(err.stack);
                                            res.sendStatus(500);
                                        }
                                    } else {
                                        res.sendStatus(500);
                                    }
                                }
                            );
                        } else {
                            res.send('Ride full');
                        }
                    } else {
                        console.log(err.stack);
                        // res.sendStatus(500);
                    }
                } else {
                    //res.sendStatus(500);
                }
            }
        );


    });

    router.post('/request/decline', isLoggedIn, function(req, res, next){
        dbClient.query(
            "UPDATE request SET accepted = 'FALSE', updated_on = Now() WHERE request_id = $1", [req.body.request_id],
            (err, dbRes) => {
                if (dbRes) {
                    if (!err) {
                        //console.log(dbRes);
                        res.sendStatus(200);
                    } else {
                        console.log(err.stack);
                        res.sendStatus(500);
                    }
                } else {
                    res.sendStatus(500);
                }
            }
        );
    });

    return router;
};
