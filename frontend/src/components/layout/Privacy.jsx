import React from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { Helmet } from "react-helmet-async";

export default function Privacy() {
  return (
    <>
    <Helmet>
  <title>Privacy Policy | Xclusive Shop</title>

  <meta
    name="description"
    content="Read the Privacy Policy of Xclusive Shop to understand how we collect, use, and protect your personal information."
  />
  <meta
    name="keywords"
    content="privacy policy, Xclusive Shop privacy, data protection, user information, terms"
  />

  {/* Open Graph */}
  <meta property="og:title" content="Privacy Policy | Xclusive Shop" />
  <meta
    property="og:description"
    content="Learn how Xclusive Shop handles your personal data and privacy."
  />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Xclusive Shop" />

  {/* Twitter */}
  <meta name="twitter:title" content="Privacy Policy | Xclusive Shop" />
  <meta
    name="twitter:description"
    content="Read Xclusive Shop privacy policy and data usage details."
  />
</Helmet>
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: January 2025</p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-bold text-base mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              When you place an order or create an account on MSLAL, we collect personal information such as your
              full name, email address, phone number, and shipping address. We also collect information about
              your purchases, browsing activity on our site, and any communications you have with us.
              This information is used solely to fulfill your orders and improve your shopping experience.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              Your information is used to process and deliver your orders, send order confirmations and updates,
              respond to customer service requests, and improve our products and website. We do not sell, trade,
              or rent your personal information to third parties. We may share your data with courier services
              strictly for delivery purposes.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">3. Data Security</h2>
            <p className="text-muted-foreground">
              We take reasonable steps to protect your personal information from unauthorized access, loss, or
              misuse. Your account is secured through Google authentication, which uses industry-standard
              encryption. However, no method of transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">4. Cookies</h2>
            <p className="text-muted-foreground">
              Our website uses cookies to keep you signed in and to remember your cart and preferences between
              visits. These are essential cookies required for the site to function correctly. We do not use
              third-party advertising cookies or tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You may request to view, update, or delete your personal data at any time by contacting us at
              info.bagbreez@gmail.com. We will respond to all such requests within 7 business days. You may also
              delete your account directly from your profile page, which will remove your stored data.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-3">6. Contact</h2>
            <p className="text-muted-foreground">
              If you have any questions or concerns about this Privacy Policy, please contact us at
              info.bagbreez@gmail.com or call 03355111558.
            </p>
          </section>
        </div>
      </div>
    </Layout>
    </>
  );
}