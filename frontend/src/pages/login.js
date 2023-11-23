import React, { useEffect, useState } from "react";
import styles from "../styles/login.module.css";
import { Link, useNavigate } from "react-router-dom";
import UsersMethods from "../controller/users.js";
import checkLogin from "../utils/check_login.js";
import NoInternetConnection from "./no_internet_connection.js";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [usernameError, setUsernameError] = useState(false);
  const [passowrdError, setPassowrdError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handle submit");
    let user = await new UsersMethods().login(
      JSON.stringify({
        username: formData.username,
        password: formData.password,
      })
    );
    if (user.response.token) {
      localStorage.setItem("token", user.response.token);
      navigate("/select_avatar");
      return;
    }

    if (user.response === "username-and-password") {
      setUsernameError(true);
    } else {
      setUsernameError(false);
    }

    if (user.response === "password") {
      setPassowrdError(true);
    } else {
      setPassowrdError(false);
    }
  };

  const toggleFirstPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleOnline = () => {
    console.log("i am online");
    setIsOnline(true);
  }
  const handleOffline = () => {
    console.log("i am offline")
    setIsOnline(false);
  }

  useEffect(() => {
    if (checkLogin()) {
      return navigate("/select_avatar");
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if(!isOnline){
    return <NoInternetConnection/>
  }

  return (
    <div className={styles["login-form-container"]}>
      <form className={styles["login-form"]} onSubmit={handleSubmit}>
        <h2>Login Screen</h2>
        <div className={styles["form-group"]}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            onChange={handleChange}
            required
          />
          {usernameError && (
            <p className={styles["error"]}>User is not found.</p>
          )}
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="password">Password</label>
          <div className={styles["password-input"]}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              onChange={handleChange}
              required
            />
            {showPassword ? (
              <i className="fa-solid fa-eye" onClick={toggleFirstPassword}></i>
            ) : (
              <i
                className="fa-solid fa-eye-slash"
                onClick={toggleFirstPassword}
              ></i>
            )}
          </div>
          {passowrdError && (
            <p className={styles["error"]}>Incorrect Password.</p>
          )}
        </div>

        <button type="submit">Login</button>
        <div>
          Don't have an account : <Link to="/signup">Create Now</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
