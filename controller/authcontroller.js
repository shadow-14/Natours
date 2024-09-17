const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const {promisify} = require('util');
const Email = require('./../utils/email');
const crypto = require('crypto');
const { Collection } = require('mongoose');
const { response } = require('express');

const signtoken = id =>{
  return  jwt.sign({id: id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})}
 

const createSendToken = (user,statusCode,res)=>{
  const token = signtoken(user._id);
const cookieOptions = {

  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure:false,
}

if(process.env.NODE_ENV=='production'){cookieOptions.secure = true;}
res.cookie('jwt',token,cookieOptions)
user.password = undefined;
  res.status(statusCode).json({
    status:'success',
    token:token,
    data: {
      user: user,
    },
  })
}



exports.signup = catchAsync(async (req, res, next) => {
  //1) check if user already exists.
  const user = await User.findOne({email: req.body.email});
  if(user){
    return next(new AppError('User already exists,Please log in !',400));
  }
const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url =`${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser,url).sendWelcome();
  createSendToken(newUser,201,res);
// const token = signtoken(newUser._id);
// res.status(201).json({
//  status: 'success',
//  data: {
//    user: newUser,
//    token: token,
//  },
//  });
  
});


exports.login =catchAsync(async(req,res,next)=>{
  const{email,password} = req.body;

  //1)check if the email and password exist.
  if(!email ||!password){
    return  next(new AppError('Please provide a valid email and password',400))}
  //2) check if the user exists and password is correct.
  const user = await User.findOne({email}).select('+password'); // to select unselected field +password field

  if(!user ||!(await user.correctPassword(password,user.password))) {
    return next(new AppError('Incorrect email or password',401));
  }

  createSendToken(user,200,res);
// const token = signtoken(user._id);
// res.status(200).json({
//   status:'success',
//   token: token,
// })
})


exports.logout = catchAsync(async (req,res,next)=>{
  res.cookie('jwt','loggedout',{expires: new Date(Date.now()),httpOnly:true});
  res.status(200).json({
    status:'success',
    data: null,
  })
})


exports.protect = catchAsync(async (req, res, next) => {
//1) get the token
let token;
if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
   token = req.headers.authorization.split(" ")[1];
}
else if(req.cookies.jwt){
   token = req.cookies.jwt;
}
// console.log(token);
if(!token){
  return next(new AppError('You are not logged in. Please log in to access this route',401));
}

//2)validate the token //Verification

const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

//3)check if the user exist
const currentUser= await User.findById(decoded.id);

if(!currentUser){
  return next(new AppError('User belonging to this token does no longer exist',401));
}
//4) if user change password after token was issue
if(currentUser.changePasswordAfter(decoded.iat)){
  return next(new AppError('User recently changed password. Please log in again',401));
}
// Grant access to protected route
req.user= currentUser;
res.locals.user= currentUser;
  next();
})  

//only for render pages.
exports.isLoggedIn = (async (req, res, next) => {
  //1) get the token
  try{
  let token;
  if(req.cookies.jwt){
     token = req.cookies.jwt;
  
  // console.log(token);

  
  //2)validate the token //Verification
  
  const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
  
  //3)check if the user exist
  const currentUser= await User.findById(decoded.id);
  
  if(!currentUser){
    return next();
  }
  //4) if user change password after token was issue
  if(currentUser.changePasswordAfter(decoded.iat)){
    return next();
  }
  // there is logged in user
  res.locals.user = currentUser;
    // next();
  }
  next();}
  catch(err){
    next();
  }
  })  

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permission to perform this action',403));
    }
    next();
  };
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
//1 get use based on posted email
  const user = await User.findOne({email:req.body.email});
  if(!user){
    return next(new AppError('No user found with this email',404));
  }

  //2) generate random token and set it to user.passwordResetToken and expireIn
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave:false}); // validator will be canceled usind validateBeforSAve
   //3)send it to user email address
  //  const message = `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\nPlease click on the following link to reset your password:\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;
   
   try{
     const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
// await sendEmail({
//   email:user.email,
// subject:'Password reset Token valid for 10 minutes',
// message
// })
await new Email(user,resetURL).SendPasswordReset();
res.status(200).json({
  status:'success',
  message:'Token sent to email'
})}
catch(error){
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save({validateBeforeSave:false});
  return next(new AppError('Email sending failed. Please try again later',500));
}
  })

exports.resetPassword = catchAsync(async (req, res, next) => {

//1) Get user based on the token


const hasedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex');

const user = await User.findOne({passwordResetToken:hasedtoken,passwordResetExpiresAt : {$gt:Date.now()}});
//2) if token is not excpiered and user is present
if(!user){
  return next(new AppError('Token is invalid or expired',400));
}

user.password = req.body.password
user.passwordConfirm= req.body.passwordConfirm
user.passwordResetExpiresAt = undefined
user.passwordResetToken=undefined
await user.save();
//3)update changed password property



//4) log the user in,send JWT web token
const token = signtoken(user._id);
res.status(200).json({
  status:'success',
  message:'Password reset successful',
  token:token
  
 
})


})

exports.updatePassword = catchAsync(async(req, res,next) => {
  // 1) User from the Collection
  const user= await User.findById(req.user.id).select('+password');

  // 2)password is correctPassword
    if(!(await user.correctPassword(req.body.currentpassword,user.password))) {
    return next(new AppError('Incorrect current password',401));
  }

  // 3) update the password
      user.password = req.body.password;
      user.passwordConfirm= req.body.passwordConfirm;
      await user.save();

  // 4) log the user in ,send JWT
  const token = signtoken(user._id);
  res.status(200).json({
    status:'success',
    message:'Password updated successfully',
    token:token
  })


})