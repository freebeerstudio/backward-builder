import type { Metadata } from "next";
import { Sora, DM_Sans, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/* Inner app fonts (used by unit pages, dashboard, etc.) */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

/* Landing page fonts — academic editorial aesthetic */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://backwardbuilder.com"),
  title: {
    default: "Backward Builder — UbD Unit Planning, Powered by AI",
    template: "%s | Backward Builder",
  },
  description:
    "Describe what students need to understand. AI designs the complete unit — performance tasks, rubrics, checks for understanding, and learning activities. Understanding by Design, built in minutes.",
  keywords: [
    "UbD", "Understanding by Design", "unit planning", "backward design",
    "assessment", "education", "AI", "curriculum", "teacher tools",
    "performance task", "rubric", "standards-aligned",
  ],
  openGraph: {
    title: "Backward Builder — UbD Unit Planning, Powered by AI",
    description:
      "From enduring understanding to standards-aligned unit plan — with performance tasks, rubrics, and learning activities.",
    url: "https://backwardbuilder.com",
    siteName: "Backward Builder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backward Builder",
    description:
      "Describe the understanding. AI designs the unit.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmSans.variable} ${instrumentSerif.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warmwhite text-text font-body">
        {children}
      </body>
    </html>
  );
}
