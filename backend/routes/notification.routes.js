import express from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT';

const router = express.Router();

router.get("/", authenticateJWT);

export default router;