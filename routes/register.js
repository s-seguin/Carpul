var express = require('express');
var router = express.Router();

module.exports = function(passport) {
    /* GET users listing. */
    router.get('/', function(req, res, next) {
        res.render('../public/register.ejs', {title: 'Register', message: req.flash('register')});
    });

    router.post('/', passport.authenticate('local-register', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/register', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    return router;
};
