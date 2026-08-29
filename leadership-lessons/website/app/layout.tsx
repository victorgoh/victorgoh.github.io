import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const socialImage = siteUrl
  ? new URL(`${basePath}/og.png`, siteUrl).toString()
  : `${basePath}/og.png`;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "How God Develops Leaders",
  description:
    "A six-session course for new and emerging Christian leaders based on J. Robert Clinton's leadership development framework.",
  icons: {
    icon: `${basePath}/favicon.png`,
  },
  openGraph: {
    title: "How God Develops Leaders",
    description: "A six-session formation journey for new and emerging Christian leaders.",
    type: "website",
    images: [{ url: socialImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How God Develops Leaders",
    description: "A six-session formation journey for new and emerging Christian leaders.",
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
