function getCurrentUser() {
  let user = localStorage.getItem("token");
  if (user) {
    const decodedToken = JSON.parse(atob(user.split(".")[1]));
    return decodedToken;
  }
  return null;
}

export default getCurrentUser;
