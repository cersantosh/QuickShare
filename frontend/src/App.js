import Login from "./pages/login";
import SignUp from "./pages/signup";
import SelectAvatar from "./pages/select_avatar";
import ChatScreen from "./pages/chat_screen.js";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import checkLogin from "./utils/check_login.js";
import NotFound from "./pages/not_found.js";
import NoInternetConnection from "./pages/no_internet_connection.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: checkLogin() ? <SelectAvatar /> : <Login />,
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/chat_screen",
    element: <ChatScreen />
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/select_avatar",
    element: <SelectAvatar/> ,
  },
  {
    path : "*",
    element : <NotFound/>
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
