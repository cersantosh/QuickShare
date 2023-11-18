import axios from "axios";
import {
  addUserURL,
  editUserURL,
  loginURL,
  readUserById,
  allUsers,
  readUserByDataURL,
} from "../constants/api_routes";

import firebaseStorage from "../utils/firebase_initialize";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

class UsersMethods {
  async allUsers() {
    try {
      const response = await axios.get(allUsers, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.response;
    } catch (error) {
      console.log(`Error while fetching all users : ${error}`);
      return "error";
    }
  }

  async readUserById(id) {
    try {
      const response = await axios.get(`${readUserById}/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.response;
    } catch (error) {
      console.log("Error while reading user");
    }
  }

  async fetchUserByData(data) {
    try {
      const response = await axios.post(readUserByDataURL, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.response;
    } catch (error) {
      console.log(`Error while fetching user by data : ${error}`);
      return "error";
    }
  }

  async addUser(data) {
    console.log("adding user : ", data);
    try {
      const response = await axios.post(addUserURL, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
    } catch (error) {
      console.error("Error while creating user :", error);
    }
  }

  async login(data) {
    try {
      const response = await axios.post(loginURL, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error while logging user :", error);
      return "error";
    }
  }

  async editUserById(userId, data) {
    try {
      const response = await axios.put(`${editUserURL}/${userId}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error while updating user :", error);
      return "error";
    }
  }

  async uploadProfilePhoto(file, fileName) {
    console.log("file", file);
    try {
      // uploading to firebase storage
      const storageRef = ref(firebaseStorage, `profiles/${fileName}`);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.log("Error while uploading profile", error);
      return "error";
    }
  }

  async readProfilePhoto(fileName) {
    try {
      const fileRef = ref(firebaseStorage, fileName);
      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error("Error while fetching profile photo :", error);
      return "error";
    }
  }
}

export default UsersMethods;
