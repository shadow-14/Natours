/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');
const Review = require('./reviewModel');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength:40,
    minlength: 10,
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },slug : {type :String,},
  duration: {
    type: Number,
    required: [true, `The tour duration must be present`],
  },
  maxGroupSize: {
    type: Number,
    required: [true, `The tour max group size must be present`],
  },
  difficulty: {
    type: String,
    required: [true, 'The tour difficulty must be present'],
    enum: {
      values: ['easy','medium', 'difficult'],
      message: 'Difficulty is either: easy, medium or difficult',
    },
  },
  ratingsAverage: { type: Number, default: 4.5,min:1,max:5 ,set:val=>Math.round(val*10)/10},
  ratingsQuantity: { type: Number, default: 0 },
  price: {
    type: Number,
    required: [true, `The tour price must be present`],
  },
  priceDiscount: { type: Number ,
    //this Keyword only refer to current document on new document creation.
    validate: function(val){
     return val<this.price;
    }
    ,message: 'The tour price discount should less than price'
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'The tour summary must be present'],
  },
  description: { type: String, trim: true },
  imageCover: {
    type: String,
    required: [true, 'The tour image must be present'],
  },
  images: [String],
  createdAt: { type: Date, default: Date.now(), select: false },
  startDates: [Date],
  guides:[{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // required: [true, 'Tour must have at least one guide']
  }],
startLocation:{
  type:{
    type: String,
    default:'Point',
    enum:['Point']
  },
  coordinates: [Number],
  address: String,
  description: { type: String, trim: true },

},
locations:[{
       type:{
        type: String,
        default:'Point',
        enum:['Point']
       },
       coordinates: [Number],
       address: String,
       description: { type: String, trim: true },
        day :Number,
     }],
 

 secretTour:{
  type: Boolean,default: false,
 },



},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.virtual('durationWeeks').get(function(){return this.duration/7})

// tourSchema.index({ name: 1 });
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1 ,ratingsAverage:-1});
tourSchema.index({ slug:1});
tourSchema.index({startLocation:'2dsphere'})


//virtual populate
tourSchema.virtual('reviews',{
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
   justOne: false,
})
// This Document middleware only runs for .save() calls and .create() calls
tourSchema.pre('save',function(next){
this.slug = slugify(this.name,{lower :true});
next();
})


// embeeing type format for guides
// tourSchema.pre('save',async function(next){
//   const guidePromises = this.guides.map(async id=> await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// })

// tourSchema.post('save',function(doc,next){
//   console.log(doc);
//   next();
// })

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({path:'guides',select :'-__v -passwordChangedAt'});
  next();
})

// tourSchema.post(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   next();
// });



//Agrregatin Middleware

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   this.start = Date.now();
//   next();
// });


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
