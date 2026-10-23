import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Celebration & Event Planner",
  description:
    "A GenAI-powered assistant to help you plan weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
