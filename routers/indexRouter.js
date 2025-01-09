const { Router } = require('express');
const asyncHandler = require('express-async-handler');

const indexRouter = Router();

const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.send('You are not authorized to access this page');
    }
}

indexRouter.get('/', asyncHandler((req, res) => {
    res.render('index', {title: "Home"});
}))



indexRouter.get('/protected', checkAuth, (req, res) => {
    res.send('Hello there, this is a protected route');
} )


module.exports = indexRouter;