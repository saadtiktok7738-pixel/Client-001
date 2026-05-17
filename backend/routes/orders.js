import { Router } from "express";
import Order from "../models/Order.js";
import { adminMiddleware, authMiddleware, optionalAuth } from "../middleware/auth.js";
import { nanoid } from "nanoid";
import {
  sendAdminOrderEmail,
  sendStatusUpdateEmail,
  sendShippingTrackingEmail,
} from "../services/emailService.js";
 
const router = Router();
 
function getBrevo() {
  return process.env.BREVO_API_KEY || null;
}
 
function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "info.bagbreez@gmail.com";
}
 
// Public: create order (guests and logged-in users)
router.post("/orders", (req, res, next) => optionalAuth(req, res, next), async (req, res) => {
  try {
    const { name, email, phone, address, city, items, subtotal, total } = req.body;
 
    if (!name?.trim()) { res.status(400).json({ error: "Customer name is required" }); return; }
    if (!email?.trim()) { res.status(400).json({ error: "Email address is required" }); return; }
    if (!phone?.trim()) { res.status(400).json({ error: "Phone number is required" }); return; }
    if (!address?.trim()) { res.status(400).json({ error: "Delivery address is required" }); return; }
    if (!city?.trim()) { res.status(400).json({ error: "City is required" }); return; }
    if (!Array.isArray(items) || items.length === 0) { res.status(400).json({ error: "Order must contain at least one item" }); return; }
    if (typeof subtotal !== "number" || isNaN(subtotal) || subtotal < 0) { res.status(400).json({ error: "Invalid order subtotal" }); return; }
    if (typeof total !== "number" || isNaN(total) || total < 0) { res.status(400).json({ error: "Invalid order total" }); return; }
 
    const shortId = nanoid(8).toUpperCase();
    const orderId = `ORD-${Date.now()}-${nanoid(4).toUpperCase()}`;
 
    const order = await Order.create({
      ...req.body,
      userId: req.user?.id || null,
      shortId,
      orderId,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
 
    const orderObj = { ...order.toObject(), id: String(order._id) };
 
    // Send admin notification email only — customer gets no confirmation on order creation
    const apiKey = getBrevo();
    if (apiKey) {
      sendAdminOrderEmail(apiKey, getAdminEmail(), orderObj).catch((e) =>
        console.error("[EMAIL] Admin order email failed:", e.message)
      );
    }
 
    res.status(201).json(orderObj);
  } catch (err) {
    console.error("[ORDER CREATE ERROR]", err);
    const message = err?.code === 11000
      ? "Duplicate order detected — please try again"
      : err?.message || "Failed to save order";
    res.status(500).json({ error: message });
  }
});
 
// Public: track order
router.get("/orders/track", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) { res.status(400).json({ error: "Order ID required" }); return; }
 
    const q = String(id).trim().toUpperCase();
    const order = await Order.findOne({
      $or: [
        { orderId: { $regex: q, $options: "i" } },
        { shortId: { $regex: q, $options: "i" } },
      ],
    });
 
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json({ ...order.toObject(), id: String(order._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// Auth: my orders
router.get("/orders/my", (req, res, next) => authMiddleware(req, res, next), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders.map((o) => ({ ...o.toObject(), id: String(o._id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// Admin: all orders
router.get("/orders", (req, res, next) => adminMiddleware(req, res, next), async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map((o) => ({ ...o.toObject(), id: String(o._id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// Admin: update status
// Sends status email for all statuses EXCEPT "shipped" (shipping email is sent only when PostEx tracking is assigned)
router.patch("/orders/:id/status", (req, res, next) => adminMiddleware(req, res, next), async (req, res) => {
  try {
    const newStatus = req.body.status;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: newStatus, updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
 
    // Only send customer email when order is cancelled — all other status changes are silent.
    // Shipping/tracking emails are handled separately by the tracking assignment endpoint.
    const apiKey = getBrevo();
    const status = newStatus?.toLowerCase();
    if (apiKey && order.email && (status === "cancelled" || status === "canceled")) {
      const orderObj = { ...order.toObject(), id: String(order._id) };
      sendStatusUpdateEmail(apiKey, orderObj, newStatus).catch((e) =>
        console.error("[EMAIL] Cancellation email failed:", e.message)
      );
    }
 
    res.json({ ...order.toObject(), id: String(order._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// Admin: update tracking (manual — triggers shipping email)
router.patch("/orders/:id/tracking", (req, res, next) => adminMiddleware(req, res, next), async (req, res) => {
  try {
    const { courier, trackingId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { courier, trackingId, updatedAt: new Date().toISOString() },
      { new: true }
    );
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
 
    // Send shipping email with tracking info
    const apiKey = getBrevo();
    if (apiKey && order.email && trackingId) {
      const orderObj = { ...order.toObject(), id: String(order._id) };
      sendShippingTrackingEmail(apiKey, orderObj, String(trackingId)).catch((e) =>
        console.error("[EMAIL] Shipping tracking email failed:", e.message)
      );
    }
 
    res.json({ ...order.toObject(), id: String(order._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// Admin: full edit order
router.put("/orders/:id", (req, res, next) => adminMiddleware(req, res, next), async (req, res) => {
  try {
    const { name, email, phone, address, city, note, items, status } = req.body;
    const update = { updatedAt: new Date().toISOString() };
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;
    if (city !== undefined) update.city = city;
    if (note !== undefined) update.note = note;
    if (status !== undefined) update.status = status;
    if (items !== undefined) {
      update.items = items;
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      update.subtotal = subtotal;
      const order = await Order.findById(req.params.id);
      update.total = subtotal + (order?.shipping ?? 0);
    }
 
    const updated = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...updated.toObject(), id: String(updated._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// Admin: send selected orders to PostEx with strict batch validation (all-or-nothing)
router.post("/orders/postex", (req, res, next) => adminMiddleware(req, res, next), async (req, res) => {
  const POSTEX_TOKEN = process.env.POSTEX_TOKEN;
  if (!POSTEX_TOKEN) {
    res.status(500).json({ error: "POSTEX_TOKEN secret is not configured. Add it in Replit Secrets." });
    return;
  }
  const PICKUP_ADDRESS_CODE = (process.env.POSTEX_PICKUP_CODE || "").trim();
  const STORE_ADDRESS_CODE  = (process.env.POSTEX_RETURN_CODE  || "").trim();
 
  // Log active config on every request — visible in backend console for debugging
  console.log("[POSTEX] Config —", {
    pickupAddressCode: PICKUP_ADDRESS_CODE || "(not set — will use merchant default)",
    storeAddressCode:  STORE_ADDRESS_CODE  || "(not set — will use merchant default)",
  });
 
  const { orderIds } = req.body;
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400).json({ error: "orderIds array is required" });
    return;
  }
 
  // --- Phase 1: Load and validate ALL orders before sending anything ---
  const validationErrors = [];
  const ordersToSend = [];
 
  for (const orderId of orderIds) {
    const order = await Order.findById(orderId);
 
    if (!order) {
      validationErrors.push({ orderId, shortId: orderId, errorType: "Order not found" });
      continue;
    }
 
    const shortId = (order.shortId || order.orderId || orderId).toUpperCase();
 
    if (order.trackingId) {
      validationErrors.push({ orderId, shortId, errorType: `Already submitted — tracking: ${order.trackingId}` });
      continue;
    }
    if (!order.name?.trim()) {
      validationErrors.push({ orderId, shortId, errorType: "Customer name is missing" });
      continue;
    }
    if (!order.phone?.trim()) {
      validationErrors.push({ orderId, shortId, errorType: "Phone number is missing" });
      continue;
    }
    if (!order.address?.trim()) {
      validationErrors.push({ orderId, shortId, errorType: "Delivery address is missing" });
      continue;
    }
    if (!order.city?.trim()) {
      validationErrors.push({ orderId, shortId, errorType: "City is missing" });
      continue;
    }
    if (!order.total || order.total <= 0) {
      validationErrors.push({ orderId, shortId, errorType: "Order total is invalid" });
      continue;
    }
 
    const phoneDigits = order.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      validationErrors.push({ orderId, shortId, errorType: `Invalid phone number: ${order.phone}` });
      continue;
    }
 
    const rawRemarks = order.items
      .map((i) => `${i.quantity}x ${i.name}${i.color ? ` (${i.color})` : ""}`)
      .join(", ");
    const orderDetail = rawRemarks.length > 500 ? rawRemarks.slice(0, 497) + "..." : rawRemarks;
 
    const itemCount = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
 
    const payload = {
      orderRefNumber:  order.shortId || order.orderId,
      orderType:       "Normal",
      invoicePayment:  order.total,
      invoiceDivision: 1,
      items:           itemCount,
      customerName:    order.name.trim(),
      customerPhone:   order.phone.trim(),
      deliveryAddress: order.address.trim(),
      cityName:        order.city.trim(),
      orderDetail,
    };
 
    // PostEx requires at least one of pickupAddressCode / storeAddressCode.
    // Only pickupAddressCode is sent — storeAddressCode is omitted because no Store Address
    // is registered in the PostEx portal (sending an invalid store code causes rejection).
    if (PICKUP_ADDRESS_CODE) payload.pickupAddressCode = PICKUP_ADDRESS_CODE;
 
    ordersToSend.push({ order, payload });
  }
 
  // If ANY order failed validation, stop the entire batch — send nothing
  if (validationErrors.length > 0) {
    res.status(400).json({
      error: "Batch validation failed — no orders were sent to PostEx",
      validationErrors,
    });
    return;
  }
 
  // --- Phase 2: All orders valid — send all to PostEx ---
  const results = [];
  const apiKey = getBrevo();
 
  for (const { order, payload } of ordersToSend) {
    const orderId = String(order._id);
    try {
      // Log the exact payload being sent — field names must match PostEx API v3 spec exactly
      console.log(`[POSTEX] Sending order ${order.shortId} →`, JSON.stringify(payload, null, 2));
 
      const postexRes = await fetch("https://api.postex.pk/services/integration/api/order/v3/create-order", {
        method: "POST",
        headers: {
          "token": POSTEX_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
 
      const postexData = await postexRes.json();
 
      // Log the complete raw PostEx response for every call — success or failure
      console.log(`[POSTEX] Response HTTP ${postexRes.status} for order ${order.shortId} →`, JSON.stringify(postexData, null, 2));
 
      const isSuccess = (postexData?.statusCode === "200" || postexData?.statusCode === 200);
      const trackingNumber = postexData?.dist?.trackingNumber || postexData?.data?.trackingNumber;
 
      if (isSuccess && trackingNumber) {
        const trackingStr = String(trackingNumber);
 
        // Use orderId directly — ensures tracking saves to the CORRECT order only
        await Order.findByIdAndUpdate(orderId, {
          courier: "PostEx",
          trackingId: trackingStr,
          status: "shipped",
          updatedAt: new Date().toISOString(),
        });
 
        results.push({ orderId, success: true, trackingNumber: trackingStr });
 
        // Send shipping email with tracking (fire-and-forget)
        if (apiKey && order.email) {
          const updatedOrder = { ...order.toObject(), id: orderId, status: "shipped", courier: "PostEx", trackingId: trackingStr };
          sendShippingTrackingEmail(apiKey, updatedOrder, trackingStr).catch((e) =>
            console.error("[EMAIL] PostEx shipping email failed:", e.message)
          );
        }
      } else {
        const postexMsg = (postexData?.statusMessage || postexData?.message || postexData?.error || `HTTP ${postexRes.status}`).toUpperCase();
        console.error(`[POSTEX] FAILED order ${order.shortId}: ${postexMsg}`);
 
        // Build a diagnostic error that tells exactly which secret/code to fix
        let errMsg = postexMsg;
 
        if (postexMsg.includes("STORE ADDRESS CODE") || postexMsg.includes("INVALID MERCHANT STORE")) {
          errMsg = `${postexMsg} — storeAddressCode sent: "${payload.storeAddressCode ?? "(none)"}". `
            + `Fix: go to PostEx portal → Settings → Store Addresses, copy the exact Code value, `
            + `then update the POSTEX_RETURN_CODE secret in Replit to that exact value. `
            + `If you have no Store Addresses registered in PostEx, clear the POSTEX_RETURN_CODE secret entirely.`;
        } else if (postexMsg.includes("PICKUP ADDRESS CODE") || postexMsg.includes("INVALID MERCHANT PICKUP")) {
          errMsg = `${postexMsg} — pickupAddressCode sent: "${payload.pickupAddressCode ?? "(none)"}". `
            + `Fix: go to PostEx portal → Settings → Pickup Addresses, copy the exact Code value, `
            + `then update the POSTEX_PICKUP_CODE secret in Replit to that exact value.`;
        }
 
        results.push({
          orderId,
          success: false,
          error: errMsg,
          postexResponse: postexData,
        });
      }
    } catch (err) {
      console.error(`[POSTEX] Network/parse error for order ${order.shortId}:`, err.message);
      results.push({ orderId, success: false, error: err.message });
    }
  }
 
  res.json({ results });
});
 
// Admin: delete order
router.delete("/orders/:id", (req, res, next) => adminMiddleware(req, res, next), async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
export default router;
 