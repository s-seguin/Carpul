//Store the connection string for our database
//load environment variables
require('dotenv').config();
module.exports = {
    'herokuConn': process.env.DATABASE_URL,
    'localConn': process.env.LOCAL_DATABASE_URL,
    'ssl': process.env.SSL
};