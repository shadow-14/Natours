const { query } = require('express');
const factory = require('./handlerFactory.js')
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking =require('./../models/bookingModel.js')

exports.getCheckoutSession= catchAsync(async(req, res, next) =>{
    // get the currently booked tour
const tour = await Tour.findById(req.params.tourID)
    //create checkout session
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
     mode:'payment',
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,

    success_url: `${req.protocol}://${req.get('host')}/my-tour`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
     customer_email:req.user.email,
     client_reference_id:req.params.tourID,
     line_items: [{
        
        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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
const createBookingCheckout = async session=>{

    const tour = await Tour.findById(session.client_reference_id)
    if(!tour) return next(new AppError('No tour found',404));
    const price = (session.line_items[0].price_data.unit_amount)/100;
    if(price < 1) return next(new AppError('Price must be greater than 0',400));
    const user = (await User.findOne({
        email:session.customer_email
    })).id
    await Booking.create({tour,user,price})
}


// exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
//     const{tour,user,price}=req.query;
//     if(!tour && !user && !price) return next();
// await Booking.create({tour,user,price});

// res.redirect(req.originalUrl.split('?')[0]);

// });


exports.webhookCheckout = catchAsync(async(req,res,next)=>{

const signature = req.headers('stripe-signature');
let event;
try{
 event = stripe.webhooks.constructEvent(req.body,signature,process.env.STRIPE_WEBHOOK_SECRET);
}catch(err){
    return res.status(400).send(`Webhook Error: ${err.message}`);
}

if(event.type === 'checkout.session.completed'){
createBookingCheckout(event.data.object);
res.status(200).json({recieved:true});
}

});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getALL(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
