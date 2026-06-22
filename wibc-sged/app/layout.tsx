import type { Metadata } from "next";
import { DM_Serif_Text } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const dmSerifText = DM_Serif_Text({ 
  weight: "400",
  subsets: ["latin"], 
  variable: "--font-heading",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Gender Equity Diagnostic | WiBC",
  description: "Assess your organisation against the 7 core pillars of the Bristol Women in Business Charter.",
  icons: {
    icon: "/LOGO.webp",
    apple: "/LOGO.webp",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSerifText.variable}`}>
        <header className="site-header">
          <div className="site-header-content">
            <a href="/" className="site-logo">
              <Image 
                src="/LOGO.webp" 
                alt="WiBC logo" 
                width={40} 
                height={40}
                priority
              />
              <div className="site-logo-text">
                <p className="site-logo-title">Women in Business Charter</p>
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
