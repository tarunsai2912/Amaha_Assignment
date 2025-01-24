import React, { useEffect, useState, useRef } from "react";
import "./Board.css";
import PeoplePNG from "../../Assets/people.png";
import AddPNG from "../../Assets/add2.png";
import CollapsePNG from "../../Assets/collapse.png";
import Card from "../Card/Card";
import Portal from "../../Services/Portal";
import TaskCreate from "../Task_Create/TaskCreate";
import axios from "axios";
import AddPeople from "../AddPeople/AddPeople";
import DropDownPNG from "../../Assets/dropdown.png";
import Toast from "../../Services/Toast/Toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Board() {
  const [toggleStateForTaskCreate, setToggleStateForTaskCreate] =
    useState(false);
  const [toggleStateForAddPeople, setToggleStateForAddPeople] = useState(false);
  const [toggleFilterOptions, setToggleFilterOptions] = useState(false);
  const [selectedFilterOptions, setSelectedFilterOptions] =
    useState("This Week");
  const [trigger, setTrigger] = useState(true);
  const trigerRender = () => {
    setTrigger(!trigger);
    fetchTaskAPI();
  };
  const [tasks, setTasks] = useState({
    Backlog: [],
    Todo: [],
    Progress: [],
    Done: [],
  });
  


  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const cardRefs = useRef({});
  const userId = JSON.parse(localStorage.getItem("userData"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchTaskAPI = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL_PORT}/api/task/fetch?userId=${userId._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks(response.data.tasks);
    } catch (error) {
      if (error.response?.status === 401) {
        Toast("Unauthorized Access", false);
      } else {
        const errorMessage =
          error.response?.data?.message || "An error occurred in server!";
        Toast(errorMessage, false);
      }
    }
  };

  const TriggeringRendering=useSelector((state)=>state.TriggeringRenderingSlice).rendering
  useEffect(()=>{
    fetchTaskAPI();
  },[TriggeringRendering])
  useEffect(() => {
    if (!toggleStateForTaskCreate && !toggleStateForAddPeople) {
      fetchTaskAPI();
    }
  }, [toggleStateForTaskCreate, toggleStateForAddPeople]);

  function getFormattedTodayDate() {
    const date = new Date();
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    const ordinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${ordinalSuffix(day)} ${month}, ${year}`;
  }

  const filterTasksByDueDate = (tasks, selectedFilter) => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedFilter) {
      case "Today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case "This Week":
    const dayOfWeek = now.getDay();
    startDate = new Date(now);

    
    startDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startDate.setHours(0, 0, 0, 0); 

    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    break;

      case "This Month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        return tasks;
    }

    const filtered = {};
    for (const section in tasks) {
      filtered[section] = tasks[section].filter((task) => {
        if (!task.dueDate) {
          return true;
        }
        const taskDate = new Date(task.dueDate);
        return taskDate >= startDate && taskDate < endDate;
      });
    }

    return filtered;
  };

  useEffect(() => {
    setFilteredTasks(filterTasksByDueDate(tasks, selectedFilterOptions));
  }, [tasks, selectedFilterOptions]);

  const toggleHandleTaskCreate = () => {
    setToggleStateForTaskCreate(!toggleStateForTaskCreate);
  };

  const toggleHandleForAddPeople = () => {
    setToggleStateForAddPeople(!toggleStateForAddPeople);
  };

  const toggleHandleForFilters = () => {
    setToggleFilterOptions(!toggleFilterOptions);
  };

  const updateCategoryAPI = async (id, to) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL_PORT}/api/task/update/category`,
        { taskId: id, category: to },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      if (error.status === 401) {
        Toast("Unauthoriized Access", false);
      } else {
        Toast(error.response.data.message, false);
      }
    }
  };

  const moveCardOnBoard = (data, from, to) => {
    updateCategoryAPI(data, to);
    const taskToMove = tasks[from].find((item) => item._id === data);

    if (taskToMove) {
      taskToMove.category = to;
      const updatedFromTasks = tasks[from].filter((item) => item._id !== data);
      const updatedToTasks = [...(tasks[to] || []), taskToMove];
      trigerRender();
      setTasks((prevTasks) => ({
        ...prevTasks,
        [from]: updatedFromTasks,
        [to]: updatedToTasks,
      }));
    }
  };

  const handleCollapseAll = (category) => {
    if (cardRefs.current[category]) {
      cardRefs.current[category].forEach((cardRef) => {
        if (cardRef && cardRef.callChildFunction) {
          cardRef.callChildFunction();
        }
      });
    }
  };

  return (
    <>
      {toggleStateForTaskCreate && (
        <Portal
          close={toggleHandleTaskCreate}
          component={
            <TaskCreate
              close={toggleHandleTaskCreate}
              onTaskCreated={fetchTaskAPI}
            />
          }
        />
      )}
      {toggleStateForAddPeople && (
        <Portal
          close={toggleHandleForAddPeople}
          component={<AddPeople close={toggleHandleForAddPeople} />}
        />
      )}

      <div className="board_container">
        <div className="board_heading_one">
          <div className="board_heading_one_left" id="checking">
            Welcome! {userId.name.split(" ")[userId.name.split(" ").length - 1]}
          </div>
          <div className="board_heading_one_right">
            {getFormattedTodayDate()}
          </div>
        </div>
        <div className="board_heading_two">
          <div className="board_heading_two_left">
            Board 
            <div className="board_heading_two_left_addpeople">
              <img alt="analytics" src={PeoplePNG} />
              <div
                className="board_heading_two_left_text"
                onClick={toggleHandleForAddPeople}
              >
                Add People
              </div>
            </div>
          </div>
          <div className="board_heading_two_right">
            {selectedFilterOptions}
            {toggleFilterOptions && (
              <div className="filter_options">
                <div
                  onClick={() => {
                    setToggleFilterOptions(false);
                    setSelectedFilterOptions("Today");
                  }}
                  style={{
                    backgroundColor:
                      selectedFilterOptions === "Today"
                        ? "rgb(211, 232, 255)"
                        : null,
                  }}
                >
                  Today
                </div>
                <div
                  onClick={() => {
                    setToggleFilterOptions(false);
                    setSelectedFilterOptions("This Week");
                  }}
                  style={{
                    backgroundColor:
                      selectedFilterOptions === "This Week"
                        ? "rgb(211, 232, 255)"
                        : null,
                  }}
                >
                  This Week
                </div>
                <div
                  onClick={() => {
                    setToggleFilterOptions(false);
                    setSelectedFilterOptions("This Month");
                  }}
                  style={{
                    backgroundColor:
                      selectedFilterOptions === "This Month"
                        ? "rgb(211, 232, 255)"
                        : null,
                  }}
                >
                  This Month
                </div>
              </div>
            )}
            <img
              alt="options"
              style={{
                width: "2vh",
                height: "1vh",
                cursor: "pointer",
                transform: toggleFilterOptions
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
              src={DropDownPNG}
              onClick={toggleHandleForFilters}
            />
          </div>
        </div>

        <div className="board_cell_container">
          {["Backlog", "Todo", "Progress", "Done"].map((category) => (
            <div className="board_cells" key={category}>
              <div className="board_cell_heading">
                <div className="board_cells_left">{category}</div>
                <div className="board_cell_right">
                  {category === "Todo" && (
                    <img
                      alt={`add_task${category}`}
                      className="add_task_cell"
                      src={AddPNG}
                      onClick={toggleHandleTaskCreate}
                    />
                  )}
                  <img
                    alt={`collapse${category}`}
                    className="collapse_task_cell"
                    src={CollapsePNG}
                    onClick={() => handleCollapseAll(category)}
                  />
                </div>
              </div>
              <div className="cells_card_container">
                {filteredTasks[category] &&
                  filteredTasks[category].map((item, index) => (
                    <Card
                      key={item._id}
                      data={item}
                      moveCardOnBoard={moveCardOnBoard}
                      ref={(el) => {
                        if (!cardRefs.current[category]) {
                          cardRefs.current[category] = [];
                        }
                        cardRefs.current[category][index] = el;
                      }}
                      trigerRender={trigerRender}
                      onTaskCreated={fetchTaskAPI}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
