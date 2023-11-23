function checkLogin(){
    return localStorage.getItem("token") ? true : false;
}

export default checkLogin;