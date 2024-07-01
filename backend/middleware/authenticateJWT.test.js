import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import connectMongoDB from '../db/connectMongoDB.js';
import User from '../models/user.model.js';

dotenv.config();

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

describe('authenticateJWT middleware', () => {
  it('should authenticate the JWT', async () => {
    const token = jwt.sign({ userId: testUser1._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const res = await request(app)
      .get('/api/auth/user')
      .set('Cookie', `jwt=${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          _id: testUser1._id.toString(),
          username: "testuser1",
          email: "test1@example.com",
        });
      });
  });
  it ('should return 401 if no token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/user')
      .expect(401)
      .expect((res) => {
        expect(res.body).toMatchObject({
          error: "Unauthorized: No token provided",
        });
      });
  });
  it ('should return 401 if the userId is not found', async () => {
    const invalidUserId = new mongoose.Types.ObjectId();
    const invalidToken = jwt.sign({ userId: invalidUserId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const res = await request(app)
      .get('/api/auth/user')
      .set('Cookie', `jwt=${invalidToken}`)
      .expect(401)
      .expect((res) => {
        expect(res.body).toMatchObject({
          error: "User not found",
        });
      });
  });
  it ('should return 500 if the token is invalid', async () => {
    const invalidToken = 'invalidtoken';
    const res = await request(app)
    .get('/api/auth/user')
    .set('Cookie', `jwt=${invalidToken}`)
    .expect(500)
    .expect((res) => {
      expect(res.body).toMatchObject({
        error: "Internal server error",
        message: "jwt malformed",
      });
    });
  });
});
