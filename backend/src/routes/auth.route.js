import express from 'express';

const router = express.Router();

router.get("/signup", (req, res) => {
  res.json({ message: "Signup endpoint" });
});

router.get("/Login", (req, res) => {
  res.json({ message: "Login endpoint" });
});

router.get("/Logout", (req, res) => {
  res.json({ message: "Logout endpoint" });
});

export default router;