import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  profilePhoto: String,
});

const users = mongoose.model("users", userSchema);

export default users;
