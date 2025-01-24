import React, { useState } from "react";
import "./Login&Register.css";
import LoginPagePNG from "../../Assets/LoginPage.png";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader/Loader";
import Toast from "../../Services/Toast/Toast";
import { useNavigate } from "react-router-dom";
import { addItem } from "../../Store/Slices/LoggedOrNot";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const InputFormData = useSelector(
    (state) => state.InputFormData
  )?.inputFormData;
  const ErrorMessage = useSelector((state) => state.ErrorMessage).errorMessage;
  const navigate = useNavigate();

  const registerAPI = async () => {
    if (
      !InputFormData ||
      !InputFormData[0]?.email ||
      !InputFormData[0]?.password
    ) {
      Toast("Please fill in all fields", false);
      return;
    }

    if (ErrorMessage[0]) {
      const { name, email, password, confirmPassword } = ErrorMessage[0];

      if (name) {
        Toast(name, false);
        return;
      }
      if (email) {
        Toast(email, false);
        return;
      }
      if (password) {
        Toast(password, false);
        return;
      }
      if (confirmPassword) {
        Toast(confirmPassword, false);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axios.post(
         `${process.env.REACT_APP_BASE_URL_PORT}/api/auth/register`,
        {
          name: InputFormData[0].name,
          email: InputFormData[0].email,
          password: InputFormData[0].password,
          confirmPassword: InputFormData[0].confirmPassword,
        }
      );
      setIsLogin(true);
      Toast("Successfully registered", true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred during registration";
      Toast(errorMessage, false);
    } finally {
      setLoading(false);
    }
  };
  const dispatch = useDispatch();

  const loginAPI = async () => {
    if (
      !InputFormData ||
      !InputFormData[0]?.email ||
      !InputFormData[0]?.password
    ) {
      Toast("Please fill in all fields", false);
      return;
    }

    if (ErrorMessage[0]) {
      const { name, email, password, confirmPassword } = ErrorMessage[0];

      if (name) {
        Toast(name, false);
        return;
      }
      if (email) {
        Toast(email, false);
        return;
      }
      if (password) {
        Toast(password, false);
        return;
      }
      if (confirmPassword) {
        Toast(confirmPassword, false);
        return;
      }
    }
    setLoading(true);
    try {
      const response = await axios.post(
         `${process.env.REACT_APP_BASE_URL_PORT}/api/auth/login`,
        {
          email: InputFormData[0].email,
          password: InputFormData[0].password,
        }
      );

      localStorage.setItem(
        "userData",
        JSON.stringify({
          _id: response.data.data._id,
          name: response.data.data.name,
          email: response.data.data.email,
        })
      );
      localStorage.setItem("token", response.data.token);

      dispatch(addItem());

      navigate("/dashboard");
      Toast("Login successful", true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during login";
      Toast(errorMessage, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login_register_container">
      {loading && <Loader />}

      <div className="l_r_left">
        <div className="l_r_left_center">
          <div className="l_r_center_circle">
            <img alt="loginimg" src={LoginPagePNG} />
          </div>
        </div>
        <div className="l_r_center_text">
          <h2>Welcome aboard my friend</h2>
          <h4>Just a couple of clicks and we start</h4>
        </div>
      </div>

      <div className="l_r_right">
        <div className="l_r_right_heading">
          {isLogin ? "Login" : "Register"}
        </div>
        <div className="l_r_right_form">
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
        <div className="l_r_right_buttons">
          {isLogin ? (
            <button
              className="l_r_r_b1"
              style={{ cursor: "pointer" }}
              onClick={loginAPI}
              disabled={loading}
            >
              Login
            </button>
          ) : (
            <button
              className="l_r_r_b1"
              style={{ cursor: "pointer" }}
              onClick={registerAPI}
              disabled={loading}
            >
              Register
            </button>
          )}
          <div>
            {isLogin === false ? "Have an account ?" : "Have no account yet?"}
          </div>
          <button
            className="l_r_r_b2"
            style={{ cursor: "pointer" }}
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin === false ? "Login" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
