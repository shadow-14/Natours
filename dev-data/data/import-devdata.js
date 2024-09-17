/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.dev' });
const DB = 'mongodb+srv://Sarthakgoyal:Sarthak@cluster0.dhq2nsc.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0';
mongoose
  .connect(DB, {
    //useNewUrlParser: true,
   // useUnifiedTopology: true,
    //useCreateIndex: true,
    // useFindAndModify: false,
    autoIndex: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('db connected successfully 😎😎😎😎');
  });
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const importData = async () => {
  try {
    await Tour.create((tours));
    // await User.create(users);
    // await Review.create((reviews));
    console.log('data imported successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//Delete all data from Collection

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log('data deleted successfully');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
