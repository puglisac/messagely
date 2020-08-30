const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
let token;
describe("User Routes Test", function() {
	beforeEach(async function() {
		await db.query("DELETE FROM messages");
		await db.query("DELETE FROM users");

		let u1 = await User.register({
			username: "test1",
			password: "password",
			first_name: "Test1",
			last_name: "Testy1",
			phone: "+14155550000"
		});

		let response = await request(app).post("/auth/login").send({
			username: "test1",
			password: "password"
		});
		token = response.body.token;
	});

	/** POST /auth/register => token  */

	describe("get /", function() {
		test("can get all users", async function() {
			const resp = await request(app).get("/users/").send({ _token: token });
			expect(resp.status).toEqual(200);
			expect(resp.body).toEqual({
				users: [
					{
						username: "test1",
						first_name: "Test1",
						last_name: "Testy1",
						phone: "+14155550000"
					}
				]
			});
		});
		test("cannot get all users if unauthorized", async function() {
			const resp = await request(app).get("/users/").send({ _token: null });
			expect(resp.status).toEqual(401);
		});
	});

	describe("get /:username", function() {
		test("can get username details", async function() {
			const resp = await request(app).get(`/users/test1`).send({ _token: token });
			expect(resp.status).toEqual(200);
			expect(resp.body).toEqual({
				user: {
					username: "test1",
					first_name: "Test1",
					last_name: "Testy1",
					join_at: expect.any(String),
					last_login_at: expect.any(String),
					phone: "+14155550000"
				}
			});
		});
		test("cannot get details if unauthorized", async function() {
			let u2 = await User.register({
				username: "test2",
				password: "password",
				first_name: "Test2",
				last_name: "Testy2",
				phone: "+14155550000"
			});
			const resp = await request(app).get("/users/test2").send({ _token: null });
			expect(resp.status).toEqual(401);
		});
	});
	describe("get /:username/from", function() {
		test("can get messages from a user", async function() {
			let u2 = await User.register({
				username: "test2",
				password: "password",
				first_name: "Test2",
				last_name: "Testy2",
				phone: "+14155550000"
			});
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });

			const resp = await request(app).get(`/users/test1/from`).send({ _token: token });
			expect(resp.status).toEqual(200);
			expect(resp.body).toEqual({
				messages: [
					{
						id: expect.any(Number),
						body: "test body",
						sent_at: expect.any(String),
						read_at: null,
						to_user: expect.any(Object)
					}
				]
			});
		});
		test("cannot get messages from a user if unauthorized", async function() {
			let u2 = await User.register({
				username: "test2",
				password: "password",
				first_name: "Test2",
				last_name: "Testy2",
				phone: "+14155550000"
			});
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });

			const resp = await request(app).get(`/users/test1/from`).send({ _token: null });
			expect(resp.status).toEqual(401);
		});
	});
	describe("get /:username/to", function() {
		test("can get messages to a user", async function() {
			let u2 = await User.register({
				username: "test2",
				password: "password",
				first_name: "Test2",
				last_name: "Testy2",
				phone: "+14155550000"
			});
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });
			const authLogin = await request(app).post("/auth/login").send({
				username: "test2",
				password: "password"
			});
			const authToken = authLogin.body.token;
			const resp = await request(app).get(`/users/test2/to`).send({ _token: authToken });
			expect(resp.status).toEqual(200);
			expect(resp.body).toEqual({
				messages: [
					{
						id: expect.any(Number),
						body: "test body",
						sent_at: expect.any(String),
						read_at: null,
						from_user: expect.any(Object)
					}
				]
			});
		});
		test("cannot get messages to a user if unauthorized", async function() {
			let u2 = await User.register({
				username: "test2",
				password: "password",
				first_name: "Test2",
				last_name: "Testy2",
				phone: "+14155550000"
			});
			const msg = await request(app)
				.post("/messages/")
				.send({ to_username: "test2", body: "test body", _token: token });

			const resp = await request(app).get(`/users/test2/to`).send({ _token: token });
			expect(resp.status).toEqual(401);
		});
	});
});

afterAll(async function() {
	await db.end();
});
