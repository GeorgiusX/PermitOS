import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PermitOS",
  description:
    "AI-native permit compliance for Florida real estate. Catch plan-set issues before submission.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
