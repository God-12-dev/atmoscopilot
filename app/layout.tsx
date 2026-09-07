import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthSessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "WeatherGPT — AI-Powered Weather Intelligence & Disaster Resilience",
  description:
    "WeatherGPT transforms real-time weather, forecasts, AI, disaster intelligence and hyper-local insights into actionable decisions for citizens, farmers, emergency teams and businesses.",
  keywords: "weather, AI, disaster, flood, agriculture, forecast, India",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
