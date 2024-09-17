const express = require('express')
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authcontroller');

const router = express.Router({mergeParams: true});

router.use(authController.protect);

router.route('/').get(reviewController.getallReview).post(authController.restrictTo('user'),reviewController.setTourUserIds,reviewController.createReview)
// router.route('/:tourId/allreviews').get(reviewController.getallReview);
// router.route('/:tourId/createReview').post(reviewController.createReview);

router.route('/:id').delete(authController.restrictTo('admin','user'),reviewController.deleteReview).patch(authController.restrictTo('admin','user'),reviewController.updateReview).get(reviewController.getReview);



module.exports = router;