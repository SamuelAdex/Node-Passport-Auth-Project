const {Router} = require("express");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../Config/auth');
//User model
const User = require("../models/User");

let router = Router();

//GET request route
router.get('/login', (req, res)=>{
    res.render('login', {errors});
});

router.get('/register', (req, res)=>{
    res.render("register", {errors})
});

router.get('/dashboard', ensureAuthenticated, (req, res)=>{
    res.render("dashboard", {name: req.user.name})
});

let errors = [];
//POST Request route
router.post('/register', (req, res)=>{
    const {name, email, password1, password2} = req.body;
    
    //Check required fields
    if(!name || !email || !password1 || !password2){
        req.flash('error_msg', "Please fill in all fields")
    }
    //Check Password match
    if(password1 !== password2){
        req.flash('error_msg', "Password do not match")
    }
    //Check password length
    if(password1.length < 6){
        req.flash("error_msg", "Password should be at least 6 characters")
    }

    //Check if errors exist
    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password1,
            password2
        })
        console.log(errors)
    }else{
        //Validation passed
        User.findOne({email: email})
        .then(user =>{
            if(user){
                req.flash("error_msg", "Email Already Registered");
                res.render('register', {
                    errors,
                    name,
                    email,
                    password1,
                    password2
                })
            }else{
                const newUser = new User({
                    name: name,
                    email: email,
                    password: password1
                });
                
                //Hash Password
                bcrypt.genSalt(10, (err, salt)=> bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    if(err) throw err;
                    //Set password to hashed
                    newUser.password = hash;
                    //Save User
                    newUser.save()
                        .then(user => {
                            req.flash("success_msg", "You are now Registered")
                            res.redirect('/user/login')
                        })
                        .catch(err => console.log(errors));
                }))

            }
        })
    }
});

//Login Handle
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/user/dashboard',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

//Logout Handle
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', 'You are Logged out');
    res.redirect('/user/login');
})


module.exports = router;