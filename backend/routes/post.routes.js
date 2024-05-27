import express from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { 
  createPost, 
  deletePost, 
  commentOnPost, 
  likeUnlikePost, 
  getAllPosts, 
  getLikedPosts, 
  getFollowingPosts,
  getUserPosts,
} from '../controllers/post.controllers.js';

const router = express.Router();

router.get("/all", authenticateJWT, getAllPosts);
router.get("/user/:username", authenticateJWT, getUserPosts);
router.get("/following", authenticateJWT, getFollowingPosts);
router.get("/likes/:id", authenticateJWT, getLikedPosts);
router.post("/create", authenticateJWT, createPost);
router.post("/like/:id", authenticateJWT, likeUnlikePost);
router.post("/comment/:id", authenticateJWT, commentOnPost);
router.delete("/:id", authenticateJWT, deletePost);

export default router;