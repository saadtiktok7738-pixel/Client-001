import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { adminMiddleware } from "../middleware/auth.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return {
    cloudName,
    apiKey,
    apiSecret,
    ready: !!(cloudName && apiKey && apiSecret),
  };
}

router.post(
  "/upload",
  (req, res, next) => adminMiddleware(req, res, next),
  upload.single("file"),
  async (req, res) => {
    const cfg = getCloudinaryConfig();

    if (!cfg.ready) {
      res.status(500).json({
        error:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Replit Secrets.",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    cloudinary.config({
      cloud_name: cfg.cloudName,
      api_key: cfg.apiKey,
      api_secret: cfg.apiSecret,
    });

    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "bagbreez",
            resource_type: "image",
            quality: "auto",
            fetch_format: "auto",
          },
          (err, result) => (err ? reject(err) : resolve(result))
        );

        stream.end(req.file.buffer);
      });

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (err) {
      console.error("[UPLOAD] Cloudinary error:", err.message);
      res.status(500).json({
        error: "Upload failed: " + err.message,
      });
    }
  }
);

export default router;