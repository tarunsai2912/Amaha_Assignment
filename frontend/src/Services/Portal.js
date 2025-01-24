import React from "react";
import ReactDOM from "react-dom";

const Portal = ({ close, component }) => {
  const target = document.getElementById("root-model");
  const removePortal = () => {
    close();
  };
  const handleClickContent = (e) => {
    e.stopPropagation();
  };

  return ReactDOM.createPortal(
    <>
      <div style={overlayStyle} onClick={handleClickContent}>
        <div style={portalContentStyle} onClick={handleClickContent}>
          {component}
        </div>
      </div>
    </>,
    target
  );
};

export default Portal;

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: " rgba(48, 61, 67, 0.55)",
  backdropFilter: "blur(0px)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const portalContentStyle = {
  borderRadius: "8px",
  zIndex: 1001,
  position: "relative",
};