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
let testPost1;
let testPost2;

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
	testPost1 = await Post.create({
		user: testUser1._id,
		text: "This is a test post",
		comments: [
			{
				text: "This is a test comment",
				user: testUser2._id,
			},
		],
    likes: [
      {
        _id: testUser2._id,
      },
    ],
	});
	testPost2 = await Post.create({
		user: testUser2._id,
		text: "This is another test post",
	});

  await User.findOneAndUpdate({username: "testuser2"}, {likedPosts: [ {_id: testPost1._id }]})
});

afterAll(async () => {
	await User.deleteMany({});
	await Post.deleteMany({});
	await mongoose.connection.close();
});

describe("createPost", () => {
	it("successfully creates a new post with just text", async () => {
		const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		const req = {
			text: "This is a test post",
		};

		const res = await request(app)
			.post("/api/posts/create")
			.set("Cookie", `jwt=${token}`)
			.send(req)
			.expect(201);
		expect(res.body._id).toBeDefined();
		expect(res.body.createdAt).toBeDefined();
		expect(res.body.updatedAt).toBeDefined();
		expect(res.body.text).toBe(req.text);
		expect(res.body.user).toBe(testUser1._id.toString());
	});

	it("successfully creates a new post with just text and an image", async () => {
		const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const req = {
			text: "This is a test post",
			img: "https://images.unsplash.com/photo-1704631910579-6ea528a0f752?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZyZWUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		};

		const res = await request(app)
			.post("/api/posts/create")
			.set("Cookie", `jwt=${token}`)
			.send(req)
			.expect(201);
		expect(res.body._id).toBeDefined();
		expect(res.body.createdAt).toBeDefined();
		expect(res.body.updatedAt).toBeDefined();
		expect(res.body.text).toBe(req.text);
		expect(res.body.img).toBeDefined();
		expect(res.body.user).toBe(testUser1._id.toString());

    // clean up cloudinary account after test
    if (res.body.img) {
			const imageId = res.body.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imageId);
		}
	});

	it("successfully creates a new post with just an image", async () => {
		const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const req = {
			img: "https://images.unsplash.com/photo-1704631910579-6ea528a0f752?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZyZWUlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D",
		};

		const res = await request(app)
			.post("/api/posts/create")
			.set("Cookie", `jwt=${token}`)
			.send(req)
			.expect(201);
		expect(res.body._id).toBeDefined();
		expect(res.body.createdAt).toBeDefined();
		expect(res.body.updatedAt).toBeDefined();
		expect(res.body.img).toBeDefined();
		expect(res.body.user).toBe(testUser1._id.toString());

    // clean up cloudinary account after test
    if (res.body.img) {
			const imageId = res.body.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imageId);
		}
	});

	it("fails to create a new post without a text or image", async () => {
		const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const req = { text: undefined, img: undefined };

		const res = await request(app)
			.post("/api/posts/create")
			.set("Cookie", `jwt=${token}`)
			.send(req)
			.expect(400);
		expect(res.body.error).toBe("Post must have text or image");
	});
});

describe("getAllPosts", () => {
	it("successfully gets all posts", async () => {
		const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.get("/api/posts/all")
			.set("Cookie", `jwt=${token}`)
			.expect(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBe(5);
		expect(res.body[4].text).toBe(testPost1.text);
		expect(res.body[4].user._id).toBe(testUser1._id.toString());
		expect(res.body[3].text).toBe(testPost2.text);
		expect(res.body[3].user._id).toBe(testUser2._id.toString());
		expect(res.body[0].img).toBeDefined();
    expect(res.body[4].comments[0].text).toBe(testPost1.comments[0].text);
	});
});

describe("comment on post", () => {
	it("successfully comments on a post", async () => {
		const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
    const req = {
			text: "This is a test comment for test post 2",
		};
    const res = await request(app)
    .post(`/api/posts/comment/${testPost2._id}`)
    .set("Cookie", `jwt=${token}`)
    .send(req)
    .expect(200);
    expect(res.body[0].text).toBe(req.text);
    expect(res.body[0].user._id).toBe(testUser1._id.toString());
	});

  it("throws an error if no text is provided", async () => {
    const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const req = {
      text: undefined,
    };
    const res = await request(app)
     .post(`/api/posts/comment/${testPost2._id}`)
     .set("Cookie", `jwt=${token}`)
     .send(req)
     .expect(400);
    expect(res.body.error).toBe("Text field is required");
  });

  it("throws an error if the post id is invalid", async () => {
    const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const req = {
      text: "This is a test comment for test post 2",
    };
    const res = await request(app)
     .post("/api/posts/comment/123456789012345678901234")
     .set("Cookie", `jwt=${token}`)
     .send(req)
     .expect(404);
    expect(res.body.error).toBe("Post not found");
  });
});

describe("likeUnlikePost", () => {
	it("successfully likes a post", async () => {
		const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.post(`/api/posts/like/${testPost2._id}`)
			.set("Cookie", `jwt=${token}`)
			.expect(200);
		expect(res.body.length).toBe(1);
		expect(res.body[0]).toBe(testUser1._id.toString());
	});

  it("successfully unlikes a post", async () => {
		const token = jwt.sign({ userId: testUser1 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.post(`/api/posts/like/${testPost2._id}`)
			.set("Cookie", `jwt=${token}`)
			.expect(200);
		expect(res.body.length).toBe(0);
	});
});

describe("getLikedPosts", () => {
	it("successfully gets all liked posts", async () => {
		const token = jwt.sign({ userId: testUser2 }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});
		const res = await request(app)
			.get(`/api/posts/likes/${testPost1._id}`)
			.set("Cookie", `jwt=${token}`)
			.expect(200);
      console.log(res.body);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBe(1);
		expect(res.body[0].user._id).toBe(testUser1._id.toString());
	});
});

