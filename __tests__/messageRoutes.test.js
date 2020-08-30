const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
let token;
describe("Message Routes Test", function() {
	beforeEach(async function() {
		await db.query("DELETE FROM messages");
		await db.query("DELETE FROM users");

		const u1 = await User.register({
			username: "test1",
			password: "password",
			first_name: "Test1",
			last_name: "Testy1",
			phone: "+14155550000"
		});
		const u2 = await User.register({
			username: "test2",
			password: "password",
			first_name: "Test2",
			last_name: "Testy2",
			phone: "+14155550000"
		});
		const u3 = await User.register({
			username: "test3",
			password: "password",
			first_name: "Test3",
			last_name: "Testy3",
			phone: "+14155550000"
		});

		const login = await request(app).post("/auth/login").send({
			username: "test1",
			password: "password"
		});
		token = login.body.token;
	});

	/** POST /auth/register => token  */

	describe("post /", function() {
		test("can create a new message", async function() {
			const resp = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });
			expect(resp.status).toEqual(200);
			expect(resp.body).toEqual({
				message: {
					id: expect.any(Number),
					from_username: "test1",
					to_username: "test2",
					body: "test body",
					sent_at: expect.any(String)
				}
			});
		});
		test("cannot create message if not logged in", async function() {
			const resp = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: null });
			expect(resp.status).toEqual(401);
		});
	});

	describe("get /:id", function() {
		test("can get message details if created message", async function() {
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });
			const resp = await request(app).get(`/messages/${msg.body.message.id}`).send({ _token: token });
			expect(resp.status).toEqual(200);
			expect(resp.body).toEqual({
				message: {
					id: expect.any(Number),
					from_user: {
						username: "test1",
						first_name: "Test1",
						last_name: "Testy1",
						phone: "+14155550000"
					},
					to_user: {
						username: "test2",
						first_name: "Test2",
						last_name: "Testy2",
						phone: "+14155550000"
					},
					body: "test body",
					sent_at: expect.any(String),
					read_at: null
				}
			});
		});
		test("can get message details if received message", async function() {
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });
			const authLogin = await request(app).post("/auth/login").send({
				username: "test2",
				password: "password"
			});
			const authToken = authLogin.body.token;
			const resp = await request(app).get(`/messages/${msg.body.message.id}`).send({ _token: authToken });
			expect(resp.status).toEqual(200);
			expect(resp.body).toEqual({
				message: {
					id: expect.any(Number),
					from_user: {
						username: "test1",
						first_name: "Test1",
						last_name: "Testy1",
						phone: "+14155550000"
					},
					to_user: {
						username: "test2",
						first_name: "Test2",
						last_name: "Testy2",
						phone: "+14155550000"
					},
					body: "test body",
					sent_at: expect.any(String),
					read_at: null
				}
			});
		});
		test("cannot see message if not authorized", async function() {
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });

			const unauthLogin = await request(app).post("/auth/login").send({
				username: "test3",
				password: "password"
			});
			const unauthToken = unauthLogin.body.token;
			const resp = await request(app).get(`/messages/${msg.body.message.id}`).send({ _token: unauthToken });
			expect(resp.status).toEqual(401);
		});
	});
	describe("post /:id/read", function() {
		test("can mark message as read", async function() {
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });
			const authLogin = await request(app).post("/auth/login").send({
				username: "test2",
				password: "password"
			});
			const authToken = authLogin.body.token;
			const resp = await request(app).post(`/messages/${msg.body.message.id}/read`).send({ _token: authToken });
			expect(resp.status).toEqual(200);
			expect(resp.body).toEqual({
				message: {
					id: expect.any(Number),
					read_at: expect.any(String)
				}
			});
		});
		test("cannot mark message as read if unauthorized", async function() {
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });
			const resp = await request(app).post(`/messages/${msg.body.message.id}/read`).send({ _token: token });
			expect(resp.status).toEqual(401);
		});
	});
});

afterAll(async function() {
	await db.end();
});
