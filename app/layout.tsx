import type { Metadata } from "next";
import { Literata, Onest } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Footerss from "@/components/footerss";
import Navbar from "@/components/navbar";

const literata = Literata({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Silahkan Berkeluh Kesah",
  description: "Keluarin keluh kesah kalian. Bebas, berlebihan juga boleh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${literata.variable} ${onest.variable}`}>
        <div className="gutter">
          <div className="notebook">
            <Navbar />
            <main>{children}</main>
            <Footerss />
          </div>
        </div>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "rgb(var(--paper-raised))",
              color: "rgb(var(--ink))",
              border: "1px solid rgb(var(--rule))",
              borderRadius: "3px",
              fontSize: "0.875rem",
              boxShadow: "0 8px 24px -12px rgb(var(--ink) / 0.35)",
            },
            success: { iconTheme: { primary: "rgb(var(--accent))", secondary: "rgb(var(--paper-raised))" } },
            error: { iconTheme: { primary: "rgb(var(--danger))", secondary: "rgb(var(--paper-raised))" } },
          }}
        />
      </body>
    </html>
  );
}
