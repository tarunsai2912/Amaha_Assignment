import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Service.css";
import { addItem } from "../Store/Slices/AssignList";
import { useDispatch, useSelector } from "react-redux";
import Toast from "./Toast/Toast";
export default function AssignTo({ disableLabel, data }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [assignList, setAssignList] = useState(data ? data : []);
  const [loading, setLoading] = useState(false);
  const assignListGlobal = useSelector((state) => state.AssignList).assignList;
  const AsseccToMultipleAssignee = useSelector(
    (state) => state.AccessToMultipleAssignee
  ).acsessToMultipleAssignee;
  const userId = JSON.parse(localStorage.getItem("userData"))

  const dispatch = useDispatch();
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const fetchUserAPI = async () => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL_PORT}/api/search?searchTerm=${inputValue}`
      );
      setSuggestions(() => {
        const newData = response.data.results.filter((item) => {
          if (item._id !== userId._id) {
            return item;
          }
        });
        return newData;
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while suggestion users!";
      Toast(errorMessage, false);
    } finally {
      setLoading(false);
    }
  };
  const debouncedFetchUserAPI = useCallback(debounce(fetchUserAPI, 500), [
    inputValue,
  ]);
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (inputValue.trim()) {
      debouncedFetchUserAPI();
    }
  }, [inputValue, debouncedFetchUserAPI]);

  const addAssigneesToList = (data2) => {
    if (!AsseccToMultipleAssignee) {
      if (data) {
        setAssignList([...assignList, data2]);
      } else {
        if (assignList.length < 1) {
          setAssignList([...assignList, data2]);
        }
      }
    } else {
      setAssignList([...assignList, data2]);
    }
  };

  const deleteAssigneesFromList = (data) => {
    const newData = assignList.filter((item) => item !== data);
    setAssignList([...newData]);
  };

  useEffect(() => {
    dispatch(addItem(assignList));
  }, [assignList]);

  function getInitials(input) {
    const words = input.trim().split(" ");

    if (words.length > 1) {
      return words[0][0] + words[1][0];
    } else {
      return words[0].slice(0, 2);
    }
  }
  return (
    <>
      <div
        className="task_c_display_assigns"
        style={{ display: assignList.length > 0 ? "flex" : "none" }}
      >
        {assignList.length > 0 &&
          assignList.map((item, index) => (
            <div className="task_c_display_assigns_item" key={index}>
              <span className="s1">{item.name}</span>
              <span
                className="s2"
                onClick={() => deleteAssigneesFromList(item)}
              >
                X
              </span>
            </div>
          ))}
      </div>

      <div className="task_c_assign">
        {disableLabel === true ? (
          ""
        ) : (
          <label style={{ width: "15vh" }}>Assign to</label>
        )}

        <input
          type="text"
          className="task_c_title_input"
          placeholder="Add an assignee"
          value={inputValue}
          onChange={handleInputChange}
          required
        />

        {loading ? (
          <div>Loading...</div>
        ) : (
          suggestions.length > 0 && (
            <div
              className="suggestions-list"
              style={{
                display: inputValue === "" ? "none" : "",
                left: disableLabel ? "0.5vh" : "",
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <div className="suggestion_item_logo">
                    {getInitials(suggestion.name)}
                  </div>
                  <div className="suggestion_item_email">
                    {suggestion.email}
                  </div>
                  <button
                    className="suggestion_item_button"
                    disabled={assignList.includes(suggestion)}
                    style={{
                      backgroundColor: assignListGlobal.some(
                        (polItem) => suggestion._id === polItem.assignee
                      )
                        ? "rgb(238, 236, 236)"
                        : "",
                      cursor: assignListGlobal.some(
                        (polItem) => suggestion._id === polItem.assignee
                      )
                        ? "not-allowed"
                        : "pointer",
                    }}
                    onClick={() => addAssigneesToList(suggestion)}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}
