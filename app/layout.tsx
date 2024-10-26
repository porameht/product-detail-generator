import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PlausibleProvider from "next-plausible";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI-Powered Product Name & Description Generator",
  description: "Generate compelling product names and descriptions in multiple languages using AI",
  keywords: "AI, product descriptions, e-commerce, multilingual, OpenAI, Llama 3.2",
  authors: [{ name: "fr4nk", url: "https://fr4nk.xyz" }],
  openGraph: {
    title: "AI-Powered Product Name & Description Generator",
    description: "Create engaging product content in multiple languages",
    type: "website",
    url: "https://product-detail-generator.vercel.app",
    images: [
      {
        url: "https://product-detail-generator.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI-Powered Product Name & Description Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Product Name & Description Generator",
    description: "Create engaging product content in multiple languages",
    images: ["https://product-detail-generator.vercel.app/twitter-image.png"],
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
        <PlausibleProvider domain="product-detail-generator.vercel.app" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="mt-16 w-full items-center px-4 pb-10 text-center text-gray-500 md:mt-4 md:flex md:justify-between md:pb-5 md:text-xs lg:text-sm">
          <div className="flex flex-col items-center justify-center">
            <p className="text-center">
              Made with ❤️ by fr4nk
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
