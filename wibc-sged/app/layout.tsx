import type { Metadata } from "next";
import { League_Spartan, Open_Sans } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const openSans = Open_Sans({ 
  subsets: ["latin"], 
  variable: "--font-body",
  display: "swap"
});
const leagueSpartan = League_Spartan({ 
  subsets: ["latin"], 
  variable: "--font-heading",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Gender Equity Diagnostic | WiBC",
  description: "Assess your organisation against the 7 core pillars of the West of England Women in Business Charter.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${leagueSpartan.variable}`}>
        <header className="site-header">
          <div className="site-header-content">
            <a href="/" className="site-logo">
              <Image 
                src="/logo.png" 
                alt="WiBC logo" 
                width={40} 
                height={40}
                priority
              />
              <div className="site-logo-text">
                <p className="site-logo-title">Bristol WiBC</p>
                <p className="site-logo-sub">Gender Equity Diagnostic</p>
              </div>
            </a>
            <nav>
              <a 
                href="https://www.bristolwomeninbusinesscharter.org/" 
                target="_blank" 
                rel="noreferrer"
                className="site-nav-link"
              >
                About the Charter
              </a>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
