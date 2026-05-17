import React from "react";
import { Link } from "wouter";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { ProductCard } from "../ui/ProductCard.jsx";
import { useData } from "../contexts/DataContext.jsx";
import useEmblaCarousel from "embla-carousel-react";
import { Truck, RefreshCcw, HeadphonesIcon, Banknote } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Helmet } from "react-helmet-async";

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      <div className="aspect-[4/5] bg-gray-200 animate-pulse" />
      <div className="px-1 pt-2 pb-1 flex flex-col gap-2">
        <div className="h-2.5 w-14 bg-gray-200 animate-pulse rounded" />
        <div className="h-3.5 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-3.5 w-3/4 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <Layout>
      {/* Banner Skeleton */}
      <section className="w-full overflow-hidden bg-gray-100">
        <div className="w-full aspect-[16/5] md:aspect-[16/4] bg-gray-200 animate-pulse" />
      </section>

      {/* Categories Skeleton */}
      <section className="py-6 md:py-8 bg-white">
        <div className="container mx-auto px-4 mb-4">
          <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mx-auto" />
        </div>
        <div className="flex gap-5 md:gap-8 overflow-hidden px-8 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-20 h-20 md:w-[120px] md:h-[120px] rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Hot Selling Skeleton */}
      <section className="py-8 md:py-10 container mx-auto px-4">
        <div className="flex flex-col items-center mb-6">
          <div className="h-8 w-44 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="w-16 h-1 bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* New Arrivals Skeleton */}
      <section className="py-8 md:py-10 container mx-auto px-4">
        <div className="flex flex-col items-center mb-6">
          <div className="h-8 w-44 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="w-16 h-1 bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default function Home() {
  const { products, categories, banners, loading } = useData();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  React.useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [emblaApi]);

  // Countdown timer for limited offer
  const [timeLeft, setTimeLeft] = React.useState({ h: 23, m: 59, s: 59 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          return { h: 23, m: 59, s: 59 };
        }
        return { h, m, s };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Memoised product slices — recomputed only when products changes,
  // not on every countdown-timer tick.
  const hotSelling = React.useMemo(
    () => products.filter((p) => p.isHot).slice(0, 8),
    [products]
  );
  const newArrivals = React.useMemo(
    () => products.filter((p) => p.isNewArrival).slice(0, 8),
    [products]
  );
  const limitedOffer = React.useMemo(
    () => products.find((p) => p.isLimitedOffer) || null,
    [products]
  );

  // Show skeleton while data is loading on first visit
  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <>
      <Helmet>
        <title>Bag Breez - Pakistan's Best Bags & Girls Fashion Store</title>
        <meta name="description" content="Shop premium bags, handbags, girls fashion, and accessories in Pakistan. Free delivery all over Pakistan, COD available, and up to 40% off on top products." />
        <meta name="keywords" content="bags Pakistan, girls fashion Pakistan, handbags online, fashion store Pakistan, online shopping Pakistan, Bag Breez, ladies bags, fashion accessories Pakistan, clothing Pakistan, purses Pakistan" />
        <meta property="og:title" content="Bag Breez - Pakistan's Best Bags & Girls Fashion Store" />
        <meta property="og:description" content="Shop premium bags, girls fashion, and lifestyle accessories in Pakistan. Free delivery, COD available, best prices guaranteed." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Bag Breez" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bag Breez - Pakistan's Best Bags & Girls Fashion Store" />
        <meta name="twitter:description" content="Shop premium bags, girls fashion, and accessories in Pakistan. Free delivery, COD available." />
      </Helmet>

      <Layout>
        {/* Hero Banner Slider */}
        <section className="relative w-full overflow-hidden bg-white">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {banners.map((banner) => (
                <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                  <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet={banner.imageMobile || banner.image}
                    />
                    <img
                      src={banner.image}
                      alt=""
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </picture>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Strip */}
        <section className="py-6 md:py-8 bg-white w-full overflow-hidden">
          <div className="container mx-auto px-4 mb-4">
            <h3 className="text-xl font-bold tracking-tight text-center uppercase">
              Shop by Category
            </h3>
          </div>

          <div className="relative w-full overflow-hidden group">
            <div className="flex w-max animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
              {[...categories, ...categories, ...categories].map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-2 mx-5 md:mx-6 shrink-0"
                >
                  <div className="w-20 h-20 md:w-[120px] md:h-[120px] rounded-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-xs md:text-sm">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Hot Selling */}
        <section className="py-8 md:py-10 container mx-auto px-4">
          <div className="flex flex-col items-center mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">
              Hot Selling
            </h2>
            <div className="w-16 h-1 bg-accent mt-2"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {hotSelling.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Limited Offer */}
        {limitedOffer && (
          <section className="py-6 md:py-16 bg-muted w-full">
            <div className="px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center bg-white overflow-hidden shadow-sm md:max-w-5xl md:mx-auto">
                <div className="h-[320px] md:h-[460px] w-full">
                  <img
                    src={limitedOffer.images[0]}
                    alt={limitedOffer.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 md:p-10 flex flex-col items-start justify-center">
                  <span className="text-accent font-bold uppercase tracking-wider mb-2 text-sm">
                    Limited Time Offer
                  </span>

                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {limitedOffer.name}
                  </h2>

                  <p className="text-muted-foreground mb-8 line-clamp-3 text-sm md:text-base">
                    {limitedOffer.description}
                  </p>

                  <div className="flex gap-3 mb-8">
                    <div className="bg-foreground text-background flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16">
                      <span className="text-lg md:text-xl font-bold">
                        {timeLeft.h.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px] uppercase">Hrs</span>
                    </div>

                    <div className="bg-foreground text-background flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16">
                      <span className="text-lg md:text-xl font-bold">
                        {timeLeft.m.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px] uppercase">Mins</span>
                    </div>

                    <div className="bg-foreground text-background flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16">
                      <span className="text-lg md:text-xl font-bold">
                        {timeLeft.s.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px] uppercase">Secs</span>
                    </div>
                  </div>

                  <Button asChild size="lg" className="w-full md:w-auto">
                    <Link href={`/product/${limitedOffer.id}`}>
                      Shop Now - Rs. {limitedOffer.price}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals */}
        <section className="py-8 md:py-10 container mx-auto px-4">
          <div className="flex flex-col items-center mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">
              New Arrivals
            </h2>
            <div className="w-16 h-1 bg-accent mt-2"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Support Strip */}
        <section className="border-y border-border bg-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Truck className="text-accent" size={32} />
                <h4 className="font-bold">Free Shipping</h4>
                <p className="text-sm text-muted-foreground">
                  All over Pakistan
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <RefreshCcw className="text-accent" size={32} />
                <h4 className="font-bold">Easy Returns</h4>
                <p className="text-sm text-muted-foreground">
                  7 Days return policy
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <HeadphonesIcon className="text-accent" size={32} />
                <h4 className="font-bold">24/7 Support</h4>
                <p className="text-sm text-muted-foreground">
                  Dedicated assistance
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <Banknote className="text-accent" size={32} />
                <h4 className="font-bold">COD Available</h4>
                <p className="text-sm text-muted-foreground">
                  Pay on delivery
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
