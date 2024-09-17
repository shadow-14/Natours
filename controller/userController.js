const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("./../utils/newFeatures");
const AppError = require("./../utils/appError");
const factory = require('./handlerFactory.js')
const multer = require('multer');
const sharp = require('sharp');
const filterObj=(obj,...allowedFields)=>{
  const newObj={};
  Object.keys(obj).forEach(el =>{
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  })
  return newObj;
}

// const multerStorage = multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users');
//   },
//   filename:(req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
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
})
exports.uploadPhoto= upload.single('photo');

exports.resizePhoto = catchAsync(async(req, res, next) => {
if(!req.file)return next();

req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
 await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`)

next();
})

exports.createUser = (req,res)=>{
  res.status(500).json({status: 'error',
    message: 'this route is not yet defined! Please used sign up instead'
  });
}
exports.getAllUsers = factory.getALL(User);
exports.getUser = factory.getOne(User);
// do not update password with UpdateUser method
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);



exports.updateMe= catchAsync(async(req, res,next) => {
  //1) create error when user post password data
if(req.body.password || req.body.passwordConfirm){
  return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
}
  //2) update user document
  // filter body,role,etc;
const filteredBody = filterObj(req.body,'name','email');
if(req.file)filteredBody.photo = req.file.filename;
const updateduser = await User.findByIdAndUpdate(req.user._id,filteredBody,{new:true,runValidators:true});

res.status(200).send({
  status:'success',
  message: 'Data updated successfully',
  data: {
    user: updateduser,
  },
})
})


exports.deleteMe = catchAsync(async(req, res,next) => {
await User.findByIdAndUpdate(req.user.id,{active:false})
res.status(204).json({
  status:'success',
  data: null
})
});

exports.getMe =(req, res, next)=>{
  req.params.id = req.user._id;
  next();
}