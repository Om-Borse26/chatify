import express from 'express';
import { signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", signup);

router.get("/Login", (req, res) => {
  res.json({ message: "Login endpoint" });
});

router.get("/Logout", (req, res) => {
  res.json({ message: "Logout endpoint" });
});

export default router;