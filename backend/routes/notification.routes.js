import express from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get("/", authenticateJWT);

export default router;