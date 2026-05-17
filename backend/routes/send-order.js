import { Router } from "express";
import {
  sendAdminOrderEmail,
  sendCustomerOrderConfirmEmail,
  sendStatusUpdateEmail,
  sendShippingTrackingEmail,
} from "../services/emailService.js";

const router = Router();

// Legacy endpoint — kept for backward compatibility.
// Primary email sending now happens internally from orders.ts routes.
router.post("/send-order", async (req, res) => {
  const { type, order, customerEmail } = req.body ?? {};

  if (!type || !order) {
    res.status(400).json({ error: "Missing required fields: type, order" });
    return;
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const ADMIN_EMAIL =
    process.env.ADMIN_EMAIL || "info.bagbreez@gmail.com";

  if (!BREVO_API_KEY) {
    req.log.warn("BREVO_API_KEY is not set — skipping email");
    res.json({ success: true, skipped: true });
    return;
  }

  const orderData = customerEmail
    ? { ...order, email: customerEmail }
    : order;

  try {
    if (type === "order-placed") {
      await sendAdminOrderEmail(
        BREVO_API_KEY,
        ADMIN_EMAIL,
        orderData
      );
    } else if (type === "customer-order-placed") {
      if (!customerEmail) {
        res.status(400).json({
          error: "customerEmail required",
        });
        return;
      }

      await sendCustomerOrderConfirmEmail(
        BREVO_API_KEY,
        orderData
      );
    } else if (type === "status-update") {
      if (!customerEmail) {
        res.status(400).json({
          error: "customerEmail required",
        });
        return;
      }

      await sendStatusUpdateEmail(
        BREVO_API_KEY,
        orderData,
        order.status
      );
    } else if (type === "tracking-added") {
      if (!customerEmail) {
        res.status(400).json({
          error: "customerEmail required",
        });
        return;
      }

      await sendShippingTrackingEmail(
        BREVO_API_KEY,
        orderData,
        order.trackingId
      );
    } else {
      res.status(400).json({
        error: `Unknown email type: ${type}`,
      });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to send email");
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;