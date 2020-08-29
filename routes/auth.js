const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function(req, res, next) {
	try {
		const { username, password } = req.body;
		const user = User.get(username);

		if (user) {
			if (User.authenticate(username, password)) {
				User.updateLoginTimestamp(username);
				let token = jwt.sign({ username }, SECRET_KEY);
				return res.json({ token });
			}
		}
		throw new ExpressError("Invalid user/password", 400);
	} catch (err) {
		return next(err);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function(req, res, next) {
	try {
		const { username, password, first_name, last_name, phone } = req.body;
		User.register(username, password, first_name, last_name, phone);
		User.updateLoginTimestamp(username);
		let token = jwt.sign({ username }, SECRET_KEY);
		return res.json({ token });
	} catch (err) {
		if (err.code === "23505") {
			return next(new ExpressError("Username taken. Please pick another!", 400));
		}
		return next(err);
	}
});
