const express = require("express");
const router = new express.Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async function(req, res, next) {
	try {
		return res.json({ users: await User.all() });
	} catch (e) {
		return next(e);
	}
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async function(req, res, next) {
	try {
		const username = req.params.username;
		return res.json({ user: await User.get(username) });
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

router.get("/:username/to", ensureCorrectUser, async function(req, res, next) {
	try {
		const username = req.params.username;
		return res.json({ messages: await User.messagesTo(username) });
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
router.get("/:username/from", ensureCorrectUser, async function(req, res, next) {
	try {
		const username = req.params.username;
		return res.json({ messages: await User.messagesFrom(username) });
	} catch (e) {
		return next(e);
	}
});
module.exports = router;
