/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const express = require('express');

const userController = require('./../controller/userController');
const authController = require('./../controller/authcontroller');

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
 router.get('/logout',authController.logout);
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);

// protect all routes after thuis middlewate
router.use(authController.protect);


router.patch('/updateMyPassword',authController.updatePassword);


router.get('/me',userController.getMe,userController.getUser);
router.patch('/updateMe',userController.uploadPhoto,userController.resizePhoto,userController.updateMe);
router.patch('/deleteMe',userController.deleteMe);


router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);



  router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


module.exports = router;
