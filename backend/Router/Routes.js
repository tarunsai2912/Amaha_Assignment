const express = require("express");
const router = express.Router();

const {
  Register,
  Login,
  searchUsers,
  updateUserDetail,
} = require("../Controller/Auth_controller");
const {
  createTask,
  fetchTasks,
  assignToMultipleUsers,
  editTask,
  updateCategory,
  AnalyticsController,
  updateBackgroundColor,
  checkAndUncheck,
  deleteTask,
} = require("../Controller/Task_controller");
const {
  generateSharableUrl,
  sharableTaskData,
} = require("../Controller/Task_Share");
const Auth = require("../Middlewares/Auth");

router.post("/auth/register", Register);
router.post("/auth/login", Login);
router.post("/auth/updateuserdetail", Auth, updateUserDetail);

router.get("/search", searchUsers);

router.post("/task/create", Auth, createTask);
router.post("/task/mutipleassign", assignToMultipleUsers);
router.get("/task/fetch", Auth, fetchTasks);
router.post("/task/update", Auth, editTask);
router.post("/task/update/category", Auth, updateCategory);
router.post("/task/analytics", Auth, AnalyticsController);
router.post("/task/update/backgroudcolor", updateBackgroundColor);
router.post("/task/update/checkanduncheck", Auth, checkAndUncheck);
router.post("/task/deletetask", Auth, deleteTask);

router.post("/share/generate", Auth, generateSharableUrl);
router.get("/share/getcard/:id", sharableTaskData);

module.exports = router;
