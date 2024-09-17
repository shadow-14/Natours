const {query} = require('express');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory.js')
// const catchAsync =require('./../utils/catchAsync')







exports.setTourUserIds = (req,res,next) => {
    if(!req.body.tour)req.body.tour = req.params.tourid;
    if(!req.body.user)req.body.user = req.user.id;
    next();
}

exports.getallReview = factory.getALL(Review);
exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);