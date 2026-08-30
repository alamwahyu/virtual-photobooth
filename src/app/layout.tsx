import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWH Virtual Photobooth",
  description: "Virtual wedding photobooth untuk tamu undangan AWH Digital."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Cinzel:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
