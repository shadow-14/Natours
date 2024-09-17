//review ,rating ,created_at ,ref to tour

const mongoose = require('mongoose');
const validator = require('validator');
// const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review field is required'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating field is required'],
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true,'Review must belong to tour']
  },
user :{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true,'Review must belong to user']
  
},


},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

reviewSchema.index({tour:1,user:1}, {unique:true})

reviewSchema.statics.calcAverageRatings=async function(tourId){
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    { $group: { _id: '$tour', 
      nRating:{ $sum:1},avgRating: { $avg: '$rating' } } },
  ]);
  
  if (stats.length > 0) {
    let Tour = require('./tourModel'); // Import inside function to avoid circular dependency
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });}
  else{
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
  }


// Static methods


reviewSchema.pre(/^find/, function(next){
  // this.populate({
  //     path: 'tour',
  //     select: 'name'
  // }).populate({
  //     path: 'user',
  //     select: 'name photo'
  // })
  this.populate({
      path: 'user',
      select: 'name photo'
  })
  next();
})




// reviewSchema.post(/^findOneAnd/,async function(){

//     // Perform actions using the stored result
//   let x = await this.constructor.calcAverageRatings(this.tour);
  
//   })
reviewSchema.post(/^findOneAnd/, async function () {
 
  if (this.r) {s
    await this.r.constructor.calcAverageRatings(this.r.tour);
  }
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  
  this.r = await this.findOne().clone(); // Store the document before the update/delete
  next();
});



  reviewSchema.post('save', function(){

    this.constructor.calcAverageRatings(this.tour)
  
  })
  

  

const Review = mongoose.model('Review',reviewSchema);
module.exports = Review;




