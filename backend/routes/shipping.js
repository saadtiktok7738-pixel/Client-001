import { Router } from "express";
import ShippingSettings from "../models/ShippingSettings.js";
import { adminMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/shipping", async (_req, res) => {
  try {
    let settings = await ShippingSettings.findOne();

    if (!settings) {
      settings = await ShippingSettings.create({
        type: "free",
        cost: 0,
      });
    }

    res.json({
      type: settings.type,
      cost: settings.cost,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  "/shipping",
  (req, res, next) => adminMiddleware(req, res, next),
  async (req, res) => {
    try {
      const { type, cost } = req.body;

      let settings = await ShippingSettings.findOne();

      if (!settings) {
        settings = await ShippingSettings.create({
          type,
          cost,
        });
      } else {
        settings.type = type;
        settings.cost = cost;
        await settings.save();
      }

      res.json({
        type: settings.type,
        cost: settings.cost,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;