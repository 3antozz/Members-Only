const express = require("express");
const session = require("express-session");
const path = require('node:path');
const passport = require('passport');
const pool = require('./db/pool');
const db = require('./db/queries');
const LocalStrategy = require('passport-local');
const bcrypt = require("bcryptjs");
const Store = require('connect-pg-simple')(session);
const indexRouter = require('./routers/indexRouter');


const app = express();

const sessionStore = new Store ({
    pool: pool,
    createTableIfMissing: true,
})

app.use(session({
    store: sessionStore,
    secret: process.env.FOO_COOKIE_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

passport.use(new LocalStrategy(async function verify(username, password, done) {
    try {
        const user = await db.getUser(username);
        const match = await bcrypt.compare(password, user.password);
        if (!user) { return done(null, false, {message: "Incorrect username"})}
        if (!match) { return done(null, false, {message: "Incorrect password"})}
        return done (null, user);
    } catch (error) {
        return done(error);
    }
}))

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.set('views', './views');
app.use(express.urlencoded({extended: true}));

app.use('/', indexRouter);






app.listen(3000, () => console.log("app listening on port 3000!"));
