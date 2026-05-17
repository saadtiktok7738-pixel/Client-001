import React from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { ProductCard } from "../ui/ProductCard.jsx";
import { useData } from "../contexts/DataContext.jsx";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";

export default function Wishlist() {
  const { wishlist } = useCart();
  const { products } = useData();

  const wishedProducts = products.filter((p) =>
    wishlist.includes(p.id)
  );

  return (
    <>
     <Helmet>
      <title>Wishlist | Bag Breez</title>

      <meta
        name="description"
        content="View and manage your saved products in your wishlist on Bag Breez."
      />

      <meta
        name="keywords"
        content="wishlist, saved items, favorites, Bag Breez, online shopping wishlist"
      />

      {/* Open Graph */}
      <meta property="og:title" content="Wishlist | Bag Breez" />
      <meta
        property="og:description"
        content="Your saved favorite products on Bag Breez."
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bag Breez" />

      {/* Twitter */}
      <meta name="twitter:title" content="Wishlist | Bag Breez" />
      <meta
        name="twitter:description"
        content="View your wishlist on Bag Breez."
      />
    </Helmet>
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-16">
        {wishedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {wishedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Heart
              size={64}
              className="mx-auto text-muted-foreground/30 mb-6"
            />
            <h3 className="text-2xl font-bold mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-muted-foreground mb-8">
              Save items you love to find them later.
            </p>
            <Link
              href="/catalog"
              className="bg-black text-white px-8 py-3 rounded-md font-bold hover:bg-black/90 transition-colors"
            >
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </Layout>
    </>
  );
}