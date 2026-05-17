import React from "react";
import { Link } from "wouter";
import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Logo } from "../../ui/logo";

export function Footer() {
  return (
    <footer className="bg-foreground text-gray-400 pt-20 pb-10 w-full">
      <div className="container mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-14">
          
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center w-fit mb-5">
  <Logo size="sm" variant="light" />
</Link>

            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed text-sm">
              A modern Pakistani retail brand delivering premium quality bags
              and lifestyle products across the nation.
            </p>

            <ul className="not-italic text-sm text-gray-400 space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                <span>Al Sheikh Market, Street No 15, Sector I-10/1, Islamabad</span>
              </li>

              <li className="flex items-center gap-3">
                <Phone size={16} className="text-accent shrink-0" />
                <a
                  href="tel:+9203355111558"
                  className="hover:text-accent transition-colors"
                >
                  03355111558
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Mail size={16} className="text-accent shrink-0" />
                <a
                  href="mailto:info.bagbreez@gmail.com"
                  className="hover:text-accent transition-colors"
                >
                  info.bagbreez@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-5 uppercase tracking-wider text-sm text-background">
              Quick Links
            </h4>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="hover:text-accent transition-colors"
                >
                  Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="hover:text-accent transition-colors"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-accent transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="hover:text-accent transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="hover:text-accent transition-colors"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold mb-5 uppercase tracking-wider text-sm text-background">
              Information
            </h4>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-accent transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-accent transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="hover:text-accent transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-accent transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Bag Breez. All rights reserved.</p>

          <div className="flex gap-2">
            <div className="w-10 h-6 bg-white/5 rounded"></div>
            <div className="w-10 h-6 bg-white/5 rounded"></div>
            <div className="w-10 h-6 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
