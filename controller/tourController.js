
const { query } = require('express');
const factory = require('./handlerFactory.js')
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const Tour = require('./../models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
const { captureRejections } = require('nodemailer/lib/xoauth2/index.js');
exports.aliasTopTours=(req,res,next)=>{
req.query.limit = '5';
req.query.sort = '-ratingAverage,price';
req.query.fields='name,price,ratingAverage,summary,difficulty';
next();
};


const multerStorage = multer.memoryStorage();


const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true);
  } else {
    cb(new AppError('Please upload an image file', 400), false);
  }
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {fileSize: 1000000}, //1mb
 // fieldname: 'photo'  // if you want to change the field name in form data
});

exports.uploadTourImages = upload.fields([{name:'imageCover',maxCount:1},{name:'images',maxCount:3}
])

exports.resizeTourImages = catchAsync(async (req,res,next)=>{
  if(!req.files.imageCover || !req.files.images){
    return next();
  }
  const imageCoverfilename =  `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // 1) Cover images
  await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${imageCoverfilename}`)
req.body.imageCover = imageCoverfilename;
  // 2)Images

  req.body.images =[]
await Promise.all(req.files.images.map(async (file,i)=> {
  const filename =  `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
  await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${filename}`);
req.body.images.push(filename)
}));

next();
});


exports.getAllTours = factory.getALL(Tour);

exports.getTour = factory.getOne(Tour,{path:'reviews'});

exports.createTour = factory.createOne(Tour);

exports.updatedTour = factory.updateOne(Tour);

exports.deleteTour=factory.deleteOne(Tour);

exports.getTourStats=catchAsync(async (req,res,next)=>{
  // try {
    const stats=await Tour.aggregate([
      {
        $match:{ratingsAverage:{$gte:4.5}}
      },
      {
        $group:{
          _id:{ $toUpper: '$difficulty'},
          numTours:{$sum:1},
          numRatings:{$sum:'$ratingsQuantity'},
          avgRating:{$avg:'$ratingsAverage'},
          avgPrice:{$avg:'$price'},
          minPrice:{$min:'$price'},
          maxPrice:{$max:'$price'}
        }
      },
      {
        $sort:{avgPrice:1}
      }
      // ,{
      //   $match :{_id:{ $ne : 'EASY'}}
      // }
    ])
    res.status(200).json({
      status:'success',
      data:stats
    })
  // } catch (err) {
  //   res.status(400).json({
  //     status:'fail',
  //     message:err.message
  //   })
  // }
})

exports.getMonthlyPlan = catchAsync(async (req, res,next) => {
  // try {
    const year = req.params.year*1 ;
    const plans=await Tour.aggregate([
       {
         $unwind:
          '$startDates'
     

      }
      ,{
        $match:{
          startDates:{$gte:new Date(`${year}-01-01`),
         $lte:new Date(`${year}-12-31`)}
        }

      },{
        $group:{
          _id:{$month:'$startDates'},
          numTourStarts:{$sum:1},
          tours:{$push:'$name'}
        }
      },{
        $addFields:{month:'$_id'}
      },{
        $project:{
          _id:0
        }
      },{
        $sort : {numTourStarts: -1}
      }
    ])
    res.status(200).json({
      status:'success',
      data:plans
    })
  // } catch (err) {
  //   res.status(400).json({
  //     status:'fail',
  //     message:err.message
  //   })
  // }
})

exports.getTourWithin =catchAsync( async(req, res,next) => {
  const { distance, latlng , unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'km'? distance / 6378.1 : distance / 3963.2;
  if(!lng || !lat){
    next(new AppError('Please provide lattitude and longitude int the formatt lag,lng',400));
  }

const tours = await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}});


  
res.status(200).json({
  status:'success',
  results: tours.length,
  data:{
data: tours
  }
})})

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Validate latitude and longitude
  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));
  }

  // Convert unit to distance multiplier
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // Default to km

  const distances = await Tour.aggregate([
   {
    $geoNear:{
      near:{
        type:'Point',
        coordinates:[lng*1,lat*1]
      
      },
      distanceField:'distance',
      distanceMultiplier:multiplier
    }
   },{
    $project:{
      distance:1,
      name:1
    }
   }
  ]);
res.status(200).json({
  status:'success',
  data:{
    distances,
  }
})
 
});
