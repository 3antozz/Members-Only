const { Router } = require('express');
const passport = require('passport');

const indexRouter = Router();



indexRouter.get('/sign-up', (req, res) => {
    res.render('sign-up', {title: 'Sign Up'})
})

indexRouter.post('/sign-up', passport.authenticate('local', {failureRedirect: '/sign-up'}))