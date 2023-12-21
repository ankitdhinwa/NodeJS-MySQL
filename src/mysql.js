const dotenv = require("dotenv");
const {createPool} = require("mysql");
const path = require("path");

dotenv.config({path: path.resolve(__dirname,'../.env')});

const pool = createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

pool.getConnection((err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("Database Connected!!");
    }
})

module.exports = pool;