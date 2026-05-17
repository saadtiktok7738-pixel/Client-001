import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomBar } from "./MobileBottomBar";
import { usePresence } from "../../hooks/usePresence.js";
import { OfflineBanner } from "../OffilneBanner.jsx";

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923209074644"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-5 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bb5a] transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.523 5.847L.057 23.886a.5.5 0 0 0 .623.611l6.186-1.983A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-4.988-1.364l-.358-.213-3.705 1.189 1.176-3.628-.233-.372A9.818 9.818 0 0 1 2.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z" />
      </svg>
    </a>
  );
}

export function Layout({ children }) {
  usePresence();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <OfflineBanner />

      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {children}
      </main>

      <Footer />
      <MobileBottomBar />
      <WhatsAppButton />
    </div>
  );
}