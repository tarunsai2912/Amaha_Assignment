import React, { useState } from "react";
import "./Tooltips.css";

const Tooltips = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => {
    if (text.length > 50) {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => setIsVisible(false);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && <div className="tooltip-box">{text}</div>}
    </div>
  );
};

export default Tooltips;
