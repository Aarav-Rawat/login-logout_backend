const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

app.get('/',(req,res) => {
     res.render('index');
});

app.post('/create', (req,res)=>{
   let{username,email,password,age} = req.body;

    bcrypt.genSalt(10, (err,salt)=>{
       bcrypt.hash(password,salt,async (err,hash)=>{
        let user = await userModel.create({
            username,
            email,
            password: hash,
            age
           })

           let token = jwt.sign({email},'secret');
           res.cookie("token",token);

           res.send(user);
       })
    })



})

app.get("/login",(req,res)=>{
    res.render('login')
})

app.post("/login",async (req,res)=>{
   let{email,password} = req.body;
   let user = await userModel.findOne({email});
   if(!user){
     res.send("Invalid");
   }

   bcrypt.compare(password,user.password,function(err,result){
       if(result){
        let token = jwt.sign({email},'secret');
        res.cookie("token",token);
        res.send("Vaild");
       }
    else
    res.send("Invaild")
   });
})

app.get("/logout",function(req,res){
    res.cookie("token","");
    res.redirect("/");
})

app.listen(3000);