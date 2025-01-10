const { Router } = require('express');
const asyncHandler = require('express-async-handler');

const indexRouter = Router();

indexRouter.get('/', asyncHandler((req, res) => {
    res.render('index', {title: "Home"});
}))








module.exports = indexRouter;