import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "Simple, elegant Kanban project management board",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f3f6fa] text-[#032147] antialiased">
        {children}
      </body>
    </html>
  );
}
