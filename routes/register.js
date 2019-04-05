var express = require('express');
var router = express.Router();
var passport = require('passport');
var dbConn = require('../config/database');
var pg = require('pg');
//var conString = "postgres://admin:admin@localhost:5432/carpul";

const client = new pg.Client(dbConn.conn);
const queryStr = 'SELECT * from account;';



/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('../public/register.ejs', {title: 'Register', message:''});
});

router.post('/', function(req, res, next) {
    //console.log(req);
    res.send(200);
});

function query() {
    client.connect();
    client.query(query, (err, res) => {
        if (!err) {
            res.rows.forEach((item) => console.log(item));
        } else {
            console.log(err.stack);
        }
        client.end()
    })
}

async function query2() {
    console.log("query2");
    await client.connect();
    let res = await client.query(queryStr);
    res.rows.forEach(row=>{
        console.log(row);
    });
    await client.end();
}
module.exports = router;
