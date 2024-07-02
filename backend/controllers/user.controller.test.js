import app from "../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";

import connectMongoDB from "../db/connectMongoDB.js";

dotenv.config();

let testUser1;
let testUser2;
let testUser3;

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
	testUser3 = await User.create({
		username: "testuser3",
		fullName: "Test User 3",
		email: "test3@example.com",
		password: "testpassword3",
	});
	testUser1 = await User.findOneAndUpdate(
		{ username: "testuser1" },
		{ following: [{ _id: testUser3._id }] }
	);
});

afterAll(async () => {
	await User.deleteMany({});
	await Post.deleteMany({});
	await mongoose.connection.close();
});

describe("getUserProfile", () => {
	it("successfully gets a user profile", async () => {
		const token = jwt.sign({ userId: testUser1._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.get(`/api/users/profile/${testUser2.username}`)
			.set("Cookie", `jwt=${token}`)
			.expect(200);
		expect(res.body).toBeInstanceOf(Object);
		expect(res.body.username).toBe(testUser2.username);
		expect(res.body.fullName).toBe(testUser2.fullName);
		expect(res.body.email).toBe(testUser2.email);
		expect(res.body.img).toBe(testUser2.img);
	});
});

describe("followUnfollowUser", () => {
	it("successfully follows a user", async () => {
		const token = jwt.sign({ userId: testUser1._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.post(`/api/users/follow/${testUser2._id}`)
			.set("Cookie", `jwt=${token}`)
			.expect(200);
		expect(res.body).toEqual({ message: "User followed successfully" });
		const updatedUser = await User.findById(testUser1._id);
		expect(updatedUser.following).toEqual([testUser3._id, testUser2._id]);
	});

	it("successfully unfollows a user", async () => {
		const token = jwt.sign({ userId: testUser1._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.post(`/api/users/follow/${testUser2._id}`)
			.set("Cookie", `jwt=${token}`)
			.expect(200);
		expect(res.body).toEqual({ message: "User unfollowed successfully" });
		const updatedUser = await User.findById(testUser1._id);
		expect(updatedUser.following).toEqual([testUser3._id]);
	});

	it("fails to follow a user that does not exist", async () => {
		const token = jwt.sign({ userId: testUser1._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.post(`/api/users/follow/123456789012345678901234`)
			.set("Cookie", `jwt=${token}`)
			.expect(404);
		expect(res.body).toEqual({ error: "User not found" });
	});
});

describe("getSuggestedUsers", () => {
	it("successfully gets suggested users", async () => {
		const token = jwt.sign({ userId: testUser1._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.get(`/api/users/suggested`)
			.set("Cookie", `jwt=${token}`)
			.expect(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBe(1);
		expect(res.body[0].username).toBe("testuser2");
	});

	describe("updateUser", () => {
		it("successfully updates a user's profile", async () => {
			const token = jwt.sign(
				{ userId: testUser1._id },
				process.env.JWT_SECRET,
				{
					expiresIn: "1d",
				}
			);
			const res = await request(app)
				.post("/api/users/update")
				.set("Cookie", `jwt=${token}`)
				.send({
					username: "newusername",
					fullName: "New Full Name",
					email: "newemail@example.com",
					profileImg:
						"https://images.unsplash.com/photo-1704631910579-6ea528a0f752?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZyZWUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
					coverImg:
						"https://images.unsplash.com/photo-1704631910579-6ea528a0f752?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZyZWUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
				})
				.expect(200);
			expect(res.body.username).toBe("newusername");
			expect(res.body.fullName).toBe("New Full Name");
			expect(res.body.email).toBe("newemail@example.com");
			expect(res.body.profileImg).toBeDefined();
			expect(res.body.coverImg).toBeDefined();
			expect(res.body.password).toBe(null);
			const updatedUser = await User.findById(testUser1._id);
			expect(updatedUser.username).toBe("newusername");
			expect(updatedUser.fullName).toBe("New Full Name");
			expect(updatedUser.email).toBe("newemail@example.com");
			expect(updatedUser.profileImg).toBeDefined();
      expect(updatedUser.coverImg).toBeDefined();
		});
	});
});
