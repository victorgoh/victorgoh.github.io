import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const socialImage = siteUrl
  ? new URL(`${basePath}/og.png`, siteUrl).toString()
  : `${basePath}/og.png`;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Growing Leaders: From Foundations to Maturity",
  description:
    "A six-module mentoring journey for new and emerging Christian leaders, forming the head, heart, hands, and habits.",
  icons: {
    icon: `${basePath}/favicon.png`,
  },
  openGraph: {
    title: "Growing Leaders: From Foundations to Maturity",
    description: "A six-module mentoring journey forming the head, heart, hands, and habits.",
    type: "website",
    images: [{ url: socialImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Growing Leaders: From Foundations to Maturity",
    description: "A six-module mentoring journey forming the head, heart, hands, and habits.",
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
      <head>
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1B459C6JPD" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1B459C6JPD');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
