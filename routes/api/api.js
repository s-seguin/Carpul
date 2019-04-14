var express = require('express');
var router = express.Router();

var dbClient;

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


    /* GET users listing. */
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

    router.post('/user/delete', isAdmin, function(req, res, next) {
        console.log(req.body.email);
        res.send("Deleting " + req.body.email);
    });


    return router;
};
