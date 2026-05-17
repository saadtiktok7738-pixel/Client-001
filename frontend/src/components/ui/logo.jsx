import React from "react";

// =====================================================================
// Brand config — change these two values to update the logo everywhere.
// =====================================================================
export const LOGO_IMAGE = "/logo.png";
export const BRAND_NAME = "Bag Breez";
// =====================================================================

export function Logo({
  size = "md",
  variant = "dark",
  showText = true,
  className = "",
}) {
  const dims = {
  sm: { img: "h-8 w-8", text: "text-lg", gap: "gap-2" },
  md: { img: "h-18 w-18", text: "text-2xl", gap: "gap-3" },
  lg: { img: "h-14 w-14", text: "text-4xl", gap: "gap-3" },
}[size];

  return (
    <span className={`inline-flex items-center ${dims.gap} ${className} leading-none`}>
      <img
        src={LOGO_IMAGE}
        alt={BRAND_NAME}
        className={`${dims.img} object-contain shrink-0`}
      />

      {showText && (
        <span
          className={`${dims.text} font-bold tracking-tight leading-none whitespace-nowrap`}
          style={{ color: "#A36852" }}
        >
          {BRAND_NAME}
          <span className="text-accent">.</span>
        </span>
      )}
    </span>
  );
}