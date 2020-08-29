const express = require("express");
const router = new express.Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, function(req, res, next) {
	try {
		return res.json({ users: User.all() });
	} catch (e) {
		return next(e);
	}
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, function(req, res, next) {
	try {
		const username = req.params.username;
		return res.json({ user: User.get(username) });
	} catch (e) {
		return next(e);
	}
});
/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureCorrectUser, function(req, res, next) {
	try {
		const username = req.params.username;
		return res.json({ messages: User.messagesTo(username) });
	} catch (e) {
		return next(e);
	}
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, function(req, res, next) {
	try {
		const username = req.params.username;
		return res.json({ messages: User.messagesFrom(username) });
	} catch (e) {
		return next(e);
	}
});
