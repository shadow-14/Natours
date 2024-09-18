const Tour =require('./../models/tourModel')
const catchasync = require('./../utils/catchAsync') 
const AppError = require('./../utils/appError')
const User =require('./../models/userModel')
const Booking = require('./../models/bookingModel')
const slugify = require('slugify');
exports.getOverview = catchasync(async(req,res,next)=>{

// get the tour data
const tours = await Tour.find();
// 2 build template

// 3 render the template



    res.status(200).render('overview',{
      title:'All Tours',
      tours
    })
  })

exports.getTour = catchasync(async(req,res,next)=>{
  const tour = await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    fields:'review rating user'
  })
  if(!tour ){
    return next(new AppError('No Tour found',404));
  }
    res.status(200).render('tour',{
      title:tour.name,
      tour
    })
  })

exports.base=  (req, res) => {
    res.status(200).render('base',{
      tour:'The forest hicker',
      user:'Jonas'
    });
  }

  exports.getLoginForm = (req, res) => {
  res.status(200).render('login',{
    title:'Log into your account',
  });
  }


  exports.getSignUp = (req, res) => {
  res.status(200).render('signup',{
    title:'Create an account',
  });
  }
  exports.getAccount = (req, res) => {
    res.status(200).render('account',{
      title:'Your Account',
      user:req.user
    });
  }

  exports.UpdateUserdata = catchasync(async(req, res) => {
 const updateduser = await User.findByIdandUpdate(req.user.id,{
  name:req.body.name,
  email:req.body.email
 },{
  new:true,
  runValidators:true
 });

res.status(200).render('account',{
  title:'Your Account',
  user:updateduser
 })

 })


 exports.getMyTours = catchasync(async(req, res,next) => {

  //1) find booking 
  const bookings = await Booking.find({user: req.user.id});

  //2) find tours with the returned IDS
const tourIDs= bookings.map(el=> el.tour)

const tours = await Tour.find({_id: {$in: tourIDs}});

res.status(200).render('overview',{
  title:'My Tours',
  tours
});

});


exports.alerts=(req,res,next)=>{
  const {alert}=req.query;
  if(alert ==='booking'){
    res.locals.alert="Your booking was successful! Please check your email for more information , if your booking doesn't show up here immediately,please come later";
  }
  next();
}