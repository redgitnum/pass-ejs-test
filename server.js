const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/Users');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport')

const app = express();


app.set('view engine', 'ejs')
app.use(cors())
app.use(flash())
app.use(express.urlencoded({extended: false}))

require('dotenv').config()
const uri = process.env.MONGO_URI
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}, () => console.log('MongoDb connection...'))

const initializePassport = require('./passport-config')
initializePassport();

app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session())

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {name: req.user.name})
})

app.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login')
})

app.post('/login', isNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: true
}))

app.post('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login')
})

app.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register')
})

app.post('/register', isNotAuthenticated, async (req, res) => {
    let {name, email} = req.body;
        let hashedPassword = await bcrypt.hash(req.body.password, 10)
        User.findOne({email: email})
        .then(user => {
            if(!user) {
                let newUserData = {name, email, password: hashedPassword}
                let newUser = new User(newUserData)
                newUser.save()
                .then(() => console.log('new user added'))
                .then(() => res.redirect('/login'))
            }
            else {
                console.log('user with that email already exists')
                return res.redirect('register')
            }
})
})

function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function isNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(5000, () => console.log('connected to port 5000'))