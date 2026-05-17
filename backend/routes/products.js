import { Router } from "express";
import Product from "../models/Product.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/auth.js";

const router = Router();

router.get("/products", async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const mapped = products.map((p) => ({
      ...p.toObject(),
      id: String(p._id),
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);

    if (!p) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({ ...p.toObject(), id: String(p._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/products",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      const p = await Product.create({
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({
        ...p.toObject(),
        id: String(p._id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/products/:id",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      const p = await Product.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      );

      if (!p) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      res.json({ ...p.toObject(), id: String(p._id) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.patch(
  "/products/:id/flag",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      const { flag, value } = req.body;

      const allowed = ["isHot", "isNewArrival", "isLimitedOffer"];

      if (!allowed.includes(flag)) {
        res.status(400).json({ error: "Invalid flag" });
        return;
      }

      if (value) {
        const limit = flag === "isLimitedOffer" ? 1 : 8;

        const count = await Product.countDocuments({
          [flag]: true,
          _id: { $ne: req.params.id },
        });

        if (count >= limit) {
          res.status(409).json({
            error: `Limit reached (${limit}) for this flag.`,
          });
          return;
        }
      }

      const p = await Product.findByIdAndUpdate(
        req.params.id,
        {
          [flag]: value,
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      );

      if (!p) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      res.json({ ...p.toObject(), id: String(p._id) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/products/:id",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;