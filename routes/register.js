var express = require('express');
var router = express.Router();

module.exports = function(passport) {
    /* GET users listing. */
    router.get('/', function(req, res, next) {
        res.render('../public/register.ejs', {title: 'Register', message:''});
    });

    router.post('/', function(req, res, next) {
        //console.log(req);
        res.send(200);
    });

    return router;
};
