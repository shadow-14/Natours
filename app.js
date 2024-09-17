const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const multer = require('multer');
const AppError = require('./utils/appError');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalerrorHandler = require('./controller/errorController');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean');
const helmet = require('helmet');
const compression = require('compression');
app.use(helmet()); // SET SECURITY HTTP
// ----------------------------------------------------------------middleware middleware----------------------------------------------------------------
// app.use((req, res, next) => {
//   res.setHeader("Content-Security-Policy", "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://cdn.jsdelivr.net https://127.0.0.1:3000 ws://127.0.0.1:* wss://natours-7fg5.onrender.com:50394 https://js.stripe.com/v3;");
//   next();
// });

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// app.use(
//   helmet({
//       contentSecurityPolicy: false,
//       crossOriginEmbedderPolicy: false,
//     })
//   );
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));//serve static file

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 60* 60 * 1000, // 60 minutes
  limit: 100,
   // limit each IP to 100 requests per windowMs
  //  standardHeaders: 'draft-7',
  message: 'Too many requests from this IP, please try again in an hour.'
});

app.use(express.json({limit : '10kb'})); //middleware for express

app.use(cookieParser()); 
//data santization against noSql query injection and XSS protection
app.use(express.urlencoded({
  extended: true,
  limit: '10kb', // limit the size of the request body to 10kb
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
  whitelist: ['duration','ratingQuantity','ratingAverage','maxGroupSize','difficulty','price']
})); //params population

app.use(compression());
app.use((req, res, next) => {
 // console.log('Hello from middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});



// our middleware function
app.use('/api',limiter);//LIMIT REQUEST FROM SAME API MULTILE TIME

// ----------------------------------------------------------------routes----------------------------------------------------------------
app.use('/',viewRouter);
app.use('/api/v1/tours', tourRouter);
//---------------------------------------------------------------- users routes ----------------------------------------------------------------
app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
//---------------------------------------------------------------- error routes ----------------------------------------------------------------
app.all('*', (req, res, next) => {
  
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statuscode = 404;
  // err.message = `Can't find ${req.originalUrl} on this server` 
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
})

app.use(globalerrorHandler); // must be the last middleware in the array


//---------------------------------------------------------------- exports app ----------------------------------------------------------------
module.exports = app;
