var express = require('express');
var router = express.Router();

var dbClient;

// route middleware to make sure a user is logged in
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
                        res.redirect('/forbid');
                    }
                } else {
                    console.log('Not admin');
                    res.redirect('/forbid');
                }
            }
        );
    } else {
        // if they aren't redirect them to the home page
        res.redirect('/login');
    }


}

module.exports = function (passport, db) {

    dbClient = db;


    router.get('/', isAdmin, function(req, res, next) {
        res.render('../public/admin.ejs', {title: 'Admin'});
    });

    return router;
};
