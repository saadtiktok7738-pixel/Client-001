import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { signToken, authMiddleware } from "../middleware/auth.js";

const router = Router();

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: "Google credential required" });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }

    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name: name || "",
        googleId,
        avatar: picture || "",
        role: "user",
      });
    } else {
      const updates = {};

      if (!user.googleId) updates.googleId = googleId;
      if (picture && user.avatar !== picture) updates.avatar = picture;

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
        user = await User.findById(user._id);
      }
    }

    const token = signToken({
      id: String(user._id),
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/auth/me", (req, res, next) => authMiddleware(req, res, next), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/auth/profile", (req, res, next) => authMiddleware(req, res, next), async (req, res) => {
  try {
    const { name } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
    }).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;