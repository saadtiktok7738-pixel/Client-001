import React from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { ProductCard } from "../ui/ProductCard.jsx";
import { useData } from "../contexts/DataContext.jsx";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const query = searchParams.get("q") || "";
  const { products } = useData();

  const results = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
     <Helmet>
      <title>
        Search {query ? `"${query}"` : ""} | Bag Breez
      </title>

      <meta
        name="description"
        content={`Search results for ${query}. ${results.length} products found on Bag Breez.`}
      />

      <meta
        name="keywords"
        content={`search, ${query}, Bag Breez, online shopping, products`}
      />

      {/* Open Graph */}
      <meta property="og:title" content={`Search ${query} | Bag Breez`} />
      <meta
        property="og:description"
        content={`Find products matching ${query} on Bag Breez.`}
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bag Breez" />

      {/* Twitter */}
      <meta name="twitter:title" content={`Search ${query} | Bag Breez`} />
      <meta
        name="twitter:description"
        content={`Search results for ${query} on Bag Breez.`}
      />
    </Helmet>
    <Layout>
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {results.length} results for "{query}"
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-lg border border-dashed">
            <h3 className="text-xl font-bold mb-2">
              No exact matches found
            </h3>
            <p className="text-muted-foreground">
              Try searching with different keywords.
            </p>
          </div>
        )}
      </div>
    </Layout>
    </>
  );
}