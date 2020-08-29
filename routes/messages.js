const express = require("express");
const router = new express.Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Message = require("../models/message");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function(req, res, next) {
	try {
		const messageId = req.params.id;
		const retMessage = await Message.get(messageId);
		if (req.user.username != retMessage.from_user.username && req.user.username != retMessage.to_user.username) {
			throw new ExpressError("Not authorized to view this message", 401);
		}
		return res.json({ message: retMessage });
	} catch (e) {
		return next(e);
	}
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function(req, res, next) {
	try {
		const { to_username, body } = req.body;
		from_username = req.user.username;
		msg = await Message.create({ from_username, to_username, body });
		return res.json({ message: msg });
	} catch (e) {
		return next(e);
	}
});
/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async function(req, res, next) {
	try {
		const messageId = req.params.id;
		const retMessage = await Message.get(messageId);
		if (req.user.username != retMessage.to_user.username) {
			throw new ExpressError("Not authorized to mark this message as read", 401);
		}

		return res.json({ message: await Message.markRead(messageId) });
	} catch (e) {
		return next(e);
	}
});
module.exports = router;
