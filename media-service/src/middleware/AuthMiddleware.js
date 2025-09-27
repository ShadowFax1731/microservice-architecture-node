const logger = require("../utils/logger");

const AuthenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    logger.warn("Access attempted without user ID");
    return res.status(401).json({
      success: "False",
      message: "Authentication Required for the user. Login to continue",
    });
  }

  req.user = { userId };
  next();
};

module.exports = { AuthenticateRequest };
