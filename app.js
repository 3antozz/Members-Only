const express = require("express");
const session = require("express-session");
const path = require('node:path');
const pool = require('./db/pool');
const Store = require('connect-pg-simple')(session);
const indexRouter = require('./routers/indexRouter');
const passport = require('passport');



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
app.use(passport.session());
require('./routers/auth');

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.set('views', './views');
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    if(req.user) {
        console.log(req.user);
        res.locals.currentUser = req.user;
    }
    next();
})

app.use('/', indexRouter);






app.listen(3000, () => console.log("app listening on port 3000!"));
