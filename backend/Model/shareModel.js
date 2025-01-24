const mongoose = require("mongoose");

const Share_Schema = new mongoose.Schema(
  {

    urlId: { type: String, required: true },
    taskId:{type:mongoose.Schema.Types.ObjectId, ref:'task'},
    
  },
  { timestamps: true }
);

const Share_Model = new mongoose.model("share", Share_Schema);

module.exports = Share_Model;