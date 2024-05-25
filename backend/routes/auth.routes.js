import express from 'express';
import { signup, login, logout, getUser } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get("/user", authenticateJWT, getUser);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);


export default router;