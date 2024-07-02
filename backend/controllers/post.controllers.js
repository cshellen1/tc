import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

/**
 * Creates a new post in the application.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the post data.
 * @param {string} req.body.text - The text content of the post.
 * @param {string} [req.body.img] - The URL of an image to be associated with the post.
 * @param {string} req.user._id - The ID of the user creating the post.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - The created post object.
 * @throws {Error} - If there is an error creating the post.
 */
export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}
		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();
		console.log("newPost: ", newPost);
		return res.status(201).json(newPost);
	} catch (error) {
		console.log(error, "Error in createPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Deletes a post from the application.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.params.id - The ID of the post to be deleted.
 * @param {string} req.user._id - The ID of the user deleting the post.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A success message indicating the post was deleted.
 * @throws {Error} - If the post is not found or the user is not authorized to delete the post.
 */
export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}
		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		if (post.img) {
			const imageId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imageId);
		}
		await Post.findByIdAndDelete(req.params.id);
		return res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Adds a comment to a post.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.body.text - The text of the comment.
 * @param {string} req.params.id - The ID of the post to comment on.
 * @param {string} req.user._id - The ID of the user making the comment.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - The updated list of comments for the post.
 * @throws {Error} - If the post is not found or the text field is missing.
 */
export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = {
			user: userId,
			text,
		};

		post.comments.push(comment);
		await post.save();

		const updatedComments = await Post.findById(postId)
			.populate({
				path: "comments.user",
				select: "-password", // exclude password field
			})
			.then((post) => post.comments);

		return res.status(200).json(updatedComments);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Toggles the like/unlike state of a post for the current user.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.user._id - The ID of the user making the request.
 * @param {string} req.params.id - The ID of the post to like/unlike.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - The updated list of likes for the post.
 * @throws {Error} - If the post is not found.
 */
export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const postId = req.params.id;
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const isLiked = post.likes.includes(userId);

		if (isLiked) {
			// Unlike post
			await post.updateOne({ $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
			// Remove userId from likes array on post without sending another request
			const updatedLikes = post.likes.filter(
				(like) => like.toString() !== userId.toString()
			);
			return res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await post.updateOne({ $push: { likes: userId } });
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

			const updatedLikes = post.likes;
			return res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		/**
		 * Retrieves all posts from the database, sorted by creation date in descending order, and populates the user and comment user information.
		 *
		 * @param {Object} req - The HTTP request object.
		 * @param {Object} res - The HTTP response object.
		 * @returns {Promise<Object>} - The list of posts.
		 * @throws {Error} - If there is an error retrieving the posts.
		 */
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		return res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;
	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		/**
		 * Retrieves the posts that the current user has liked.
		 *
		 * @param {Object} req - The HTTP request object.
		 * @param {Object} res - The HTTP response object.
		 * @returns {Promise<Object>} - The list of posts the user has liked.
		 * @throws {Error} - If there is an error retrieving the liked posts.
		 */
		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		return res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		const following = user.following;

		/**
		 * Retrieves the posts that the current user is following.
		 *
		 * @param {Object} req - The HTTP request object.
		 * @param {Object} res - The HTTP response object.
		 * @returns {Promise<Object>} - The list of posts from the users the current user is following.
		 * @throws {Error} - If there is an error retrieving the posts from the users the current user is following.
		 */
		const followingPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		return res.status(200).json(followingPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const username = req.params.username;
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		/**
		 * Retrieves the posts of the user with the specified username.
		 *
		 * @param {Object} req - The HTTP request object.
		 * @param {string} req.params.username - The username of the user whose posts should be retrieved.
		 * @param {Object} res - The HTTP response object.
		 * @returns {Promise<Object>} - The list of posts for the specified user.
		 * @throws {Error} - If there is an error retrieving the posts for the specified user.
		 */
		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});
		return res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
