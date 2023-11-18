// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCiMTXqmb2I0sDFcyfH_ipZTmHn07eacik",
    authDomain: "quickshare-405108.firebaseapp.com",
    projectId: "quickshare-405108",
    storageBucket: "quickshare-405108.appspot.com",
    messagingSenderId: "718687322759",
    appId: "1:718687322759:web:e1edd7763f2a341c526e22",
    measurementId: "G-LPSE3BJBC5"
  };

// Initialize Firebase
const firebaseApp =  initializeApp(firebaseConfig);
const firebaseStorage = getStorage(firebaseApp);
export default firebaseStorage;