"use strict";

const router = require("express").Router();
const userController = require("../controllers/userController");
const cookieParser = require('cookie-parser');
const passport = require('passport');

router.get("/", userController.index, userController.respond);
router.post("/signup", userController.validateSignup, userController.create, userController.respond);
router.post("/login", userController.validateLogin, userController.login, userController.respond);
router.get("/logout", userController.logout);
router.post("/refresh_token", cookieParser(), passport.authenticate('refresh', {session: false}), userController.refreshToken, userController.respond);
router.get("/account", passport.authenticate('access', {session: false}), userController.account, userController.respond);
router.get("/profile_layout", passport.authenticate('access', {session: false}), userController.profileLayout, userController.respond);

module.exports = router;