import React, { useState, useEffect } from "react";
import { addItem } from "../../Store/Slices/InputFormData";
import { addError } from "../../Store/Slices/ErrorMessage";
import { useDispatch } from "react-redux";
import EyeIcon from "../../Assets/eyeIcon10.png";
export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState("email");
  const [showPasswordState, setShowPasswordState] = useState(false);
  const showPassword = () => {
    setShowPasswordState(!showPasswordState);
  };

  const dispatchingHandle = () => {
    dispatch(addError([errors]));
    dispatch(addItem([formData]));
  };
  useEffect(() => {
    dispatchingHandle();
  }, [formData]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let error = "";
    if (name === "name" && value.trim() === "") {
      error = "Name is required";
    } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Invalid email address";
    } else if (name === "password" && value.length < 6) {
      error = "Password must be at least 6 characters";
    } else if (name === "confirmPassword" && value !== formData.password) {
      error = "Passwords do not match";
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
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Form submitted successfully!");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form_container">
          <div>
            <input
              type="text"
              id="name"
              className={`form_name ${errors.name ? "error" : ""}`}
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>

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
            <input
              type={showPasswordState ? "text" : "password"}
              id="confirmPassword"
              className={`form_password ${
                errors.confirmPassword ? "error" : ""
              }`}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
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
