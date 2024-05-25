import express from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import {
	getUserProfile,
	followUnfollowUser,
	getSuggestedUsers,
	updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", authenticateJWT, getUserProfile);
router.get("/suggested", authenticateJWT, getSuggestedUsers);
router.post("/follow/:id", authenticateJWT, followUnfollowUser);
router.post("/update", authenticateJWT, updateUser);

export default router;