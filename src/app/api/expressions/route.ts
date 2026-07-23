import { NextResponse } from "next/server";
import {
  expressionItems as fallbackExpressionItems,
  expressionSources,
  type ExpressionCategory,
  type ExpressionItem,
  type ExpressionType,
} from "@/data/expressions";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

function normalizeExpression(row: Record<string, unknown>): ExpressionItem {
  return {
    id: String(row.id),
    ungkapanTolaki: String(row.expression_tolaki ?? ""),
    artiIndonesia: String(row.meaning_indonesia ?? ""),
    maknaSingkat: String(row.description ?? ""),
    konteks: String(row.context_note ?? ""),
    kategori: (row.category as ExpressionCategory) ?? "Etika",
    jenis: (row.expression_type as ExpressionType) ?? "Pe'olili",
    sumber: String(row.source_note ?? ""),
  };
}

export async function GET() {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("expressions")
      .select(
        "id,title,expression_tolaki,meaning_indonesia,description,context_note,category,expression_type,source_note,is_published,created_at",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const normalized = (data ?? []).map((row) =>
      normalizeExpression(row as Record<string, unknown>),
    );

    return NextResponse.json({
      data: normalized,
      sources: expressionSources,
      source: "database",
    });
  } catch {
    return NextResponse.json({
      data: fallbackExpressionItems,
      sources: expressionSources,
      source: "fallback",
    });
  }
}
