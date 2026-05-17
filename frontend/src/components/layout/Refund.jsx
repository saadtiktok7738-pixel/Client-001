import React from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { Helmet } from "react-helmet-async";

export default function Refund() {
  return (
    <>
    <Helmet>
      <title>Refund Policy | Bag Breez</title>

      <meta
        name="description"
        content="Read the refund and return policy of Bag Breez. Learn how returns, refunds, and exchanges are handled."
      />

      <meta
        name="keywords"
        content="refund policy, return policy, Bag Breez, refunds Pakistan, online shopping returns"
      />

      {/* Open Graph */}
      <meta property="og:title" content="Refund Policy | Bag Breez" />
      <meta
        property="og:description"
        content="Understand how refunds and returns work at Bag Breez."
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bag Breez" />

      {/* Twitter */}
      <meta name="twitter:title" content="Refund Policy | Bag Breez" />
      <meta
        name="twitter:description"
        content="Refund and return policy details of Bag Breez."
      />
    </Helmet>
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: January 2025
        </p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-foreground/90">

          <section>
            <h2 className="font-bold text-base mb-3">1. Return Window</h2>
            <p className="text-muted-foreground">
              We offer a 7-day return policy from the date of delivery. If 7 days have passed since your item
              was delivered, unfortunately we cannot offer a refund or exchange. To be eligible, you must contact
              us within this window with your order details and reason for return.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">2. Eligibility Conditions</h2>
            <p className="text-muted-foreground">
              To be eligible for a return, your item must be unused, unwashed, and in the same condition you
              received it. Items must have all original tags attached and be returned in the original packaging.
              We do not accept returns on sale items, custom orders, or items that show signs of use, wash, or damage caused by the customer.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">3. How to Request a Return</h2>
            <p className="text-muted-foreground">
              To start a return, contact us at hello@mslal.pk or call +92 300 1234567 with your Order ID and
              the reason for return. Once your return is approved, we will provide instructions for shipping the
              item back to us. Return shipping costs are the responsibility of the customer unless the return is
              due to a defective or incorrect item.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">4. Refund Processing</h2>
            <p className="text-muted-foreground">
              Once we receive and inspect the returned item, we will notify you of the approval or rejection of
              your refund. Approved refunds are processed within 5–7 business days. Refunds are issued via
              bank transfer or the same payment method used at checkout, where applicable.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">5. Exchanges</h2>
            <p className="text-muted-foreground">
              We only replace items if they are defective or damaged upon delivery. If you need to exchange an
              item for the same product in a different size or color, contact us at hello@mslal.pk. Exchanges
              are subject to stock availability.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">6. Non-Returnable Items</h2>
            <p className="text-muted-foreground">
              The following items cannot be returned: sale or discounted items, gift cards, downloadable products,
              items marked as final sale, or items that have been altered or customized. If you are unsure whether
              your item qualifies, please contact us before initiating a return.
            </p>
          </section>

        </div>
      </div>
    </Layout>
    </>
  );
}