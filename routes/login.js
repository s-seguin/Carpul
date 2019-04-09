var express = require('express');
var router = express.Router();

module.exports = function (passport) {

    router.get('/', function(req, res, next) {
        res.render('../public/login.ejs', {title: 'Login', message:req.flash('login')});
    });

    router.post('/', passport.authenticate('local-login', {
        successRedirect : '/main', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    return router;
};
