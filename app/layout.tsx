import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Manager",
  description: "Company management and finance dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-950 antialiased">{children}</body>
    </html>
  );
}
