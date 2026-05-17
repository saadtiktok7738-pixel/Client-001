import { Link } from "wouter";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { Home, SearchX } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <>
    <Helmet>
  <title>Page Not Found | Bag Breez</title>

  <meta
    name="description"
    content="The page you are looking for does not exist on Bag Breez. Please check the URL or return to homepage."
  />

  {/* IMPORTANT: prevent indexing of 404 pages */}
  <meta name="robots" content="noindex, nofollow" />

  {/* Open Graph */}
  <meta property="og:title" content="Page Not Found | Bag Breez" />
  <meta
    property="og:description"
    content="This page does not exist on Bag Breez."
  />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Bag Breez" />

  {/* Twitter */}
  <meta name="twitter:title" content="Page Not Found | Bag Breez" />
  <meta
    name="twitter:description"
    content="This page does not exist on Bag Breez."
  />
</Helmet>
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <SearchX
          size={56}
          className="text-muted-foreground/30 mb-6"
          strokeWidth={1.5}
        />

        <h1 className="text-6xl font-black tracking-tight mb-3">404</h1>

        <h2 className="text-xl font-bold mb-3">Page Not Found</h2>

        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-foreground/85 transition-colors"
        >
          <Home size={16} /> Go to Home
        </Link>
      </div>
    </Layout>
    </>
  );
}