const Share_Url_Model = require("../Model/shareModel");

const { v4: uuidv4 } = require("uuid");

const generateSharableUrl = async (req, res) => {
    try {
      const uniqueId = uuidv4();
      const { taskId } = req.body;
  
      if (!taskId) {
        return res
          .status(404)
          .json({ message: "Error in accessing Task", error: "", data: "" });
      }
      const existingUrl = await Share_Url_Model.findOne({ taskId });
      if (existingUrl) {
        const url = `https://taskmanager-topaz.vercel.app/api/task/share/${existingUrl.urlId}`;
        return res
          .status(200)
          .json({
            message: "URL already exists for this Task",
            error: "",
            data: url,
          });
      }
      const newUrl = new Share_Url_Model({
        urlId: uniqueId,
        taskId: taskId,
      });
      const response = await newUrl.save();
      if (!response) {
        return res
          .status(500)
          .json({ message: "Error in Generating URL", error: "", data: "" });
      }
  
      const url = `https://taskmanager-topaz.vercel.app/api/task/share/${uniqueId}`;
      return res
        .status(200)
        .json({
          message: "Successfully Generated Task URL",
          error: "",
          data: url,
        });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error in Generating URL", error: error, data: "" });
    }
  };
  

const sharableTaskData = async (req, res) => {
  try {

    const urlId = req.params.id;
    const taskExist = await Share_Url_Model.findOne({ urlId: urlId }).populate("taskId");

    if (!taskExist) {
      return res
        .status(404)
        .json({ message: "Not Exist", error: "", data: "" });
    }
   

    return res
      .status(200)
      .json({ message: "Successfully", error: "", data: taskExist });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server eroor", error: error.message, data: "" });
  }
};

module.exports = { generateSharableUrl, sharableTaskData };