import { useAuth } from "../../contexts/AuthContext.jsx";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Loader from "../Loader.jsx";

export default function AdminGuard({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/signin");
    }
  }, [loading, user, setLocation]);

  if (loading) return <Loader message="Checking access" />;
  if (!user) return <Loader message="Redirecting" />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <h1 className="text-3xl font-bold">Access denied</h1>
        <p className="text-white/60">
          You need an admin account to view this page.
        </p>

        <button
          onClick={() => setLocation("/")}
          className="rounded-full bg-[#a8e063] px-5 py-2 text-sm font-semibold text-black hover-elevate active-elevate-2"
        >
          Back to shop
        </button>
      </div>
    );
  }

  return children;
}