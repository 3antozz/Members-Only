const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
const db = require('../db/queries');

const indexRouter = Router();
const checkAuth = asyncHandler((req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        const error = new Error('You need to login to access this page');
        error.status = 401;
        next(error); 
    }
})

const checkAdmin = asyncHandler((req, res, next) => {
    if(req.isAuthenticated() && req.user.membership === "admin") {
        next();
    } else {
        const error = new Error('You are not authorized to access this page');
        error.status = 401;
        next(error); 
    }
})
const validateMessage = [
    body("message_title").trim().notEmpty().withMessage("Title must not be empty").isLength({min: 5, max: 35}).withMessage('Title must be between 5 and 20 characters'),
    body("message_text").trim().notEmpty().withMessage("Message must not be empty").isLength({min: 5}).withMessage('Title must be atleast 5 characters long'),
];

indexRouter.get('/', asyncHandler(async(req, res, next) => {
    let messages;
    try {
        messages = await db.getMessages();
    } catch(error) {
        console.log(error);
        return next(error);
    }
    res.render('index', {title: "Home", messages: messages});
}))

indexRouter.get('/message', checkAuth, asyncHandler((req, res) => {
    res.render('message', {title: 'Create a new message'})
}))

indexRouter.post('/message', checkAuth, validateMessage, asyncHandler(async(req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty()) {
        return res.render('message', {title: 'Create a new message', errors: result.errors})
    }
    const { message_title, message_text } = req.body;
    const id = req.user.id;
    try {
        await db.addMessage(id, message_title, message_text);
    } catch(error) {
        console.log(error);
        return res.render('message', {title: 'Create a new message', errors: [{msg: error.message}]})
    }
    res.redirect('/');
}))

indexRouter.post('/delete/:messageID', checkAdmin, asyncHandler(async (req, res) => {
    const id = req.params.messageID;
    await db.deleteMessage(id);
    res.redirect('/');
}))








module.exports = indexRouter;