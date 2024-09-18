const { query } = require('express');
const factory = require('./handlerFactory.js')
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const Tour = require('./../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking =require('./../models/bookingModel.js')

exports.getCheckoutSession= catchAsync(async(req, res, next) =>{
    // get the currently booked tour
const tour = await Tour.findById(req.params.tourID)
    //create checkout session
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
     mode:'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
     customer_email:req.user.email,
     client_reference_id:req.params.tourID,
     line_items: [{
        
        // Uncomment and ensure the URL is correct if you decide to include an image
        //  images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        price_data:{unit_amount: tour.price * 100, // amount in cents
        currency: 'usd',
    product_data:{name: `${tour.name} Tour`,
    description: tour.summary,}
    
    },
        quantity: 1,
        
    }],
   
});
 

    // send session to client

res.status(200).json({
    status:'success',
    session
});

})



exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
    const{tour,user,price}=req.query;
    if(!tour && !user && !price) return next();
await Booking.create({tour,user,price});

res.redirect(req.originalUrl.split('?')[0]);

});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getALL(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
