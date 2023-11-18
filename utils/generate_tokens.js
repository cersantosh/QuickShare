import jwt from "jsonwebtoken";

function generateToken(username, _id) {
  const payload = {
    username,
    _id
  };

  // Generate a JWT token with a secret key and an expiration time
  const secretKey = process.env.SECRET_KEY;
  const token = jwt.sign(payload, secretKey);
  return token;
}

export default generateToken;
