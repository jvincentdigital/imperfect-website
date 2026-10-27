import type { Metadata } from "next";
import ControllerLab from "./ControllerLab";

// Lab test page: not linked from the nav, not in a sitemap, and kept out of search.
export const metadata: Metadata = {
  title: "Lab test: controller QR | IMPerfect Esports",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ControllerLab locale={locale === "es" ? "es" : "en"} />;
}
