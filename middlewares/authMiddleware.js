const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header('AUTH_TOKEN');
  if (!token) {
    res.status(401).send({
      message: "Authentication failed! Token not found, Please try again.",
    }); return;
  }
  // second argument in verfiy method below is secret key it can be anything complex key to decode and encode.
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized : Invalid token",
      });
    }
    // Additional check for decoded token if needed
    if (!decoded || !decoded.uid) {
      return res.status(401).send({
        message: "Unauthorized: Invalid token payload",
      });
    }
    req.user = decoded;
    next();
  });
  return;
};

module.exports = {
  verifyToken
};
