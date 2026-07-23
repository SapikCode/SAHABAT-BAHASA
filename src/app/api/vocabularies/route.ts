import { NextResponse } from "next/server";
import {
  vocabularyItems as fallbackVocabularyItems,
  type VocabularyCategory,
  type VocabularyItem,
} from "@/data/vocabulary";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

function normalizeVocabulary(row: Record<string, unknown>): VocabularyItem {
  return {
    id: String(row.id),
    kataTolaki: String(row.term_tolaki ?? ""),
    artiIndonesia: String(row.meaning_indonesia ?? ""),
    kalimatTolaki: String(row.example_tolaki ?? ""),
    kalimatIndonesia: String(row.example_indonesia ?? ""),
    kategori: (row.category as VocabularyCategory) ?? "Sapaan",
  };
}

export async function GET() {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("vocabularies")
      .select(
        "id,term_tolaki,meaning_indonesia,example_tolaki,example_indonesia,category,is_published,created_at",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const normalized = (data ?? []).map((row) =>
      normalizeVocabulary(row as Record<string, unknown>),
    );

    return NextResponse.json({ data: normalized, source: "database" });
  } catch {
    return NextResponse.json({
      data: fallbackVocabularyItems,
      source: "fallback",
    });
  }
}
