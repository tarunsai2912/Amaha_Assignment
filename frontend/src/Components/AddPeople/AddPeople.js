import React, { useState, useEffect } from "react";
import AssignTo from "../../Services/AssignTo";
import "./AddPeople.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAccess } from "../../Store/Slices/AsseccToMultipleAssignee";
import Toast from "../../Services/Toast/Toast";

export default function AddPeople({ close }) {
  const assignList = useSelector((state) => state.AssignList.assignList);
  const [userGotAdded, setUserGotAdded] = useState(false);
  const userId = JSON.parse(localStorage.getItem("userData"));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAccess(true));

    
    return () => {
      dispatch(setAccess(false));
    };
  }, [dispatch]);

  const dispatchAssigneeAPI = async () => {
    if (assignList.length === 0) {
      Toast("Please add users", false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL_PORT}/api/task/mutipleassign`,
        {
          assignFrom: userId,
          assignTo: assignList,
        }
      );
      setUserGotAdded(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error in adding people on board!";
      Toast(errorMessage, false);
    }
  };

  const close2 = () => {
    setUserGotAdded(false);
    close();
  };

  return (
    <>
      {userGotAdded ? (
        <div className="addpeople_container" style={{ alignItems: "center" }}>
          <div className="people_container" style={{ display: "flex" }}>
            <div className="people_box">
              {assignList.map((item, index) => (
                <span key={index} className="add_people_heading">
                  {item.name}
                  {index < assignList.length - 1 && ", "}
                </span>
              ))}
            </div>
            <span>added to board</span>
          </div>

          <button className="addpeople_right" onClick={close2}>
            Okay, got it!
          </button>
        </div>
      ) : (
        <div className="addpeople_container">
          <div className="add_people_heading">Add people to the board</div>
          <AssignTo disableLabel={true} />
          <div className="addpeople_btns">
            <button className="addpeople_left" onClick={close2}>
              Cancel
            </button>
            <button className="addpeople_right" onClick={dispatchAssigneeAPI}>
              Add Email
            </button>
          </div>
        </div>
      )}
    </>
  );
}
