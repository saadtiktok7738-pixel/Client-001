import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api from "../../services/api.js";
import { appCache, TTL } from "../lib/cache.js";

const KEY_PRODUCTS = "static:products";
const KEY_CATEGORIES = "static:categories";
const KEY_BANNERS = "static:banners";

const DataContext = createContext(undefined);

async function fetchProducts() {
  const res = await api.get("/products");
  return res.data;
}

async function fetchCategories() {
  const res = await api.get("/categories");
  return res.data;
}

async function fetchBanners() {
  const res = await api.get("/banners");
  return res.data;
}

export function DataProvider({ children }) {
  const [products, setProducts] = useState(appCache.get(KEY_PRODUCTS) || []);
  const [categories, setCategories] = useState(appCache.get(KEY_CATEGORIES) || []);
  const [banners, setBanners] = useState(appCache.get(KEY_BANNERS) || []);

  const [loading, setLoading] = useState(
    !appCache.has(KEY_BANNERS) || !appCache.has(KEY_CATEGORIES)
  );
  const [offline, setOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchingRef = useRef(false);

  const loadAll = async (force = false) => {
    if (fetchingRef.current) return;

    const needProducts = force || appCache.isStale(KEY_PRODUCTS);
    const needCategories = force || appCache.isStale(KEY_CATEGORIES);
    const needBanners = force || appCache.isStale(KEY_BANNERS);

    if (!needProducts && !needCategories && !needBanners) return;

    fetchingRef.current = true;

    try {
      const [freshBanners, freshCategories] = await Promise.all([
        needBanners ? fetchBanners() : Promise.resolve(appCache.get(KEY_BANNERS)),
        needCategories ? fetchCategories() : Promise.resolve(appCache.get(KEY_CATEGORIES)),
      ]);

      if (needBanners) {
        appCache.set(KEY_BANNERS, freshBanners, TTL.BANNERS);
        setBanners(freshBanners);
      }
      if (needCategories) {
        appCache.set(KEY_CATEGORIES, freshCategories, TTL.CATEGORIES);
        setCategories(freshCategories);
      }

      setOffline(false);
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load data");
      if (!appCache.has(KEY_BANNERS)) setOffline(true);
    } finally {
      setLoading(false);
    }

    if (needProducts) {
      try {
        const freshProducts = await fetchProducts();
        appCache.set(KEY_PRODUCTS, freshProducts, TTL.PRODUCTS);
        setProducts(freshProducts);
      } catch (err) {
        console.error(err);
      }
    }

    fetchingRef.current = false;
  };

  const refreshProducts = useCallback(async () => {
    appCache.invalidate(KEY_PRODUCTS);
    try {
      const fresh = await fetchProducts();
      appCache.set(KEY_PRODUCTS, fresh, TTL.PRODUCTS);
      setProducts(fresh);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadAll();

    const onVisibility = () => {
      if (document.visibilityState === "visible") loadAll();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <DataContext.Provider
      value={{ products, categories, banners, loading, offline, errorMessage, refreshProducts }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
