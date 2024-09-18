const express = require('express')
const viewController = require('./../controller/viewController')
const authController = require('./../controller/authcontroller')
const bookingController = require('./../controller/bookingController')
const router = express.Router();

// router.use(authController.isLoggedIn)
// router.get('/',viewController.base)
router.use(viewController.alerts);
  router.get('/',authController.isLoggedIn,viewController.getOverview)
  
  router.get('/tour/:slug',authController.isLoggedIn,viewController.getTour)

  router.get('/me',authController.protect,viewController.getAccount)
  router.get('/my-tour',authController.protect,viewController.getMyTours)
  router.get('/login',authController.isLoggedIn,viewController.getLoginForm)
  router.get('/signup',viewController.getSignUp)
  

  

module.exports = router;
