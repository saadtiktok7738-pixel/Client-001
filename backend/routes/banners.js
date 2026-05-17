import { Router } from "express";
import Banner from "../models/Banner.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/banners", async (_req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(
      banners.map((b) => ({
        ...b.toObject(),
        id: String(b._id),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/banners",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      const count = await Banner.countDocuments();

      const b = await Banner.create({
        ...req.body,
        order: count,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        ...b.toObject(),
        id: String(b._id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.patch(
  "/banners/:id",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      const b = await Banner.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!b) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      res.json({
        ...b.toObject(),
        id: String(b._id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/banners/:id",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      await Banner.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;