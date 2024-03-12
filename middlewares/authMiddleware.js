const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.mytoken;
  if (!token) {
    res.status(401).send({
      message: "Authentication failed! Token not found, Please try again.",
    });
  }
  jwt.verify(token, '998163247473816Hn-0qBoiik3rZ7jQbB3pXXekm-Q', (err, decoded) => {
    if (err) {
      res.status(401).send({
        message: "Unauthorized : Invalid token",
      });
      return;
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
  verifyToken,
};
