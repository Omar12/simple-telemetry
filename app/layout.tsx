import type { Metadata } from "next";
import { TelemetryTracker } from "@/components/TelemetryTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telemetry Blog Demo",
  description: "A simple privacy-conscious blog telemetry tracker and dashboard."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TelemetryTracker />
        {children}
      </body>
    </html>
  );
}
