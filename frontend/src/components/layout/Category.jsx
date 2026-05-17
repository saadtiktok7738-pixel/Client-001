import React from "react";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { ProductCard } from "../ui/ProductCard.jsx";
import { useData } from "../contexts/DataContext.jsx";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet-async";

export default function Category() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug;

  const { products: allProducts, categories } = useData();

  const category = categories.find(
    (c) => c.slug === slug
  );

  const products = allProducts.filter(
    (p) =>
      p.category.toLowerCase() ===
      (category?.name.toLowerCase() ?? slug?.toLowerCase())
  );

  if (!category) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <>
    <Helmet>
      <title>{category?.name ? `${category.name} - Shop Online in Pakistan | Bag Breez` : "Categories | Bag Breez"}</title>
      <meta name="description" content={category?.name ? `Shop ${category.name} online in Pakistan at Bag Breez. Premium quality ${category.name.toLowerCase()} with free delivery, COD available, and best prices across Pakistan.` : "Browse all fashion categories at Bag Breez — Pakistan's best bags and girls fashion store."} />
      <meta name="keywords" content={category?.name ? `${category.name} Pakistan, buy ${category.name.toLowerCase()} online, ${category.name} Bag Breez, fashion Pakistan, online shopping Pakistan` : "bags Pakistan, girls fashion, online shopping Pakistan, Bag Breez"} />
      <meta property="og:title" content={category?.name ? `${category.name} | Bag Breez Pakistan` : "Categories | Bag Breez"} />
      <meta property="og:description" content={category?.name ? `Shop ${category.name} at Bag Breez. Free delivery & COD across Pakistan.` : "Browse fashion categories at Bag Breez Pakistan."} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bag Breez" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={category?.name ? `${category.name} | Bag Breez Pakistan` : "Categories | Bag Breez"} />
      <meta name="twitter:description" content={category?.name ? `Shop ${category.name} at Bag Breez. Free delivery & COD across Pakistan.` : "Browse fashion categories at Bag Breez Pakistan."} />
    </Helmet>
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-lg border border-dashed">
            <h3 className="text-xl font-bold mb-2">
              No products in this category yet
            </h3>
            <p className="text-muted-foreground">
              Check back later for updates.
            </p>
          </div>
        )}
      </div>
    </Layout>
    </>
  );
}