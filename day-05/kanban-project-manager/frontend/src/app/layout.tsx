import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AIChatSidebar } from "@/components/ai/ai-chat-sidebar";

export const metadata: Metadata = {
  title: "Product sprint | flowboard",
  description: "A clear view of what the team is shaping this week.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AIChatSidebar />
      </body>
    </html>
  );
}
