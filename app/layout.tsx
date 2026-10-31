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
    <html lang="id" className="scheme-light dark:scheme-dark">
      <body
        className={`${literata.variable} ${onest.variable} bg-paper font-sans text-ink antialiased selection:bg-highlight selection:text-on-highlight`}
      >
        <div className="pr-[max(16px,env(safe-area-inset-right,0px))] pl-[max(16px,env(safe-area-inset-left,0px))]">
          {/* The red margin line runs the full height of the page */}
          <div className="relative mx-auto flex min-h-dvh max-w-[50rem] flex-col before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-redline md:before:left-margin">
            <Navbar />
            <main>{children}</main>
            <Footerss />
          </div>
        </div>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--paper-raised)",
              color: "var(--ink)",
              border: "1px solid var(--rule)",
              borderRadius: "3px",
              fontSize: "0.875rem",
              boxShadow: "0 8px 24px -12px color-mix(in oklab, var(--ink) 35%, transparent)",
            },
            success: { iconTheme: { primary: "var(--accent)", secondary: "var(--paper-raised)" } },
            error: { iconTheme: { primary: "var(--danger)", secondary: "var(--paper-raised)" } },
          }}
        />
      </body>
    </html>
  );
}
