import mongoose from 'mongoose'
import Post from './post.model.js'
import User from './user.model.js'

describe('Post model', () => {
  let user
  let post

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    user = await User.create({
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'testpassword',
    })
  })

  afterAll(async () => {
    await User.deleteMany({})
    await Post.deleteMany({})
    await mongoose.connection.close()
  })

  it('should create a new post', async () => {
    const postData = {
      user: user._id,
      text: 'This is a test post',
    }

    post = await Post.create(postData)

    expect(post).toHaveProperty('_id')
    expect(post).toHaveProperty('user', user._id)
    expect(post).toHaveProperty('text', 'This is a test post')
    expect(post).toHaveProperty('likes', [])
    expect(post).toHaveProperty('comments', [])
  })

  it('should not create a post without a user', async () => {
    const postData = {
      text: 'This is a test post',
    }

    await expect(Post.create(postData)).rejects.toThrow()
  })

  it('should add a like to a post', async () => {
    await post.likes.push(user._id)
    await post.save()

    const updatedPost = await Post.findById(post._id)

    expect(updatedPost.likes).toContainEqual(user._id)
  })

  it('should add a comment to a post', async () => {
    const commentData = {
      text: 'This is a test comment',
      user: user._id,
    }

    await post.comments.push(commentData)
    await post.save()

    const updatedPost = await Post.findById(post._id)

    expect(updatedPost.comments).toHaveLength(1)
    expect(updatedPost.comments[0]).toMatchObject(commentData)
  })
})
