const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/Users');
const bcrypt = require('bcrypt')


function initialize() {
    const authenticateUser = (email, password, done) => {
        User.findOne({email: email})
        .then(async user => {
            if(user == null) {
                return done(null, false, {message: 'wrong email'})
            }
            else if(await bcrypt.compare(password, user.password)){
                return done(null, user, {message: 'login successful'})
            }
            return done(null, false, {message: 'wrong password'})
        })
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}

module.exports = initialize