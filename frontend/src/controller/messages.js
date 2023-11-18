import axios from "axios";
import {
  addMessage,
  deleteMessageURL,
  editMessageURL,
  fetchMessageByData,
} from "../constants/api_routes";

import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import firebaseStorage from "../utils/firebase_initialize";

class MessagesMethods {
  async addMessage(data) {
    try {
      const response = await axios.post(addMessage, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.response;
    } catch (error) {
      console.log(`Error while adding message : ${error}`);
      return "error";
    }
  }

  async uploadFile(file, fileName) {
    try {
      // uploading to firebase storage
      const storageRef = ref(firebaseStorage, `shared_files/${fileName}`);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error(`Error while uploading file : ${error}`);
      return "error";
    }
  }

  async deleteFile(fileName) {
    try {
      const fileRef = ref(firebaseStorage, `shared_files/${fileName}`);
      await deleteObject(fileRef);
      console.log("File deleted successfully");
    } catch (error) {
      console.error(`Error while deleting file : ${error}`);
    }
  }

  async fetchMessageByData(data) {
    try {
      const response = await axios.post(fetchMessageByData, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.response;
    } catch (error) {
      console.log(`Error while fetching message by data : ${error}`);
      return "error";
    }
  }

  async editMessage(messageId, data) {
    try {
      const response = await axios.put(`${editMessageURL}/${messageId}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.response;
    } catch (error) {
      console.log(`Error while updating message : ${error}`);
      return "error";
    }
  }

  async deleteMessage(messageId) {
    try {
      const response = await axios.delete(`${deleteMessageURL}/${messageId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data.response;
    } catch (error) {
      console.log(`Error while deleting message : ${error}`);
      return "error";
    }
  }
}

export default MessagesMethods;
