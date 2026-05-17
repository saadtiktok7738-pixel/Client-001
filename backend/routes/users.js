import { Router } from "express";
import User from "../models/User.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middleware/auth.js";

const router = Router();

router.get(
  "/users",
  (req, res, next) => adminMiddleware(req, res, next),
  async (_req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: 1 });

      res.json(
        users.map((u) => ({
          ...u.toObject(),
          uid: String(u._id),
          id: String(u._id),
        }))
      );
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.patch(
  "/users/:id/role",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!["user", "admin"].includes(role)) {
        res.status(400).json({ error: "Invalid role" });
        return;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");

      if (!user) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      res.json({
        ...user.toObject(),
        uid: String(user._id),
        id: String(user._id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/users/:id",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      if (req.user?.id === req.params.id) {
        res.status(400).json({ error: "Cannot delete your own account" });
        return;
      }

      await User.findByIdAndDelete(req.params.id);

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;