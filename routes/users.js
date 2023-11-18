import express from "express";
import UsersController from "../controllers/users_controller.js";

const usersRouter = express.Router();

const usersController = new UsersController();

usersRouter.post("/add_user", usersController.addUser);
usersRouter.get("/all_users", usersController.allUsers);
usersRouter.get("/read_user/:id", usersController.readUserById);
usersRouter.post("/login", usersController.login);
usersRouter.post("/fetch_user", usersController.readUserByData);
usersRouter.put("/edit_user/:id", usersController.editUserById);


export default usersRouter;
