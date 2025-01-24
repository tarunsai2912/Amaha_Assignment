const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Db = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database is Connected");
  } catch (error) {
    console.log("Error in Connecting Database");
  }
};

module.exports = Db;