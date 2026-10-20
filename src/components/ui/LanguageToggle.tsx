"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const next = locale === "en" ? "es" : "en";
    // Replace locale prefix in path
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
  };

  return (
    <button
      onClick={toggle}
      aria-label={`EN / ES: ${locale === "en" ? "Cambiar a español" : "Switch to English"}`}
      className="flex items-center gap-1.5 px-3 min-h-[40px] rounded-full border border-white/10 text-xs font-medium text-white/60 hover:text-white hover:border-white/20 transition-all duration-200 font-body"
    >
      <span className={locale === "en" ? "text-lime font-semibold" : ""}>EN</span>
      <span className="text-white/20">/</span>
      <span className={locale === "es" ? "text-lime font-semibold" : ""}>ES</span>
    </button>
  );
}
