import { Router } from "express";
import Presence from "../models/Presence.js";

const router = Router();

const ACTIVE_WINDOW_MS = 60000;

router.post("/presence", async (req, res) => {
  try {
    const { visitorId } = req.body;

    if (!visitorId) {
      res.status(400).json({ error: "visitorId required" });
      return;
    }

    await Presence.findOneAndUpdate(
      { visitorId },
      { lastSeen: new Date() },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/presence/count", async (_req, res) => {
  try {
    const since = new Date(Date.now() - ACTIVE_WINDOW_MS);

    const count = await Presence.countDocuments({
      lastSeen: { $gte: since },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;