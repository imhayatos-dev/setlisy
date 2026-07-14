import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://setlisy.vercel.app/"),
  title: {
    default: "Setlisy",
    template: "%s | Setlisy",
  },
  description:
    "セットリストとセット図を、登録なしでシンプルに作成・PDF出力できるライブ準備ツール。",
  applicationName: "Setlisy",
  keywords: [
    "セットリスト",
    "セット図",
    "ステージプロット",
    "バンド",
    "ライブ",
    "大学生バンド",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Setlisy",
    description: "ライブ準備を、もっとシンプルに。",
    type: "website",
    locale: "ja_JP",
    siteName: "Setlisy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Setlisy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Setlisy",
    description: "ライブ準備を、もっとシンプルに。",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};
 verification: {
    google: "<meta name="google-site-verification" content="HsbW2y1hnD9Hs5rseUOrM4evmPChJxcDbrnqrVStGiM" />",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
