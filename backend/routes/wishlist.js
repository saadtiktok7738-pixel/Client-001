import { Router } from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const auth = (req, res, next) =>
  authMiddleware(req, res, next);

router.get("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("wishlist");
    res.json(user?.wishlist || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/wishlist/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }

    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/wishlist/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    user.wishlist = user.wishlist.filter(
      (id) => id !== req.params.productId
    );

    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;