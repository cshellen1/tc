import app from "../app.js";
import mongoose from "mongoose";
import request from "supertest";
import User from "../models/user.model.js";
import connectMongoDB from "../db/connectMongoDB.js";

let testUser1;
let testUser2;

beforeAll(async () => {
	await connectMongoDB();
	testUser1 = await User.create({
		username: "testuser1",
		fullName: "Test User 1",
		email: "test1@example.com",
		password: "testpassword1",
	});
	testUser2 = await User.create({
		username: "testuser2",
		fullName: "Test User 2",
		email: "test2@example.com",
		password: "testpassword2",
	});
});

afterAll(async () => {
	await User.deleteMany({});
	await mongoose.connection.close();
});

describe("signup", () => {
	it("should return an error if the email is invalid", async () => {
		const req = {
			body: {
				fullName: "Test User",
				username: "testuser",
				email: "testemail",
				password: "testpassword",
			},
		};
		const res = await request(app)
			.post("/api/auth/signup")
			.send(req)
			.expect(400)
			.expect((res) => {
				expect(res.body).toMatchObject({
					error: "Invalid email format",
				});
			});
	});
	it("should signup a user", async () => {
		const req = {
			fullName: "Test User",
			username: "uniquetestuser",
			email: "uniquetestemail@example.com",
			password: "validpassword",
		};

		const res = await request(app)
			.post("/api/auth/signup")
			.send(req)
			.expect(201)
			.expect((res) => {
				expect(res.body).toMatchObject({
					_id: expect.anything(),
					username: "uniquetestuser",
					email: "uniquetestemail@example.com",
					fullName: "Test User",
					followers: [],
					following: [],
					profileImg: "",
					coverImg: "",
					link: "",
				});
			});
	});
  it("should return an error if the username is already in use", async () => {
		const req = {
			fullName: "Test User",
			username: "testuser1",
			email: "uniqueusernametestemail@example.com",
			password: "<PASSWORD>",
		};
    const res = await request(app)
    .post("/api/auth/signup")
    .send(req)
    .expect(400)
    .expect((res) => {
       expect(res.body).toMatchObject({
         error: "Username already in use",
       });
     });
	});
	it("should return an error if the email is already in use", async () => {
		const req = {
			fullName: "Test User",
			username: "uniqueemailtestuser",
			email: "test1@example.com",
			password: "<PASSWORD>",
		};
		const res = await request(app)
			.post("/api/auth/signup")
			.send(req)
			.expect(400)
			.expect((res) => {
				expect(res.body).toMatchObject({
					error: "Email already in use",
				});
			});
	});
	it("should return an error if the password is less than 6 characters", async () => {
		const req = {
			fullName: "Test User",
			username: "testytester",
			email: "testytestemail@example.com",
			password: "short",
		};
		const res = await request(app)
			.post("/api/auth/signup")
      .send(req)
      .expect(400)
      .expect((res) => {
         expect(res.body).toMatchObject({
           error: "Password must be at least 6 characters",
         });
       });
	});
});
