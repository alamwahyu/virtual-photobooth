import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWH Virtual Photobooth",
  description: "Virtual wedding photobooth untuk tamu undangan AWH Digital."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
