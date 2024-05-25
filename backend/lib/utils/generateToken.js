import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
	console.log(userId._id);
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
