import jwt from "jsonwebtoken";

/**
 * Generates a JWT token and sets it as a cookie on the response object.
 *
 * @param {string} userId - The ID of the user to generate the token for.
 * @param {object} res - The Express response object to set the cookie on.
 * @returns {object} The response object with the JWT token set as a cookie.
 */
export const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	return res.cookie("jwt", token, {
		maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days in milliseconds
		httpOnly: true, // prevent XSS attacks cross-site scripting attacks
		sameSite: "strict", // prevent CSRF attacks cross-site request forgery
		secure: process.env.NODE_ENV !== "development", // only send cookie over https
	});
};
