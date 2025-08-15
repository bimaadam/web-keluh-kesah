import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footerss from "@/components/footerss";
import Navbar from "@/components/navbar";

const Poppin = Poppins({
  weight: "400",
  variable: "--font-poppins",
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "Silahkan Berkeluh Kesah",
  description: "KELUARIN KELUH KESAH KALIAN BEBAS BERLEBIHAN JUGA BOLEH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${Poppin.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footerss />
      </body>
    </html>
  );
}
