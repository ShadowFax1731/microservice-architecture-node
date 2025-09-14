const logger = require("../utils/logger");
const {
  validateUserRegistration,
  validateLogin,
} = require("../utils/validate");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

//Register User
const registerUser = async (req, res) => {
  logger.info("Registration Endpoint Hit");
  try {
    const { error } = validateUserRegistration(req.body);
    if (error) {
      logger.warn("Validation Error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password, username } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User Already Exists");
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.info("User Created Successfully", user._id);

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Login the user
const loginUser = async (req, res) => {
  logger.info("Login endpoint hit");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation Error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password, username } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid Credentials");
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    //Check if password is valid or not

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn("Invalid Password");
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const { accessToken, refreshToken } = await generateToken(user);
    res.json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("Login error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//refresh token

const refreshTokenController = async (req, res) => {
  logger.info("Refresh Token endpoint hit");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh Token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh Token Missing",
      });
    }
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or Expired Refresh Token");
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired Refresh Token",
      });
    }

    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User Not Found");
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    //delete old or existing tokens
    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh Token error occurred", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//log out

const logOutUser = async (req, res) => {
  logger.info("Logout endpoint hit");

  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh Token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh Token Missing",
      });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Refresh Token Deleted for log out");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Error while logging the user out", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenController,
  logOutUser,
};
