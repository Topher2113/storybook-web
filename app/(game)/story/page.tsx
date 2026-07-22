import type { Metadata } from "next";
import { StoryScreen } from "@/components/game/StoryScreen";

export const metadata: Metadata = { title: "Story" };

export default function StoryPage() {
  return <StoryScreen />;
}
