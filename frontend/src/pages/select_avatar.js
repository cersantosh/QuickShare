import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import UsersMethods from "../controller/users";
import getCurrentUser from "../utils/get_current_user.js";
import { useNavigate } from "react-router-dom";
import firebaseStorage from "../utils/firebase_initialize.js";
import { ref, getDownloadURL } from "firebase/storage";
import checkLogin from "../utils/check_login.js";
import NoInternetConnection from "./no_internet_connection.js";
const SelectAvatar = () => {
  const avatars = [
    "avatar1.png",
    "avatar2.png",
    "avatar3.png",
    "avatar4.png",
    "avatar5.png",
  ];
  const [myData, setMyData] = useState(null);
  const [selectedFileImage, setSelectedFileImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const navigate = useNavigate();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileToFirebase = async () => {
    try {
      if (selectedImage != null) {
        const usersMethods = new UsersMethods();
        const userId = getCurrentUser()._id;
        if (selectedImage.name) {
          let uniqueName = `${uuidv4()}${selectedImage.name}`;
          const downloadURL = await usersMethods.uploadProfilePhoto(
            selectedImage,
            uniqueName
          );
          await usersMethods.editUserById(userId, {
            profilePhoto: downloadURL,
          });
          console.log("Profile photo uploaded successfully");

          navigate("/chat_screen");
        } else {
          const fileRef = ref(firebaseStorage, `profiles/${selectedImage}`);
          // Get the download URL
          const downloadURL = await getDownloadURL(fileRef);
          await usersMethods.editUserById(userId, {
            profilePhoto: downloadURL,
          });
          console.log("Profile photo uploaded successfully");
          navigate("/chat_screen");
        }
      }
    } catch (error) {
      console.log("Error while uploading profile", error);
    }
  };

  const fetchMyData = async () => {
    const id = getCurrentUser()._id;
    const response = await new UsersMethods().readUserById(id);
    setMyData(response);
  };

  useEffect(() => {
    console.log("select avatar");
    if(!checkLogin()){
      return navigate("/login");
    }
    fetchMyData();
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

  if (myData) {
    if (myData.profilePhoto) {
      navigate("/chat_screen");
      return null;
    }

    return (
      <Container>
        <p>Please select an avatar</p>
        <div className="avatars">
          {avatars.map((avatar, index) => {
            return (
              <img
                src={`assets/images/${avatar}`}
                alt="avatar"
                key={index}
                className={
                  avatar === selectedImage
                    ? "avatars-images selected"
                    : "avatars-images"
                }
                onClick={() => setSelectedImage(avatar)}
              />
            );
          })}

          <div className="file-input">
            {selectedFileImage ? (
              <img src={selectedFileImage} alt="Selected" />
            ) : (
              <label htmlFor="image-upload">
                <i className="fas fa-upload"></i>
              </label>
            )}
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <button onClick={uploadProfileToFirebase}>Select Photo</button>
      </Container>
    );
  } else {
    return <img src="assets/images/loading.gif" alt="loader" />;
  }
};

export default SelectAvatar;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;

  p {
    margin-bottom: 10px;
  }

  .avatars-images {
    width: 60px;
    height: 60px;
    margin-right: 5px;
  }

  img.selected {
    border: 3px solid red;
    border-radius: 50%;
  }

  .avatars {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
    /* border: 3px solid black; */
  }

  .file-input {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  .file-input label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border: 2px dashed #ccc;
    border-radius: 50%;
    background-color: #f5f5f5;
    color: #555;
    font-size: 18px;
    transition: border-color 0.3s;
  }

  .file-input img {
    display: block;
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 50%;
  }

  .file-input input[type="file"] {
    display: none;
  }

  .file-input label:hover {
    border-color: #007bff;
  }
`;
