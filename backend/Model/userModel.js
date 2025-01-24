const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User_Schema = new mongoose.Schema(
  {
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "task" }],
  },
  { timestamps: true }
);

User_Schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

User_Schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User_Model =  mongoose.model("user", User_Schema);

module.exports = User_Model;