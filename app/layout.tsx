import type { Metadata } from "next";
import {
  Cinzel,
  Cinzel_Decorative,
  Crimson_Text,
  EB_Garamond,
  IM_Fell_English,
  Lora,
  Merriweather,
  Nunito,
  Oswald,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { Providers } from "@/components/providers/Providers";

// One heading + body pair per theme (see globals.css). next/font self-hosts
// and subsets these, so ten families stay reasonable.
const playfair = Playfair_Display({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const lora = Lora({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});
const cinzel = Cinzel({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});
const ebGaramond = EB_Garamond({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});
const nunito = Nunito({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
const cinzelDecorative = Cinzel_Decorative({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-cinzel-decorative",
  display: "swap",
});
const crimson = Crimson_Text({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
});
const oswald = Oswald({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});
const merriweather = Merriweather({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});
const imFell = IM_Fell_English({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-im-fell",
  display: "swap",
});

const fontVariables = [
  playfair,
  lora,
  cinzel,
  ebGaramond,
  nunito,
  cinzelDecorative,
  crimson,
  oswald,
  merriweather,
  imFell,
]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  title: {
    default: "Storybook — Rat Adventure",
    template: "%s · Storybook",
  },
  description:
    "Rat Adventure: Sewers of the Pizza Kingdom — a choose-your-own-adventure storybook game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
