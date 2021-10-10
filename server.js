const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

let app = express();

//Passport config
require('./Config/passport')(passport);

//Setting Up Database
mongoose.connect('mongodb://localhost/nodeuser', {useNewUrlParser: true, useUnifiedTopology: true})
.then((result)=> console.log("DB Connected"))
.catch((err)=> console.error(`DB Error: ${err}`))

//Setting up view engine
app.set('view engine', 'ejs');

//Public files
app.use(express.static('public'));
//Body parser
app.use(express.urlencoded({extended:true}))
app.use(express.json())
//Express Session
app.use(session({
    secret: "283y73hwf",
    resave: true,
    saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash())
//Global Variable
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
});

app.use(morgan("dev"))

const indexRoute = require('./routes/index')
app.use('/', indexRoute);

const userRoute = require('./routes/user')
app.use('/user', userRoute);


//middleware
app.use((req, res, next)=>{
    res.send("Sorry, Page not found. An error Occurred!!!")
    next()
});

const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log(`Running on PORT: ${port}`);
})