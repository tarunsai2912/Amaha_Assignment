const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Task_Model = require("../Model/taskModel");
const User_Model = require("../Model/userModel");
const app = express();
const mongoose = require("mongoose");

const createTask = async (req, res) => {
  try {
    const {
      title,
      selectedPriority,
      assignTo,
      checklist,
      category,
      dueDate,
      ownerId,
    } = req.body;
    if (!title || !selectedPriority || !checklist) {
      return res.status(400).json({
        message:
          "Required fields: title, selectedPriority, and checklist are missing",
      });
    }
    const owner = await User_Model.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }
    let assignee = null;
    if (assignTo && assignTo.length > 0) {
      assignee = await User_Model.findById(assignTo[0].assignee);
      if (!assignee) {
        return res.status(404).json({ message: "Assigned user not found" });
      }
    }

    const formattedDueDate = dueDate ? new Date(dueDate) : null;
    const newTask = new Task_Model({
      title,
      selectedPriority,
      checklist,
      category,
      // assignTo: assignee ? assignee._id : null,
      assignTo: assignTo,
      dueDate: formattedDueDate,
      creator: ownerId,
    });

    const taskCreated = await newTask.save();

    await User_Model.findByIdAndUpdate(
      ownerId,
      { $push: { tasks: taskCreated._id } },
      { new: true }
    );

    if (assignee) {
      await User_Model.findByIdAndUpdate(
        assignee._id,
        { $push: { tasks: taskCreated._id } },
        { new: true }
      );
    }

    return res.status(201).json({
      message: "Task created successfully",
      task: taskCreated,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const assignToMultipleUsers = async (req, res) => {
  try {
    const { assignFrom, assignTo } = req.body;

    if (
      !assignFrom ||
      !assignTo ||
      !Array.isArray(assignTo) ||
      assignTo.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input. 'assignFrom' and 'assignTo' fields are required, and 'assignTo' must be an array.",
      });
    }

    const userData = await User_Model.findById(assignFrom).populate("tasks");
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: `User with id '${assignFrom}' not found.`,
      });
    }

    const userTasks = userData.tasks;
    if (userTasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No tasks found in dashboard for user '${assignFrom}'!`,
      });
    }

    const assignToIds = assignTo.map(({ assignee }) => assignee);
    const usersToAssign = await User_Model.find({ _id: { $in: assignToIds } });

    if (usersToAssign.length !== assignTo.length) {
      return res.status(404).json({
        success: false,
        message: `Some users in 'assignTo' were not found. Please check the provided IDs.`,
      });
    }

    const userUpdatePromises = assignTo.map(async (user) => {
      const existingUser = await User_Model.findById(user.assignee);
      const tasksToAdd = userTasks
        .map((task) => task._id)
        .filter((taskId) => !existingUser.tasks.includes(taskId));

      return User_Model.findByIdAndUpdate(
        user.assignee,
        { $addToSet: { tasks: { $each: tasksToAdd } } },
        { new: true }
      );
    });

    await Promise.all(userUpdatePromises);

    const taskUpdatePromises = userTasks.map(async (task) => {
      const currentAssignTo = task.assignTo || [];

      const uniqueAssignTo = assignTo.reduce((acc, user) => {
        const isAlreadyAssigned = currentAssignTo.some(
          ({ assignee }) => assignee.toString() === user.assignee
        );

        if (!isAlreadyAssigned && task.creator.toString() !== user.assignee) {
          acc.push({
            assignee: user.assignee,
            name: user.name,
            when: user.when || "whilecreating",
          });
        }
        return acc;
      }, []);

      if (uniqueAssignTo.length > 0) {
        await Task_Model.findByIdAndUpdate(
          task._id,
          { $addToSet: { assignTo: { $each: uniqueAssignTo } } },
          { new: true }
        );
      }
    });

    await Promise.all(taskUpdatePromises);

    return res.status(200).json({
      success: true,
      message: `Tasks successfully assigned from user '${assignFrom}' to ${assignTo.length} users.`,
    });
  } catch (error) {
    console.error("Error in assignToMultipleUsers:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while assigning tasks.",
      error: error.message,
    });
  }
};

const fetchTasks = async (req, res) => {
  try {
    const { userId } = req.query;
    const userWithTasks = await User_Model.findById(userId, { password: 0 })
      .populate("tasks")
      .exec();

    if (!userWithTasks) {
      return res.status(404).json({ message: "User not found" });
    }
    const categorizedTasks = userWithTasks.tasks.reduce(
      (acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = [];
        }

        const taskExists = acc[task.category].some((t) =>
          t._id.equals(task._id)
        );
        if (!taskExists) {
          acc[task.category].push(task);
        }

        return acc;
      },
      { Backlog: [], Todo: [], Progress: [], Done: [] }
    );

    return res.status(200).json({
      message: "Tasks fetched successfully",
      tasks: categorizedTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const editTask = async (req, res) => {
  const {
    taskId,
    title,
    selectedPriority,
    assignTo,
    checklist,
    category,
    dueDate,
    ownerId,
  } = req.body;

  if (
    !taskId ||
    !title ||
    !selectedPriority ||
    !checklist ||
    checklist.length === 0
  ) {
    return res.status(400).json({
      error:
        "Title, selected priority, and at least one checklist item are required.",
    });
  }

  try {
    const formattedDueDate = dueDate ? new Date(dueDate) : null;
    const existingTask = await Task_Model.findById(taskId).populate(
      "assignTo.assignee"
    );

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    if (existingTask.creator.toString() === ownerId) {
      const existingAssignToIds = existingTask.assignTo.map((assigneeObj) =>
        assigneeObj.assignee._id.toString()
      );

      const newAssignToIds = assignTo
        .map((assigneeObj) => assigneeObj.assignee.toString())
        .filter((id) => id !== existingTask.creator.toString());

      const usersToRemove = existingAssignToIds.filter(
        (id) => !newAssignToIds.includes(id)
      );
      const usersToAdd = newAssignToIds.filter(
        (id) => !existingAssignToIds.includes(id)
      );

      if (usersToRemove.length > 0) {
        await User_Model.updateMany(
          { _id: { $in: usersToRemove } },
          { $pull: { tasks: taskId } }
        );
      }

      if (usersToAdd.length > 0) {
        await User_Model.updateMany(
          { _id: { $in: usersToAdd } },
          { $addToSet: { tasks: taskId } }
        );
      }

      const assignTo2 = assignTo.filter(
        (item, index, self) =>
          item.assignee.toString() !== existingTask.creator.toString() &&
          index ===
            self.findIndex(
              (i) => i.assignee.toString() === item.assignee.toString()
            )
      );

      const updatedTask = await Task_Model.findByIdAndUpdate(
        taskId,
        {
          title,
          selectedPriority,
          assignTo: assignTo2,
          checklist,
          dueDate: formattedDueDate,
        },
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return res.status(404).json({ error: "Task update failed." });
      }

      await User_Model.findByIdAndUpdate(existingTask.creator, {
        $addToSet: { tasks: taskId },
      });

      res
        .status(200)
        .json({ message: "Task updated successfully", updatedTask });
    } else {
      const updatedTask = await Task_Model.findByIdAndUpdate(
        taskId,
        {
          title,
          selectedPriority,
          checklist,
          dueDate: formattedDueDate,
        },
        { new: true, runValidators: true }
      );

      if (!updatedTask) {
        return res.status(404).json({ error: "Task update failed." });
      }

      await User_Model.findByIdAndUpdate(existingTask.creator, {
        $addToSet: { tasks: taskId },
      });

      res
        .status(200)
        .json({ message: "Task updated successfully", updatedTask });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the task." });
  }
};

const updateCategory = async (req, res) => {
  const { taskId, category } = req.body;

  if (!taskId || !category) {
    return res
      .status(400)
      .json({ message: "Task ID and category are required" });
  }

  try {
    const updatedTask = await Task_Model.findByIdAndUpdate(
      { _id: taskId },
      { category },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res
      .status(200)
      .json({ message: "Category updated successfully", task: updatedTask });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const AnalyticsController = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User_Model.findById(userId).select("tasks");
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const taskIds = user.tasks;
    const tasks = await Task_Model.aggregate([
      {
        $match: {
          _id: { $in: taskIds },
        },
      },
      {
        $group: {
          _id: null,
          backlogCount: {
            $sum: { $cond: [{ $eq: ["$category", "Backlog"] }, 1, 0] },
          },
          todoCount: {
            $sum: { $cond: [{ $eq: ["$category", "Todo"] }, 1, 0] },
          },
          progressCount: {
            $sum: { $cond: [{ $eq: ["$category", "Progress"] }, 1, 0] },
          },
          doneCount: {
            $sum: { $cond: [{ $eq: ["$category", "Done"] }, 1, 0] },
          },
          highPriorityCount: {
            $sum: {
              $cond: [{ $eq: ["$selectedPriority", "HIGH PRIORITY"] }, 1, 0],
            },
          },
          mediumPriorityCount: {
            $sum: {
              $cond: [
                { $eq: ["$selectedPriority", "MODERATE PRIORITY"] },
                1,
                0,
              ],
            },
          },
          lowPriorityCount: {
            $sum: {
              $cond: [{ $eq: ["$selectedPriority", "LOW PRIORITY"] }, 1, 0],
            },
          },
          dueDates: { $sum: { $cond: [{ $eq: ["$dueDate", null] }, 0, 1] } },
          // dueDates: { $push: "$dueDate" }
        },
      },
    ]);

    const analytics = tasks[0] || {
      backlogCount: 0,
      todoCount: 0,
      progressCount: 0,
      doneCount: 0,
      highPriorityCount: 0,
      mediumPriorityCount: 0,
      lowPriorityCount: 0,
      dueDates: 0,
    };

    return res.json({
      status: "success",
      data: analytics,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

const updateBackgroundColor = async (req, res) => {
  try {
    const { taskID, colorCode } = req.body;

    if (!taskID || !colorCode) {
      return res
        .status(400)
        .json({ message: "Task ID and color code are required." });
    }

    const updatedTask = await Task_Model.findByIdAndUpdate(
      taskID,
      { backgroundColor: colorCode },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(200).json({
      message: "Background color updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the background color.",
      error: error.message,
    });
  }
};

const checkAndUncheck = async (req, res) => {
  const { taskId, objID, checkOrNot } = req.body;

  try {
    const updatedTask = await Task_Model.findOneAndUpdate(
      { _id: taskId, "checklist._id": objID },
      { $set: { "checklist.$.checkOrNot": checkOrNot } },
      { new: true }
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ message: "Task or checklist item not found" });
    }

    return res.status(200).json({
      message: "Checklist item updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the checklist item",
      error,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    const taskDetail = await Task_Model.findById(taskId);
    if (!taskDetail) {
      return res.status(404).json({ message: "Task not found" });
    }

    const usersToRemove = taskDetail.assignTo.map((item) => item.assignee);

    await User_Model.findOneAndUpdate(
      { _id: taskDetail.creator },
      { $pull: { tasks: taskId } }
    );

    await User_Model.updateMany(
      { _id: { $in: usersToRemove } },
      { $pull: { tasks: taskId } }
    );
    await Task_Model.findByIdAndDelete(taskId);

    res.status(200).json({
      message: "Task and associated user references deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while deleting the task", error });
  }
};

module.exports = {
  createTask,
  fetchTasks,
  assignToMultipleUsers,
  editTask,
  updateCategory,
  AnalyticsController,
  updateBackgroundColor,
  checkAndUncheck,
  deleteTask,
};
