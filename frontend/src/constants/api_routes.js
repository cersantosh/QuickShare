const port = "8000";
const hostname = `http://localhost:${port}`;

// users related
const users = `/users`;
const readUserById = `${users}/read_user`;
const readUserByDataURL = `${users}/fetch_user`;
const allUsers = `${users}/all_users`;
const addUserURL = `${users}/add_user`;
const loginURL = `${users}/login`;
const editUserURL = `${users}/edit_user`;
const getUploadedFiles = `${hostname}/shared_files`;

// message related
const messages = `/messages`;
const addMessage = `${messages}/add_message`;
const fetchMessageByData = `${messages}/fetch_message`;
const editMessageURL = `${messages}/edit_message`;
const deleteMessageURL = `${messages}/delete_message`;

// file related
const uploadFileURL = `${messages}/upload_file`;
const downloadFileURL = `${messages}/download_file`;
const deleteFileURL = `${hostname}/delete_file`;

export {
  addUserURL,
  loginURL,
  editUserURL,
  readUserById,
  allUsers,
  addMessage,
  fetchMessageByData,
  uploadFileURL,
  getUploadedFiles,
  downloadFileURL,
  editMessageURL,
  deleteMessageURL,
  readUserByDataURL,
  deleteFileURL,
  hostname
};
