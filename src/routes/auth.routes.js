const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authRequired, requireAdmin } = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", authRequired, authController.me);

module.exports = router;
