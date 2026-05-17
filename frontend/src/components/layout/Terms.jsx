import React from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <>
    <Helmet>
      <title>Terms & Services | Bag Breez</title>

      <meta
        name="description"
        content="Read the terms and services of Bag Breez. Understand the rules, conditions, and policies for using our website and services."
      />

      <meta
        name="keywords"
        content="terms and conditions, terms of service, Bag Breez, legal, policies"
      />

      {/* Open Graph */}
      <meta property="og:title" content="Terms & Services | Bag Breez" />
      <meta
        property="og:description"
        content="Terms and conditions for using Bag Breez website and services."
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bag Breez" />

      {/* Twitter */}
      <meta name="twitter:title" content="Terms & Services | Bag Breez" />
      <meta
        name="twitter:description"
        content="Read the terms and services of Bag Breez."
      />
    </Helmet>
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: January 2025
        </p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-bold text-base mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing and using the MSLAL website, you agree to be bound
              by these Terms of Service. If you do not agree to any part of
              these terms, you may not use our website or services. We reserve
              the right to update these terms at any time, and continued use of
              the site constitutes your acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">2. Use of Website</h2>
            <p className="text-muted-foreground">
              This website is intended for personal, non-commercial use only.
              You may not use the site to engage in any unlawful activity,
              attempt to gain unauthorized access to any part of the site, or
              interfere with its normal operation. Any misuse may result in
              immediate account termination and legal action if necessary.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">
              3. Orders and Payments
            </h2>
            <p className="text-muted-foreground">
              By placing an order, you confirm that all information provided is
              accurate and complete. All orders are subject to acceptance and
              availability. We reserve the right to refuse or cancel any order
              at our discretion. Prices displayed on the website are in
              Pakistani Rupees (PKR) and are subject to change without notice.
              Currently, we accept Cash on Delivery (COD) as the payment method.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">
              4. Product Information
            </h2>
            <p className="text-muted-foreground">
              We make every effort to display product colors, sizes, and
              descriptions as accurately as possible. However, we cannot
              guarantee that your device's display will accurately reflect the
              actual product. Slight variations in color or texture are not
              considered defects. If you receive an item that significantly
              differs from its description, please contact us within 48 hours of
              delivery.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">
              5. Intellectual Property
            </h2>
            <p className="text-muted-foreground">
              All content on this website, including text, images, logos, and
              design, is the property of MSLAL and is protected by applicable
              intellectual property laws. You may not reproduce, distribute, or
              use any content without our written permission.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">
              6. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              MSLAL shall not be liable for any indirect, incidental, or
              consequential damages arising from the use of this website or its
              products. Our maximum liability shall not exceed the amount you
              paid for the specific order in question. We are not responsible
              for delivery delays caused by courier services or circumstances
              beyond our control.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">7. Contact</h2>
            <p className="text-muted-foreground">
              For any questions regarding these Terms of Service, please
              contact us at hello@mslal.pk or call +92 300 1234567.
            </p>
          </section>
        </div>
      </div>
    </Layout>
    </>
  );
}