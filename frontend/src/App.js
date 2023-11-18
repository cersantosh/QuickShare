import Login from "./pages/login";
import SignUp from "./pages/signup";
import SelectAvatar from "./pages/select_avatar";
import ChatScreen from "./pages/chat_screen.js";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: localStorage.getItem("token") ? <SelectAvatar /> : <Login />,
    // element: <Login />
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/chat_screen",
    element: <ChatScreen />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/select_avatar",
    element: <SelectAvatar />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
