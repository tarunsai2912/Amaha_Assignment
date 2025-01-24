import React, { useEffect, useState } from "react";
import { addItem } from "../../Store/Slices/InputFormData";
import { useDispatch } from "react-redux";
import { addError } from "../../Store/Slices/ErrorMessage";
import EyeIcon from "../../Assets/eyeIcon10.png";
export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const [showPasswordState, setShowPasswordState] = useState(false);

  const dispatchingHandle = () => {
    dispatch(addError([errors]));
    dispatch(addItem([formData]));
  };
  useEffect(() => {
    dispatchingHandle();
  }, [formData]);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let error = "";
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Invalid email address";
    } else if (name === "password" && value.length < 6) {
      error = "Password must be at least 6 characters";
    }

    setErrors({ ...errors, [name]: error });
  };

  const handleFocus = (e) => {
    setFocusedField(e.target.name);
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Form submitted successfully!");
    }
  };
  const showPassword = () => {
    setShowPasswordState(!showPasswordState);
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form_container">
          <div>
            <input
              type="email"
              id="email"
              name="email"
              className={`form_email ${errors.email ? "error" : ""}`}
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>

          <div style={{ position: "relative" }}>
            <input
              type={showPasswordState ? "text" : "password"}
              id="password"
              className={`form_password ${errors.password ? "error" : ""}`}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
            <img
              alt="eye"
              className="register_show_pass"
              src={EyeIcon}
              onClick={showPassword}
            />
          </div>
          <div style={{ position: "relative" }}>
            <div className="display_error">{errors[focusedField]}</div>
          </div>
        </div>
      </form>
    </>
  );
}
