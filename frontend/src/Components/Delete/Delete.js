import React from "react";

export default function Delete({ close, confirmDelete, logout }) {
  const DeleteApi = () => {
    confirmDelete();
    close();
   
  };
  return (
    <>
      <div className="addpeople_container" style={{ gap: "3vh" }}>
        <div
          className="add_people_heading"
          style={{ textAlign: "center", fontSize: "3vh" }}
        >
          {logout
            ? "Are you sure you want to logout ?"
            : " Are you sure you want to delete ?"}
        </div>

        <div className="addpeople_btns">
          <button className="addpeople_left" onClick={close}>
            Cancel
          </button>
          <button className="addpeople_right" onClick={DeleteApi}>
            {logout ? "Yes, Logout" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </>
  );
}
