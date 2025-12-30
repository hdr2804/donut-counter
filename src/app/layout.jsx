import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Metadata untuk preview embed di Farcaster / media sosial
export const metadata = {
  title: "Donut Counter",
  description: "Click to increment your Donut count on Base!",
  openGraph: {
    title: "Donut Counter",
    description: "Click to increment your Donut count on Base!",
    url: "https://donut-counter.vercel.app",
    siteName: "Donut Counter",
    images: [
      {
        url: "https://donut-counter.vercel.app/api/og",
        width: 800,
        height: 600,
        alt: "Donut Counter",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donut Counter",
    description: "Click to increment your Donut count on Base!",
    images: ["https://donut-counter.vercel.app/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
import { useEffect } from "react";

export default function OnChatWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://onchat.sebayaki.com/widget.js";
    script.onload = () => {
      window.OnChat.mount("#onchat-widget", {
        channel: "happy-new-year",
        theme: "beeper-green",
        hideMobileTabs: true,
        hideBrand: true,
      });
    };
    document.body.appendChild(script);
  }, []);

  return <div id="onchat-widget"></div>;
}
