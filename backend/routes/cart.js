import { Router } from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const auth = (req, res, next) =>
  authMiddleware(req, res, next);

router.get("/cart", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("cart");
    res.json(user?.cart || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cart", auth, async (req, res) => {
  try {
    const { productId, quantity, color } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const idx = user.cart.findIndex(
      (c) =>
        c.productId === productId &&
        c.color === (color || "")
    );

    if (idx > -1) {
      user.cart[idx].quantity =
        quantity ?? user.cart[idx].quantity + 1;
    } else {
      user.cart.push({
        productId,
        quantity: quantity || 1,
        color: color || "",
        addedAt: new Date().toISOString(),
      });
    }

    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/cart/:productId", auth, async (req, res) => {
  try {
    const { quantity, color } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const idx = user.cart.findIndex(
      (c) =>
        c.productId === req.params.productId &&
        c.color === (color || "")
    );

    if (idx > -1) {
      user.cart[idx].quantity = quantity;
    }

    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/cart/clear", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      cart: [],
    });

    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/cart/:productId", auth, async (req, res) => {
  try {
    const { color } = req.query;

    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    user.cart = user.cart.filter(
      (c) =>
        !(
          c.productId === req.params.productId &&
          c.color === (color || "")
        )
    );

    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;