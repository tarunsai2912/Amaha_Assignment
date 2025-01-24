import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import "./Card.css";
import ThreeDotsPNG from "../../Assets/3dot.png";
import ArrowPNG from "../../Assets/Arrow - Down 2.png";
import TaskCreate from "../Task_Create/TaskCreate";
import Portal from "../../Services/Portal";
import axios from "axios";
import DeleteComponent from "../Delete/Delete";
import CopiedEffect from "../../Services/Copy";
import Tooltips from "../../Services/ToolTips/Tooltips";
import Toast from "../../Services/Toast/Toast";
const Card = forwardRef(
  ({ data, moveCardOnBoard, onTaskCreated, trigerRender }, ref) => {
    const [category, setCategory] = useState([
      "Backlog",
      "Todo",
      "Progress",
      "Done",
    ]);
    const [checklist, setChecklist] = useState(data.checklist);
    const [dispalyChecklist, setDispalyChecklist] = useState(false);
    const [enableOptions, setEnableOptions] = useState(false);
    const [toggleStateForTaskEdit, setToggleStateForTaskEdit] = useState(false);
    const [indexOfColor, setIndexOfColor] = useState(4);
    const [openDeletePortal, setOpenDeletePortal] = useState(false);


    useEffect(() => {
      setChecklist(data.checklist);
    }, [data]);
    const backgroundColors = [
      "#d0bbf8",
      "#bbd0f8",
      "#f0d0bb",
      "#f8bbd0",
      "white",
    ];
    const priorityColors = {
      "MODERATE PRIORITY": "rgba(24, 176, 255, 1)",
      "HIGH PRIORITY": "rgba(255, 36, 115, 1)",
      "LOW PRIORITY": "rgba(99, 192, 91, 1)",
    };
   
    const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(
      data.backgroundColor ||
      localStorage.getItem(`cardColor_${data._id}`) ||
      backgroundColors[indexOfColor]
    );
    
    useEffect(() => {
      if (data.backgroundColor) {
        setSelectedBackgroundColor(data.backgroundColor);
      }
    }, [data.backgroundColor, selectedBackgroundColor]);
    

    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("userData"))._id;
    const dotColor = priorityColors[data.selectedPriority];

    useImperativeHandle(ref, () => ({
      callChildFunction() {
        setDispalyChecklist(false);
      },
    }));

    const copyToClipboard = (text) => {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => console.log("Text copied to clipboard successfully!"))
          .catch((err) => console.error("Failed to copy text: ", err));
      } else {
        Toast("Error in copying link", false);
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const month = date.toLocaleString("default", { month: "short" });
      const day = date.getDate();
      const ordinalSuffix = (day) =>
        ["th", "st", "nd", "rd"][
          day % 10 > 3 || [11, 12, 13].includes(day % 100) ? 0 : day % 10
        ];
      return `${month} ${day}${ordinalSuffix(day)}`;
    };

    const generateUrlAPI = async () => {
      try {
        const response = await axios.post(
           `${process.env.REACT_APP_BASE_URL_PORT}/api/share/generate`,
          { taskId: data._id },

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        copyToClipboard(response.data.data);
        CopiedEffect();
        toggleOptions();
      } catch (error) {
        Toast(error.response.data.message, false);
      } finally {
        trigerRender();
      }
    };

    const updateBackgroundColorAPI = async (newColor) => {
      try {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL_PORT}/api/task/update/backgroudcolor`,
          { taskID: data._id, colorCode: newColor }
        );
      } catch (error) {
        Toast(error.response.data.message, false);
      } finally {
        trigerRender();
      }
    };

    const updateCheckAndUnCheck = async (data2, check) => {
      try {
        await axios.post(
          `${process.env.REACT_APP_BASE_URL_PORT}/api/task/update/checkanduncheck`,
          { taskId: data._id, objID: data2._id, checkOrNot: !check },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setChecklist((prev) =>
          prev.map((item) =>
            item._id === data2._id ? { ...item, checkOrNot: !check } : item
          )
        );
      } catch (error) {
        Toast(error.response.data.message, false);
      } finally {
        trigerRender();
      }
    };

    const deleteTaskAPI = async () => {
      try {
        console.log(checklist)
        await axios.post(
          `${process.env.REACT_APP_BASE_URL_PORT}/api/task/deletetask`,
          { taskId: data._id, userId: userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Toast("Task deleted Successfully", true)
        setChecklist((prevChecklist) => prevChecklist.filter(task => task._id !== data._id));
        console.log(checklist)
      } catch (error) {
        Toast(error.response.data.message, false);
      } finally {
        trigerRender();
        toggleOptions();
      }
    };

    const handleCheckboxChange = (index) => {
      const updatedChecklist = checklist.map((item, i) =>
        i === index ? { ...item, checkOrNot: !item.checkOrNot } : item
      );
      setChecklist(updatedChecklist);
    };

    const toggleDisplayChecklist = () => {
      setDispalyChecklist(!dispalyChecklist);
    };

    const toggleOptions = () => {
      setEnableOptions(!enableOptions);
    };

    const toggleHandleTaskEdit = () => {
      setToggleStateForTaskEdit(!toggleStateForTaskEdit);
      trigerRender();
      if (toggleStateForTaskEdit) {
        toggleOptions();
      }
    };

    const getInitials = (input) => {
      const words = input.trim().split(" ");
      return words.length > 1
        ? words[0][0] + words[1][0]
        : words[0].slice(0, 2);
    };
   

    const updateBGColor = (colorIndex) => {
      const newColor = backgroundColors[colorIndex];
      setSelectedBackgroundColor(newColor);
      setIndexOfColor(colorIndex);
      localStorage.setItem(`cardColor_${data._id}`, newColor);
      updateBackgroundColorAPI(newColor);
      trigerRender()
      toggleOptions();

    };

    useEffect(() => {
      if (!localStorage.getItem(`cardColor_${data._id}`)) {
        setSelectedBackgroundColor(backgroundColors[indexOfColor]);
      }
    }, [indexOfColor, data._id]);

    const toggleDeletePortal = () => {
      setOpenDeletePortal(!openDeletePortal);
    };

    return (
      <>
        {toggleStateForTaskEdit ? (
          <Portal
            component={
              <TaskCreate
                close={toggleHandleTaskEdit}
                data={data}
                onTaskCreated={onTaskCreated}
                toggleOptions={toggleOptions}
              />
            }
          />
        ) : null}

        {openDeletePortal ? (
          <Portal
            component={
              <DeleteComponent
                close={toggleDeletePortal}
                data={data}
                confirmDelete={deleteTaskAPI}
                trigerRender={trigerRender}
              />
            }
          />
        ) : null}
        <div
          className="card_container"
          style={{
            backgroundColor: selectedBackgroundColor,
            border:
              userId != data.creator ? "0.1vh solid rgb(152 141 255)" : "",
          }}
        >
          <div className="card_heading">
            <div className="card_heading_left">
              {dotColor && (
                <span
                  className="card_heading_dot"
                  style={{ backgroundColor: dotColor }}
                ></span>
              )}
              {data.selectedPriority}
              <div className="assignees_display_on_card">
                {data.assignTo.map((item, index) => (
                  <span
                  key={index}
                    style={{
                      backgroundColor: "rgba(255, 235, 235, 1)",
                      color: "black",
                      fontSize: "1.2vh",
                      width: "2.5vh",
                      height: "2.5vh",
                      minHeight: "2.5vh",
                      minWidth: "2.5vh",
                      fontWeight: "400",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getInitials(item.name)}
                  </span>
                ))}
              </div>

            </div>
            <div
              className="card_heading_right"
              onClick={toggleOptions}
              style={{
                display: "flex",
                padding: "0.5vh",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <img alt="dots" src={ThreeDotsPNG} />
            </div>
          </div>

          {enableOptions ? (
            <div className="options_container">
              <div
                className="options_container_items"
                onClick={toggleHandleTaskEdit}
              >
                Edit
              </div>
              <div className="options_container_items" onClick={generateUrlAPI}>
                Share
              </div>
              <div
                className="options_container_items"
                style={{ color: "rgb(207, 54, 54)" }}
                onClick={toggleDeletePortal}
              >
                Delete
              </div>

              <div
                className="color_options"
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  cursor: "default",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#d0bbf8",
                    borderRadius: "50%",
                    height: "1.5vh",
                    width: "1.5vh",
                    border: "0.1vh solid black",
                  }}
                  onClick={() => updateBGColor(0)}
                ></span>
                <span
                  style={{
                    backgroundColor: "#bbd0f8",
                    borderRadius: "50%",
                    height: "1.5vh",
                    width: "1.5vh",
                    border: "0.1vh solid black",
                  }}
                  onClick={() => updateBGColor(1)}
                ></span>
                <span
                  style={{
                    backgroundColor: "#f0d0bb",
                    borderRadius: "50%",
                    height: "1.5vh",
                    width: "1.5vh",
                    border: "0.1vh solid black",
                  }}
                  onClick={() => updateBGColor(2)}
                ></span>
                <span
                  style={{
                    backgroundColor: "#f8bbd0",
                    borderRadius: "50%",
                    height: "1.5vh",
                    width: "1.5vh",
                    border: "0.1vh solid black",
                  }}
                  onClick={() => updateBGColor(3)}
                ></span>
                <span
                  style={{
                    backgroundColor: "white",
                    borderRadius: "50%",
                    height: "1.5vh",
                    width: "1.5vh",
                    border: "0.1vh solid black",
                  }}
                  onClick={() => updateBGColor(4)}
                ></span>
              </div>
            </div>
          ) : (
            ""
          )}

          <div>
            <Tooltips text={data.title}>
              <div className="card_title">{data.title}</div>
            </Tooltips>
          </div>

          <div className="card_checklist">
            <div className="card_checklist_left">
              Checklist ({checklist.filter((item) => item.checkOrNot).length}/
              {checklist.length})
            </div>
            <div className="card_checklist_right">
              <img
                alt="arrow"
                style={{
                  cursor: "pointer",
                  transform: dispalyChecklist
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
                src={ArrowPNG}
                onClick={toggleDisplayChecklist}
              />
            </div>
          </div>

          {dispalyChecklist ? (
            <div
              className="task_c_checklist_container"
              style={{
                width: "100%",
                maxHeight: "none",
                gap: "1vh",
                paddingTop: "1vh",
                paddingBottom: "1vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selectedBackgroundColor,
              }}
            >
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className="task_c_checklist_item"
                  style={{ width: "90%", minHeight: "4.4vh" }}
                >
                  <input
                    className="checklist_checkbox"
                    type="checkbox"
                    checked={item.checkOrNot}
                    style={{ marginLeft: "1.2vh" }}
                    onChange={() => handleCheckboxChange(index)}
                    onClick={() => updateCheckAndUnCheck(item, item.checkOrNot)}
                  />
                  <div className="checklist_input_textarea">
                    {item.inputValue}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}

          <div className="card_footer">
            {data.dueDate ? (
              <div
                className="card_footer_left"
                style={{
                  backgroundColor:
                  data.category==="Done"?" rgba(99, 192, 91, 1)":

                    new Date(data?.dueDate) < new Date()
                      ? "rgba(207, 54, 54, 1)"
                      : data.selectedPriority === "HIGH PRIORITY"
                      ? "rgba(207, 54, 54, 1)"
                      : "",
                  color:
                  data.category==="Done"?"white":
                    new Date(data?.dueDate) < new Date() ||
                    data.selectedPriority === "HIGH PRIORITY"
                      ? "white"
                      : "",


                }}
              >
                {data ? formatDate(data.dueDate) : ""}
              </div>
            ) : (
              <div></div>
            )}

            <div className="card_footer_right">
              {category.map((item) =>
                item !== data.category ? (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      moveCardOnBoard(data._id, data.category, item)
                    }
                    key={item}
                  >
                    {item}
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default Card;
