const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User_Model = require("../Model/userModel");
const bcrypt = require("bcrypt");
const app = express();

dotenv.config();

app.use(cookieParser());

const Register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const userExist = await User_Model.find({ email });
    if (userExist.length > 0) {
      return res
        .status(409)
        .json({ message: "User Already Exist", error: "", data: "" });
    }

    if (password !== confirmPassword) {
      return res
        .status(401)
        .json({ message: "Passwords are not same", error: "", data: "" });
    }
    const capitalizeWords = (str) => {
      return str
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    };
    const user = new User_Model({
      name: capitalizeWords(name),
      email,
      password,
    });
    const savedUser = await user.save();

    const userWithPopulatedData = await User_Model.findById(savedUser._id);
    // .populate({
    //   path: "tasks",
    // })

    // const payload = { userId: savedUser._id.toString() };
    // const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    //   expiresIn: "8h",
    // });

    return res.status(200).json({
      message: "Registered Successfully",
      error: "",
      data: userWithPopulatedData,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error in registering user",
      error: error.message,
      data: "",
    });
  }
};
let usersCache = {};

const Login = async (req, res) => {
  usersCache={}
  try {
    const { email, password } = req.body;

    const userExist = await User_Model.findOne({ email });
    if (!userExist) {
      return res
        .status(404)
        .json({ message: "User Not Exist", error: "", data: "" });
    }

    const isMatch = await userExist.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid email or password", error: "", data: "" });
    }

    const payload = { userId: userExist._id.toString() };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "8h",
    });

    return res.status(200).json({
      message: "Successful Login",
      error: "",
      data: userExist,
      token: token,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
      error: error.message,
      data: "",
    });
  }
};


const searchUsers = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (Object.keys(usersCache).length === 0) {
      const users = await User_Model.find({});
      users.forEach((user) => {
        usersCache[user.email] = user;
      });
    }

    const results = Object.values(usersCache).filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUserDetail = async (req, res) => {
  try {
    const { name, email, oldPassword, newPassword, userId } = req.body;
    const updateFields = [name, email, oldPassword, newPassword].filter(
      Boolean
    );

    if (
      updateFields.length > 1 &&
      !(oldPassword && newPassword && updateFields.length === 2)
    ) {
      return res
        .status(400)
        .json({ message: "Only one field can be updated at a time" });
    }

    if (updateFields.length == 0) {
      return res.status(400).json({ message: "Please fill field to Update" });
    }

    const user = await User_Model.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      user.name = name;
      await user.save();
      res
        .status(200)
        .json({ message: "User details updated successfully", what: "name" });
    } else if (email) {
      user.email = email;
      await user.save();
      res
        .status(200)
        .json({ message: "User details updated successfully", what: "email" });
    } else if (oldPassword && newPassword) {
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password" });
      }
      user.password = newPassword;
      await user.save();
      res
        .status(200)
        .json({
          message: "User details updated successfully",
          what: "password",
        });
    } else {
      return res.status(400).json({ message: "Invalid Old or New Password" });
    }
  } catch (error) {
   
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { Register, Login, searchUsers, updateUserDetail };
