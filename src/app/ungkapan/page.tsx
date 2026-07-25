import type { Metadata } from "next";
import { ExpressionExplorer } from "@/components/expressions/ExpressionExplorer";

export const metadata: Metadata = {
  title: "Ungkapan Tradisional Tolaki",
  description:
    "Pelajari ungkapan dan pepatah tradisional Tolaki beserta makna, konteks penggunaan, dan nilai budaya di baliknya.",
  alternates: {
    canonical: "/ungkapan",
  },
  openGraph: {
    title: "Ungkapan Tradisional Tolaki | Chatbot Tolaki",
    description:
      "Pelajari ungkapan dan pepatah tradisional Tolaki beserta makna, konteks penggunaan, dan nilai budaya di baliknya.",
    url: "/ungkapan",
  },
};

export default function UngkapanPage() {
  return <ExpressionExplorer />;
}
