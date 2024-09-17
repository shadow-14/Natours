
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require( '../utils/newFeatures.js');


exports.deleteOne = Model =>catchAsync(async (req, res,next) => {
    // try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if(!doc ){
        return next(new AppError('No doc found',404));
      }
      //tour.findOneAndDelete({_id:req.params.id})
      res.status(204).json({
        status: 'success',
        data: 'successfully deleted',
      });
    // } catch (e) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: err.message,
    //   });
    // }
  });


// exports.createOne = Model => catchAsync(async(req,res,next)=>{
//   const doc = new Model(req.body);
//   await doc.save();
//   res.status(201).json({
//     status:'success',
//     data:doc
//   })
// })

exports.updateOne = Model => catchAsync(async(req,res,next)=>{
  const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
  if(!doc){
    return next(new AppError('No doc found',404))
  }
  res.json({
    status:'success',
    data:doc
  })
})


 exports.createOne = Model =>catchAsync(async (req, res,next) => {
  
  const doc = await Model.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
     data:doc
    },
  });

});

exports.getOne =(Model,popOptions) =>catchAsync(async (req, res, next) => {
  let query = await Model.findById(req.params.id);
  if(popOptions ){
    query = query.populate(popOptions);
  }
  const doc = await query;
 
  if(!doc ){
    return next(new AppError('No doc found',404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data:doc
    },
  });
})


exports.getALL =(Model) =>catchAsync(async (req, res,next) => {
  // // console.log(req.requestTime);
  // try {
  // to allow nested get review on tour (hack)
    let filter ={};
if(req.params.tourid) filter = {tour:req.params.tourid};

// Execute query
const features = new APIFeatures(Model.find(filter),req.query).filter().sort().limitField().pagination();
    // const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      // requestTime: req.requestTime,
      results: doc.length,
      data: {
        data:doc
      },
    });
 });
