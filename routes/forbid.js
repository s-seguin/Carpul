var express = require('express');
var router = express.Router();

module.exports = function(passport) {
    /* GET users listing. */
    router.get('/', function(req, res, next) {
        res.render('../public/forbidden.ejs');
    });

    return router;
};
