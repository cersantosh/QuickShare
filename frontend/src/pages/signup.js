import React, { useEffect, useState } from "react";
import styles from "../styles/signup.module.css";
import { Link, useNavigate } from "react-router-dom";
import UsersMethods from "../controller/users.js";
import checkLogin from "../utils/check_login.js";
import NoInternetConnection from "./no_internet_connection.js";
const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setPasswordError(true);
    } else {
      setPasswordError(false);
    }
    const userMethods = new UsersMethods();
    const response = await userMethods.fetchUserByData({
      username: formData.username,
    });
    if (response.length > 0) {
      return setUsernameError(true);
    } else {
      setUsernameError(false);
    }

    await userMethods.addUser(
      JSON.stringify({
        username: formData.username,
        password: formData.password,
      })
    );
    navigate("/login");
  };

  const toggleFirstPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setConfirmPassword(!showConfirmPassword);
  };

  const checkUsernameExistance = async () => {
    console.log("calling");
    if (formData.username) {
      const userMethods = new UsersMethods();
      const response = await userMethods.fetchUserByData({
        username: formData.username,
      });
      if (response.length > 0) {
        alert("Username is already exists.");
      } else {
        alert("Username is available.");
      }
    }
  };

  useEffect(() => {
    if (checkLogin()) {
      return navigate("/select_avatar");
    }
  }, []);

  const handleOnline = () => {
    setIsOnline(true);
  };
  const handleOffline = () => {
    setIsOnline(false);
  };

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NoInternetConnection />;
  }

  return (
    <div className={styles["signup-form-container"]}>
      <form className={styles["signup-form"]} onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <div className={styles["form-group"]}>
          <label htmlFor="username">Username</label>
          <div className={styles["username-input"]}>
            <input
              type="text"
              id="username"
              name="username"
              onChange={handleChange}
              required
            />

            <i
              className={`fa-solid fa-circle-exclamation ${styles["username-icon"]}`}
              onClick={checkUsernameExistance}
            ></i>
          </div>
          {usernameError && (
            <p className={styles["error"]}>Username is already exist.</p>
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
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className={styles["password-input"]}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              onChange={handleChange}
              required
            />
            {showConfirmPassword ? (
              <i
                className="fa-solid fa-eye"
                onClick={toggleConfirmPassword}
              ></i>
            ) : (
              <i
                className="fa-solid fa-eye-slash"
                onClick={toggleConfirmPassword}
              ></i>
            )}
          </div>
          {passwordError && (
            <p className={styles["error"]}>
              Password and confirm password is different
            </p>
          )}
        </div>

        <button type="submit">Sign Up</button>
        <br />
        <br />
        <div>
          Already have an account : <Link to="/login">Login Now</Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
