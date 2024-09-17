const express = require('express');
const tourController = require('./../controller/tourController');
const router = express.Router();
const authcontroller = require('./../controller/authcontroller');
const reviewRouter = require('./../routes/reviewRoutes');

// router.param('id', tourController.checkID);

// Create a checkbody middleware
//check if body contains the name and price properties
// If not, send back the 400 {bad request}
router.use('/:tourid/reviews',reviewRouter)

router.route('/monthly-plan/:year').get(authcontroller.protect,authcontroller.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);


router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);


router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);


router
  .route('/')
  .get(tourController.getAllTours)
  .post(authcontroller.protect,authcontroller.restrictTo('admin','lead-guide'),tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authcontroller.protect,authcontroller.restrictTo('admin','lead-guide'),tourController.uploadTourImages,tourController.resizeTourImages,tourController.updatedTour)

  .delete(authcontroller.protect,authcontroller.restrictTo('admin','lead-guide'),tourController.deleteTour);

  // router.route('/:tourid/reviews').post(authcontroller.protect,authcontroller.restrictTo('user'),reviewController.createReview);

module.exports = router;
