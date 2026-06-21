const jwt = require("jsonwebtoken");

const optionalVerifyToken = (req, res, next) => {
  const token = req.header('AUTH_TOKEN');
  if (!token) {
    // No token provided, proceed as guest
    return next();
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      // Invalid token, proceed as guest or could reject.
      // Usually, if a token is present but invalid, we might want to reject, 
      // but for AI chat, we can just treat them as guest or let them know.
      // We'll just treat them as guest by not setting req.user.
      return next();
    }
    
    if (decoded && decoded.uid) {
      req.user = decoded;
    }
    next();
  });
};

module.exports = {
  optionalVerifyToken
};
