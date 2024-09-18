/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });


process.on('unhandledRejection',err =>{
  console.log(err);
  console.log('UNHANDLED REJECTED ,Shutting down server')
 process.exit(1)
  })
  
  process.on('uncaughtException',err =>{
    console.log(err);
    console.log('uncaughtException ,Shutting down server')
  process.exit(1)});
    


const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    //useCreateIndex: true,
    // useFindAndModify: false,
    autoIndex: true,
  })
  .then((con) => {
      // console.log(con.connections);
    console.log('db connected successfully 😎😎😎😎');
  });

    

const app = require('./app');

//console.log(process.env);
const port = process.env.PORT || 3000;

// console.log(app.get('env'));
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});


process.on("SIGTERM", () => {
  console.log("SIGTERM signal received.");
  server.close(() => {
    console.log("Server closed due to SIGTERM signal.");
    
  });
})
//test