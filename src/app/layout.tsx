import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Document Management System | Compressor, WALTON",
  description:
    "File and retrieve Walton compressor plant documents by SOP record number.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="relative min-h-full">
        <div className="grid-fade pointer-events-none fixed inset-0" aria-hidden />
        <div className="relative flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
