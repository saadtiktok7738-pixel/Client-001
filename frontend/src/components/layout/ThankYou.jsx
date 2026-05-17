import React from "react";
import { Link } from "wouter";
import { CheckCircle2, Package, User, Search } from "lucide-react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Helmet } from "react-helmet-async";

export default function ThankYou() {
  const { user } = useAuth();

  // Read orderId from ?orderId=... query param
  const orderId = new URLSearchParams(window.location.search).get(
    "orderId"
  );

  return (
    <>
     <Helmet>
      <title>Order Confirmed | Bag Breez</title>

      <meta
        name="description"
        content="Thank you for your order. Your purchase has been placed successfully at Bag Breez."
      />

      <meta
        name="keywords"
        content="order confirmed, thank you, Bag Breez, order success, ecommerce Pakistan"
      />

      <meta property="og:title" content="Order Confirmed | Bag Breez" />
      <meta
        property="og:description"
        content="Your order has been placed successfully on Bag Breez."
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bag Breez" />

      <meta name="twitter:title" content="Order Confirmed | Bag Breez" />
      <meta
        name="twitter:description"
        content="Thank you for shopping with Bag Breez."
      />
    </Helmet>
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
            <CheckCircle2
              className="h-9 w-9 text-accent"
              strokeWidth={2.2}
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            Thank you for your order!
          </h1>

          <p className="text-sm md:text-base text-muted-foreground mb-8">
            Your order has been placed successfully. Our team will contact you
            shortly to confirm.
          </p>

          {/* Track Order box — shown when orderId is available */}
          {orderId && (
            <div className="bg-accent/10 border border-accent/25 p-5 md:p-6 mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Your Order ID
              </p>

              <p className="font-mono font-bold text-base mb-4">
                #{(orderId.length <= 10 ? orderId : orderId.slice(0, 8)).toUpperCase()}
              </p>

              <Link
                href={`/track?orderId=${orderId}`}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
                data-testid="link-track-order"
              >
                <Search size={15} /> Track This Order
              </Link>
            </div>
          )}

          {user ? (
            <div className="bg-muted/40 border p-5 md:p-6">
              <p className="text-sm md:text-base mb-4">
                Visit your profile to view all your orders.
              </p>

              <Link
                href="/profile"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-black/85 transition-colors"
                data-testid="link-go-to-profile"
              >
                <User size={16} /> Go to Profile
              </Link>
            </div>
          ) : (
            <div className="bg-muted/40 border p-5 md:p-6">
              <p className="text-sm md:text-base mb-4">
                Sign in to manage your orders from your account.
              </p>

              <Link
                href="/signin"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-black/85 transition-colors"
                data-testid="link-sign-in-thankyou"
              >
                <Package size={16} /> Sign In
              </Link>

              <p className="text-[11px] md:text-xs text-muted-foreground mt-3">
                Once you sign in, this order will be linked to your account
                automatically.
              </p>
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground underline hover:text-foreground"
              data-testid="link-continue-shopping"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
    </>
  );
}