const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');
const  userSchema = mongoose.Schema({
    name: {
        type: String,
         required: [true, 'User name is required'],
        minlength: 5,
        maxlength: 30
    },
    email: {
        type: String,
         required: [true, 'User email is required'],
        unique: true,
        lowercase:true,
        validate: [validator.isEmail, 'Please enter a valid email']
       
    },
    password: {
        type: String,
         required: [true, 'User password is required'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm password is required'],
        validate: {
            //This only work on save() and create()
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt: {type : Date},
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
    ,
    role: {
        type: String,
        enum: ["user", "admin","guide","lead-guide"],
        default: "user"
    },
    photo: {
        type: String,
        default:'default.jpg'

    },
   
})

userSchema.pre('save',async function(next){
    //only run this fuction if password is modified
if(!this.isModified('password'))return next();

//hash the password with string upto 12 value;
this.password = await bcrypt.hash(this.password,12);
this.passwordConfirm= undefined;
next();

})

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew)return next();
    this.passwordChangedAt = Date.now()-1000;
    next();
})

userSchema.pre(/^find/,function(next){
    //this point to cureent query
    this.find({ active: {$ne:false} });
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
    const changedTimestamp= parseInt(this.passwordChangedAt.getTime()/1000,10);
    // console.log(changedTimestamp,JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
    
    }
  return false;
};

userSchema.methods.createPasswordResetToken = function(){
const resetToken = crypto.randomBytes(32).toString('hex');
// console.log('Reset token usermodel: ' + resetToken );
this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
this.passwordResetExpiresAt=Date.now()+10*60*1000;
// console.log(this.passwordResetToken);
return resetToken;
}



const User = mongoose.model('User',userSchema);
module.exports =User;