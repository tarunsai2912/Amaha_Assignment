import React, { useState } from "react";
import "./TaskCreate.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddTaskPNG from "../../Assets/add2.png";
import DeletePNG from "../../Assets/Delete.png";
import AssignTo from "../../Services/AssignTo";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Loader from "../Loader/Loader";
import Toast from "../../Services/Toast/Toast";
import { addItem } from "../../Store/Slices/TriggerringRendering";

export default function TaskCreate({
  close,
  data,
  onTaskCreated,
  toggleOptions,
}) {
  const assignList = useSelector((state) => state.AssignList).assignList;
  const [dueDate, setDueDate] = useState(data ? data.dueDate : null);
  const [items, setItems] = useState(data ? data.checklist : []);
  const [selectedPriority, setSelectedPriority] = useState(
    data ? data.selectedPriority : ""
  );
  const userData=JSON.parse(localStorage.getItem("userData"))
  const [title, setTitle] = useState(data ? data.title : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const dispatch=useDispatch()


  const isISOFormat = (date) =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(date);

  const validateForm = () => {
    if (!title.trim()) return "Task title is required.";
    if (!selectedPriority) return "Priority must be selected.";
    if (items.length == 0) {
      return "Checklist atleast have one item.";
    }
    if (!items.length || items.some((item) => !item.inputValue.trim())) {
      return "All checklist items must be filled.";
    }
    return "";
  };
  const token = localStorage.getItem("token");
  const handleCreateOrUpdate = async (isUpdate = false) => {
    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage);
      Toast(errorMessage, false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = isUpdate
        ? `${process.env.REACT_APP_BASE_URL_PORT}/api/task/update`
        : `${process.env.REACT_APP_BASE_URL_PORT}/api/task/create`;
      const payload = {
        taskId: isUpdate ? data._id : null,
        title,
        selectedPriority,
        assignTo: assignList,
        checklist: items,
        category: "Todo",
        dueDate: dueDate
          ? isISOFormat(dueDate)
            ? dueDate
            : dueDate.toISOString()
          : null,
        ownerId: JSON.parse(localStorage.getItem("userData"))._id,
      };
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onTaskCreated();
      close();
      setItems(items)

      dispatch(addItem())

      Toast(
        isUpdate ? "Task updated successfully!" : "Task created successfully!",
        true
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while saving the task. Please try again.";
      setError(errorMessage);
      Toast(errorMessage, false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () =>
    setItems([...items, { checkOrNot: false, inputValue: "" }]);
  const handleInputChange = (index, event) => {
    const newItems = [...items];
    newItems[index].inputValue = event.target.value;
    setItems(newItems);
  };

  const handleCheckboxChange = (index) => {
    const newItems = [...items];
    newItems[index].checkOrNot = !newItems[index].checkOrNot;
    setItems(newItems);
  };

  const deleteCheckListItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setItems(updatedItems);
  };

  const close2 = () => {
    close();
  };

  return (
    <>
      <div className="task_create_container">
        {loading && <Loader />}
        <div className="task_c_top_part">
          <div className="task_c_title">
            <label>Title</label>
            <input
              type="text"
              className="task_c_title_input"
              placeholder="Enter Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="task_c_priority">
            <div className="task_c_priority_left">Select Priority</div>
            <div className="task_c_priority_right">
              {["LOW PRIORITY", "MODERATE PRIORITY", "HIGH PRIORITY"].map(
                (priority) => (
                  <div
                    key={priority}
                    className={`task_c_priority_right_item${
                      priority === "LOW PRIORITY"
                        ? "1"
                        : priority === "MODERATE PRIORITY"
                        ? "2"
                        : "3"
                    }`}
                    style={{
                      backgroundColor:
                        selectedPriority === priority
                          ? "rgba(238, 236, 236, 1)"
                          : "",
                    }}
                    onClick={() => setSelectedPriority(priority)}
                  >
                    <span
                      style={{
                        backgroundColor:
                          priority === "LOW PRIORITY"
                            ? "rgba(99, 192, 91, 1)"
                            : priority === "MODERATE PRIORITY"
                            ? "rgba(24, 176, 255, 1)"
                            : "rgba(255, 36, 115, 1)",
                      }}
                    ></span>{" "}
                    {priority}
                  </div>
                )
              )}
            </div>
          </div>  
          {(!data || data.creator === userData._id) ? <AssignTo data={data ? data.assignTo : ""} /> : null}

         
          <div className="task_c_checklist">
            Checklist ({items.filter((item) => item.checkOrNot).length}/
            {items.length})
          </div>
          <div className="task_c_checklist_container">
            {items.map((item, index) => (
              <div key={index} className="task_c_checklist_item">
                <input
                  className="checklist_checkbox"
                  type="checkbox"
                  checked={item.checkOrNot}
                  onChange={() => handleCheckboxChange(index)}
                />
                <input
                  className="checklist_input"
                  type="text"
                  value={item.inputValue}
                  onChange={(event) => handleInputChange(index, event)}
                  placeholder="Type"
                />
                <img
                  alt={`delete ${index}`}
                  className="checklist_delete_img"
                  onClick={() => deleteCheckListItem(index)}
                  src={DeletePNG}
                />
              </div>
            ))}
          </div>
          <div onClick={handleAddItem} className="task_c_add_checklist">
            <img alt="addtask" src={AddTaskPNG} /> Add New
          </div>
        </div>
        <div className="task_c_footer_part">
          <div className="task_c_footer">
            <div className="task_c_footer_left">
              <button className="task_c_f_l_btn1">
                <DatePicker
                  selected={dueDate}
                  onChange={setDueDate}
                  placeholderText="Select Due Date"
                  dateFormat="MM/dd/yyyy"
                  className="date-input"
                />
              </button>
            </div>
            <div className="task_c_footer_right">
              <button className="task_c_f_r_btn1" onClick={close2}>
                Cancel
              </button>
              <button
                className="task_c_f_r_btn2"
                onClick={() => handleCreateOrUpdate(!!data)}
              >
                {data ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
