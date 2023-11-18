import users from "../models/users.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generate_tokens.js";
import { Readable } from "stream";

class UsersController {
  async allUsers(req, res) {
    try {
      const response = await users.find();
      res.json({
        success: true,
        message: "all users",
        response,
      });
    } catch (error) {
      res.json({
        success: false,
        message: error,
      });
    }
  }

  async readUserById(req, res) {
    try {
      const { id } = req.params;
      const response = await users.findById(id);
      res.json({
        success: true,
        message: "User found Successfully",
        response,
      });
    } catch (error) {
      res.send({ success: false, message: error });
    }
  }

  async addUser(req, res) {
    async function hashPassword(password) {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    }

    console.log("adding user", req.body);
    try {
      let { password } = req.body;
      password = await hashPassword(password);
      req.body = {
        ...req.body,
        password,
      };
      let response = await users.create(req.body);
      res.json({
        success: true,
        message: "User created Successfully",
        response,
      });
    } catch (error) {
      res.send({ success: false, message: error });
    }
  }

  async readUserByData(req, res) {
    try {
      const data = req.body;
      let response = await users.find(data);
      res.json({
        success: true,
        message: "User found Successfully",
        response,
      });
    } catch (error) {
      res.send({ success: false, message: error });
    }
  }

  async login(req, res) {
    console.log("login");
    try {
      const { username, password } = req.body;
      let response = await users.findOne({ username });
      if (response != null) {
        if (await bcrypt.compare(password, response.password)) {
          const token = generateToken(username, response._id);
          console.log("response", response);
          res.json({
            success: true,
            message: "User found Successfully",
            response: {
              ...response._doc,
              token: token,
            },
          });
        } else {
          res.json({
            success: true,
            message: "Password is invalid",
            response: "password",
          });
        }
      } else {
        res.json({
          success: true,
          message: "Username and password is invalid",
          response: "username-and-password",
        });
      }
    } catch (error) {
      res.send({ success: false, message: error });
    }
  }

  async editUserById(req, res) {
    try {
      const { id } = req.params;
      let response = await users.findByIdAndUpdate(id, req.body);
      res.json({
        success: true,
        message: "User Updated Successfully",
        response,
      });
    } catch (error) {
      res.send({ success: false, message: error });
    }
  }
}

export default UsersController;
