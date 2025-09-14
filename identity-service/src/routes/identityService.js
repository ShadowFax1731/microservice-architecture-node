const express = require("express");
const {
  registerUser,
  loginUser,
  refreshTokenController,
  logOutUser,
} = require("../controllers/IdentityController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logOutUser);

module.exports = router;
