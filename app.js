const express = require("express");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");
const port = 4000;

app.set("view engine","hbs");

const  publicDir = path.join(__dirname,"./public");
app.use(express.static(publicDir));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());


app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));1


app.listen(4000,()=>{
    console.log("Server is started at port no : "+ port);
})

