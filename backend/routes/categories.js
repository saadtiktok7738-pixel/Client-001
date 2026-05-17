import { Router } from "express";
import Category from "../models/Category.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/categories", async (_req, res) => {
  try {
    const cats = await Category.find().sort({ createdAt: 1 });

    res.json(
      cats.map((c) => ({
        ...c.toObject(),
        id: String(c._id),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/categories",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      const c = await Category.create({
        ...req.body,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        ...c.toObject(),
        id: String(c._id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/categories/:id",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      await Category.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;