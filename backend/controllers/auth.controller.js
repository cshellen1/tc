import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

/**
 * Handles the signup process for a new user.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing user information.
 * @param {string} req.body.fullName - The full name of the user.
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.email - The email address of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A JSON response containing the new user's information or an error message.
 */
export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password } = req.body;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username already in use" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email already in use" });
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ error: "Password must be at least 6 characters" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			return res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
				link: newUser.link,
			});
		} else {
			return res.status(400).json({ error: "Error creating user" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);

		return res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Handles user login functionality.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the login credentials.
 * @param {string} req.body.username - The username of the user trying to log in.
 * @param {string} req.body.password - The password of the user trying to log in.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A JSON response containing the user's information or an error message.
 */
export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		// Check for valid password if no user found then compare to "" so app doesnt crash.
		const isPasswordValid = await bcrypt.compare(
			password,
			user ? user.password : ""
		);

		if (!user || !isPasswordValid) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		return res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);

		return res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Handles user logout functionality.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A JSON response indicating successful logout.
 */
export const logout = async (req, res) => {
	try {
		res.clearCookie("jwt");
		return res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		return res.status(500).json({ error: "Internal server error" });
	}
};

/**
 * Retrieves the user information for the authenticated user.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A JSON response containing the user's information, excluding the password.
 */
export const getUser = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUser controller", error.message);
		return res.status(500).json({ error: "Internal server error" });
	}
};
