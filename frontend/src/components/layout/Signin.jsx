import { useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Layout } from "../bonents/mainpage/Layout.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.05 29.51 1 24 1 14.82 1 7.01 6.47 3.44 14.24l7.07 5.49C12.27 13.4 17.67 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v8.98h12.67c-.55 2.96-2.2 5.47-4.68 7.15l7.19 5.58C43.34 37.55 46.52 31.5 46.52 24.5z"/>
      <path fill="#FBBC05" d="M10.51 28.27A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.71-4.27L3.14 14.24A23.94 23.94 0 0 0 0 24c0 3.83.92 7.45 2.54 10.64l7.97-6.37z"/>
      <path fill="#34A853" d="M24 47c5.51 0 10.14-1.82 13.52-4.95l-7.19-5.58c-1.89 1.27-4.31 2.03-6.33 2.03-6.33 0-11.73-3.9-13.49-9.23l-7.97 6.37C7.01 41.53 14.82 47 24 47z"/>
    </svg>
  );
}

export default function SignIn() {
  const { loginWithGoogle, user } = useAuth();
  const [, setLocation] = useLocation();
  const hiddenBtnRef = useRef(null);

  if (user) {
    setLocation("/");
    return null;
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success("Welcome!");
      setLocation("/");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Google sign-in failed";
      toast.error(msg);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign-in was cancelled or failed. Please try again.");
  };

  const triggerGoogleLogin = () => {
    const btn = hiddenBtnRef.current?.querySelector("div[role=button], button, iframe");
    if (btn) btn.click();
  };

  return (
    <>
      <Helmet>
        <title>Sign In | Bag Breez - Pakistan's Best Bags & Fashion Store</title>
        <meta name="description" content="Sign in to your Bag Breez account to track orders, manage your wishlist, and enjoy faster checkout. Pakistan's top bags and girls fashion store." />
        <meta name="keywords" content="sign in Bag Breez, login Bag Breez, Bag Breez account, online shopping Pakistan login" />
        <meta property="og:title" content="Sign In | Bag Breez Pakistan" />
        <meta property="og:description" content="Sign in to your Bag Breez account and enjoy exclusive fashion deals in Pakistan." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Bag Breez" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Sign In | Bag Breez Pakistan" />
        <meta name="twitter:description" content="Sign in to your Bag Breez account. Pakistan's best bags & girls fashion store." />
      </Helmet>
      <Layout>
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div style={{ width: "100%", maxWidth: 500 }}>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Sign In</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Sign in to track orders and manage your account.
            </p>

            {/* Hidden Google login button — handles real auth flow */}
            <div
              ref={hiddenBtnRef}
              style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1, overflow: "hidden" }}
              aria-hidden="true"
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text="signin_with"
                logo_alignment="left"
              />
            </div>

            {/* Custom styled button */}
            <button
              onClick={triggerGoogleLogin}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                width: "100%",
                padding: "14px 20px",
                backgroundColor: "#000000",
                color: "#ffffff",
                borderRadius: "11px",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
                fontFamily: "inherit",
                transition: "background-color 0.18s ease",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#222222"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#000000"}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="mt-6 text-xs text-muted-foreground text-center">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-foreground">Terms</a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
}
