const SENDER_EMAIL = "info.bagbreez@gmail.com";
const SENDER_NAME = "Bag Breez";
const FOOTER = `Al Sheikh Market, Street No 15, Sector I-10/1, Islamabad &nbsp;|&nbsp; 03355111558`;

async function sendEmail(apiKey, to, subject, htmlContent) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      replyTo: { email: SENDER_EMAIL },
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${errText}`);
  }
  return res.json();
}

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Bag Breez</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">Bag Breez</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;border-top:1px solid #eeeeee;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">${FOOTER}</p>
              <p style="margin:6px 0 0;font-size:11px;color:#bbbbbb;">&copy; ${new Date().getFullYear()} Bag Breez. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function orderItemsTable(items) {
  const rows = items.map((i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">
        ${i.name}${i.color ? ` <span style="color:#888;font-size:12px;">(${i.color})</span>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#555;text-align:center;">×${i.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111;font-weight:600;text-align:right;">Rs. ${(i.price * i.quantity).toLocaleString()}</td>
    </tr>
  `).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;text-align:left;border-bottom:2px solid #eeeeee;">Item</th>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;text-align:center;border-bottom:2px solid #eeeeee;">Qty</th>
          <th style="padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;text-align:right;border-bottom:2px solid #eeeeee;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function badge(status) {
  const colors = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };

  const bg = colors[status?.toLowerCase()] || "#6b7280";

  return `<span style="display:inline-block;padding:4px 14px;border-radius:100px;background:${bg};color:#fff;font-size:12px;font-weight:600;text-transform:capitalize;letter-spacing:0.5px;">${status}</span>`;
}

async function sendAdminOrderEmail(apiKey, adminEmail, order) {
  const shortId = (order.shortId || order.orderId || order.id || "").slice(0, 8).toUpperCase();

  const html = baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:22px;color:#111;font-weight:700;">New Order Received</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#888;">A new order has been placed on your store.</p>

    <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;width:40%;">Order ID</td>
          <td style="padding:6px 0;font-size:13px;color:#111;font-weight:700;font-family:monospace;">#${shortId}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">Customer</td>
          <td style="padding:6px 0;font-size:13px;color:#111;font-weight:600;">${order.name}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">Phone</td>
          <td style="padding:6px 0;font-size:13px;color:#111;">${order.phone}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">City</td>
          <td style="padding:6px 0;font-size:13px;color:#111;">${order.city}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">Address</td>
          <td style="padding:6px 0;font-size:13px;color:#111;">${order.address}</td>
        </tr>
      </table>
    </div>

    ${order.items?.length ? orderItemsTable(order.items) : ""}

    <div style="margin-top:16px;padding-top:16px;border-top:2px solid #111;display:flex;justify-content:space-between;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:16px;font-weight:700;color:#111;">Total Amount</td>
          <td style="font-size:18px;font-weight:700;color:#111;text-align:right;">Rs. ${(order.total || 0).toLocaleString()}</td>
        </tr>
      </table>
    </div>
  `);

  return sendEmail(apiKey, adminEmail, `🛍️ New Order #${shortId} — ${order.name}`, html);
}

async function sendCustomerOrderConfirmEmail(apiKey, order) {
  const shortId = (order.shortId || order.orderId || order.id || "").slice(0, 8).toUpperCase();

  const html = baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:22px;color:#111;font-weight:700;">Order Confirmed! 🎉</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Hi <strong>${order.name}</strong>, thank you for shopping with Bag Breez. Your order has been placed successfully and our team will contact you shortly to confirm.</p>

    <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;width:40%;">Order ID</td>
          <td style="padding:6px 0;font-size:13px;color:#111;font-weight:700;font-family:monospace;">#${shortId}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">Delivery City</td>
          <td style="padding:6px 0;font-size:13px;color:#111;">${order.city}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">Payment Method</td>
          <td style="padding:6px 0;font-size:13px;color:#111;">Cash on Delivery (COD)</td>
        </tr>
      </table>
    </div>

    ${order.items?.length ? orderItemsTable(order.items) : ""}

    <div style="margin-top:16px;padding-top:16px;border-top:2px solid #111;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#555;padding:4px 0;">Subtotal</td>
          <td style="font-size:13px;color:#111;text-align:right;">Rs. ${(order.subtotal || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#555;padding:4px 0;">Shipping</td>
          <td style="font-size:13px;color:#111;text-align:right;">${(order.shipping || 0) === 0 ? "Free" : `Rs. ${(order.shipping || 0).toLocaleString()}`}</td>
        </tr>
        <tr>
          <td style="font-size:16px;font-weight:700;color:#111;padding-top:10px;">Total</td>
          <td style="font-size:18px;font-weight:700;color:#111;text-align:right;padding-top:10px;">Rs. ${(order.total || 0).toLocaleString()}</td>
        </tr>
      </table>
    </div>
  `);

  return sendEmail(apiKey, order.email, `✅ Order Confirmed #${shortId} — Bag Breez`, html);
}

async function sendStatusUpdateEmail(apiKey, order, newStatus) {
  const shortId = (order.shortId || order.orderId || order.id || "").slice(0, 8).toUpperCase();

  const html = baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:22px;color:#111;font-weight:700;">Order Update</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Hi <strong>${order.name}</strong>, your order status has been updated.</p>

    <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;width:40%;">Order ID</td>
          <td style="padding:6px 0;font-size:13px;color:#111;font-weight:700;font-family:monospace;">#${shortId}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">New Status</td>
          <td style="padding:6px 0;">${badge(newStatus)}</td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#555;margin:0;">If you have any questions about your order, please contact us.</p>
  `);

  return sendEmail(apiKey, order.email, `Your Bag Breez Order #${shortId} — Status Update`, html);
}

async function sendShippingTrackingEmail(apiKey, order, trackingId) {
  const shortId = (order.shortId || order.orderId || order.id || "").slice(0, 8).toUpperCase();

  const html = baseTemplate(`
    <h2 style="margin:0 0 4px;font-size:22px;color:#111;font-weight:700;">Your Order Has Shipped! 📦</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Hi <strong>${order.name}</strong>, great news! Your order is on its way.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;width:40%;">Order ID</td>
          <td style="padding:6px 0;font-size:13px;color:#111;font-weight:700;font-family:monospace;">#${shortId}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">Status</td>
          <td style="padding:6px 0;">${badge("shipped")}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">Courier Company</td>
          <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111;">PostEx</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#555;">Tracking ID</td>
          <td style="padding:6px 0;">
            <span style="font-family:monospace;font-size:16px;font-weight:700;color:#111;background:#e8f5e9;padding:4px 10px;border-radius:4px;letter-spacing:1px;">${trackingId}</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#555;margin:0 0 8px;">Use your tracking ID on the <strong>PostEx</strong> website or app to follow your shipment in real time.</p>
    <p style="font-size:14px;color:#555;margin:0;">Thank you for shopping with Bag Breez!</p>
  `);

  return sendEmail(apiKey, order.email, `📦 Your Bag Breez Order #${shortId} Has Shipped!`, html);
}

export {
  sendAdminOrderEmail,
  sendCustomerOrderConfirmEmail,
  sendStatusUpdateEmail,
  sendShippingTrackingEmail,
};