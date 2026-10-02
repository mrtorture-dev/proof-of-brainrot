import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proof of Brainrot (6-7 Protocol)",
  description: "Six Seven Italian Brainrot Web3 Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
