import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drishti",
  description: "Drishti dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors">
        {children}
      </body>
    </html>
  );
}
