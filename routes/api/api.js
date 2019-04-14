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


    ///REQUEST
    router.post('request/new', isLoggedIn, function(req, res, next){
        dbClient.query(
            "INSERT INTO REQUEST() FROM account where EMAIL=$1", [req.body.email],
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

    router.post('request/accept', isLoggedIn, function(req, res, next){

    });

    router.post('request/decline', isLoggedIn, function(req, res, next){

    });

    return router;
};
