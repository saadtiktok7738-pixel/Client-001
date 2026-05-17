import React from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Contact() {
  return (
    <>
    <Helmet>
  <title>Contact Us | Bag Breez</title>

  <meta
    name="description"
    content="Get in touch with Bag Breez. Contact us for support, orders, and inquiries. We are available 24/7 to help you."
  />

  <meta
    name="keywords"
    content="contact Bag Breez, customer support, help, inquiry, Pakistan online store contact"
  />

  <meta property="og:title" content="Contact Us | Bag Breez" />
  <meta
    property="og:description"
    content="Reach out to Bag Breez for support and inquiries. We are here to help."
  />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Bag Breez" />

  <meta name="twitter:title" content="Contact Us | Bag Breez" />
  <meta
    name="twitter:description"
    content="Contact Bag Breez for support and inquiries."
  />
</Helmet>
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Contact Us</h1>

        <p className="text-muted-foreground text-sm md:text-base mb-10">
          We're here to help. Reach out through any of the channels below and our team will get back to you promptly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Phone size={16} className="text-accent" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">Phone</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Call or WhatsApp us anytime, we're available 24/7.
            </p>
            <a
              href="tel:+9203355111558"
              className="text-sm font-semibold hover:text-accent transition-colors"
            >
              03355111558
            </a>
          </div>

          <div className="border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={16} className="text-accent" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">Email</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Send us a message and we'll reply within 24 hours.
            </p>
            <a
              href="mailto:info.bagbreez@gmail.com"
              className="text-sm font-semibold hover:text-accent transition-colors"
            >
              info.bagbreez@gmail.com
            </a>
          </div>

          <div className="border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-accent" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">Location</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Visit our store during operating hours.
            </p>
            <p className="text-sm font-semibold">
              Al Sheikh Market, Street No 15, Sector I-10/1, Islamabad
            </p>
          </div>

          <div className="border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-accent" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">Business Hours</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Our team is available:
            </p>
            <p className="text-sm font-semibold">24/7 — Full Week</p>
            <p className="text-sm text-muted-foreground">No holidays, always open</p>
          </div>
        </div>

        <div className="bg-muted/50 border border-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={16} className="text-accent" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Support</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            For order tracking, cancellations, or exchange requests, please have your Order ID ready when you contact us.
            Our support team is available 24/7. For urgent matters, calling or WhatsApp is the fastest way to reach us.
          </p>
        </div>
      </div>
    </Layout>
    </>
  );
}
