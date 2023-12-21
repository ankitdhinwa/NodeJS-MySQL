const pool = require("../src/mysql");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {promisify} = require("util");

exports.login = async(req,res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).render("login",{message: "Please provide email and password!!"});
    }

    pool.query('SELECT * FROM webdev WHERE email = ?',[email], async(err,result)=>{
        try {
            if(!result || !(await bcrypt.compare(password, result[0].password))){
                return res.status(401).render("login",{message:"Please provide correct email or password!!"})
            }

            const id = result[0].id;

            const token = jwt.sign({id: id}, process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_EXPIRES_IN});

            //console.log(token);

            const cookieOptions = {
                expires: new Date(Date.now() + process.env.COOKIE_EXPIRES*24*60*60*1000),
                httpOnly: true
            }

            res.cookie('jwtankit',token, cookieOptions);
            res.status(200).redirect("/");
        } catch (err) {
            console.log(err)
        }
    })

}

exports.register = (req,res)=>{
    //console.log(req.body);
    // res.send("Form submitted!!")

    const {username,email,password,confpassword} = req.body;
    pool.query('SELECT * FROM webdev WHERE email = ?',[email],async(err,result)=>{
        if(err){
            console.log(err);
        }

        if(result.length>0){
            // console.log(result);
            return res.render('register',{message:"Email is already used!!"});
        }
        else if(password !== confpassword){
            return res.render('register',{message:"Password do not match!!"});
        }
        
       let hashedPass = await bcrypt.hash(password,8);
       //console.log(hashedPass);
       pool.query('INSERT INTO webdev SET ?',{username: username, email: email, password:hashedPass},(err,result)=>{
        if(err){
            console.log(err);
        }
        else{
            //console.log(result);
            return res.render('register',{message:'User registered successfully!!'});
        }
       });
    })
}

exports.isLoggedIn = async(req,res,next)=>{
    //console.log(req.cookies)

    if(req.cookies.jwtankit){
        try {
        
            //Step1: Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwtankit, process.env.JWT_SECRET_KEY);
            //console.log(decoded);
            
            //Step2: Check that user still exists or not
            pool.query('SELECT * FROM webdev WHERE id=?',[decoded.id],(err,result)=>{
                //console.log(result);
                if(!result){
                    next();
                }

                req.user = result[0];
                return next();
            })
        

        } catch (error) {
            return next();
        }
    }
    
    else{
        return next();
    }
}

exports.logout = (req,res)=>{
    res.cookie('jwtankit','logout',{
        expires: new Date(Date.now()+2*1000),
        httpOnly:true
    })

    res.status(200).redirect("/");
}