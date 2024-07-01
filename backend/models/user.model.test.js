import mongoose from 'mongoose'
import User from './user.model.js'

describe('User model', () => {
  let user

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  })

  afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
  })

  it('should create a new user', async () => {
    const userData = {
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'testpassword',
    }

    user = await User.create(userData)

    expect(user).toHaveProperty('_id')
    expect(user).toHaveProperty('username', 'testuser')
    expect(user).toHaveProperty('fullName', 'Test User')
    expect(user).toHaveProperty('email', 'test@example.com')
    expect(user.followers).toEqual([])
    expect(user.following).toEqual([])
    expect(user.profileImg).toBe('')
    expect(user.coverImg).toBe('')
    expect(user.bio).toBe('')
    expect(user.likedPosts).toEqual([])
    expect(user.link).toBe('')
  })

  it('should not create a user without required fields', async () => {
    const userData = {
      username: 'testuser',
      fullName: 'Test User',
    }

    await expect(User.create(userData)).rejects.toThrow()
  })

  it('should not create a user with a duplicate username', async () => {
    const userData = {
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'testpassword',
    }

    await expect(User.create(userData)).rejects.toThrow()
  })

  it('should not create a user with a duplicate email', async () => {
    const userData = {
      username: 'newuser',
      fullName: 'New User',
      email: 'test@example.com',
      password: 'testpassword',
    }

    await expect(User.create(userData)).rejects.toThrow()
  })

  it('should not create a user with a password shorter than 6 characters', async () => {
    const userData = {
      username: 'testuser',
      fullName: 'Test User',
      email: 'test2@example.com',
      password: 'short',
    }

    await expect(User.create(userData)).rejects.toThrow()
  });
});
