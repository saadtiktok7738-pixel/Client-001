import React from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { ProductCard } from "../ui/ProductCard.jsx";
import { useData } from "../contexts/DataContext.jsx";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";

export default function Catalog() {
  const { products, categories } = useData();
  const [filter, setFilter] = React.useState(null);
  const [sort, setSort] = React.useState("featured");

  const filteredProducts = products.filter(
    (p) => !filter || p.category.toLowerCase() === filter
  );
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0; // featured
  });

  return (
    <>
    <Helmet>
        {/* Basic SEO */}
        <title>Catalog | Bag Breez - Premium Fashion Collection</title>
        <meta
          name="description"
          content="Browse the full catalog at Bag Breez. Discover premium clothing, latest fashion trends, and lifestyle products with fast delivery across Pakistan."
        />
        <meta
          name="keywords"
          content="Bag Breez catalog, online fashion Pakistan, clothing collection, buy clothes online, lifestyle products"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Catalog | Bag Breez" />
        <meta
          property="og:description"
          content="Explore the full fashion catalog at Bag Breez. Premium clothing and lifestyle products available online."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Bag Breez" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Catalog | Bag Breez" />
        <meta
          name="twitter:description"
          content="Browse premium fashion collection at Bag Breez."
        />
      </Helmet>
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters — hidden on mobile */}
        <aside className="hidden md:block w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="font-bold uppercase tracking-wider mb-4 border-b pb-2">
              Categories
            </h3>

            <ul className="space-y-2 mb-8">
              <li>
                <button
                  onClick={() => setFilter(null)}
                  className={`text-sm ${
                    !filter
                      ? "font-bold text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Products
                </button>
              </li>

              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setFilter(cat.slug)}
                    className={`text-sm ${
                      filter === cat.slug
                        ? "font-bold text-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <span className="text-sm text-muted-foreground">
              Showing {sortedProducts.length} products
            </span>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border px-3 py-1.5 outline-none focus:border-accent bg-transparent"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-lg border border-dashed">
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try changing your filters.
              </p>
              <button
                onClick={() => setFilter(null)}
                className="text-accent underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
    </>
  );
}