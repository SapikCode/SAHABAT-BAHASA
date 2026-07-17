import { NextResponse } from "next/server";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";

const PAGE_SIZE = 12;

type VocabularyPayload = {
  id?: string;
  term_tolaki?: string;
  meaning_indonesia?: string;
  example_tolaki?: string | null;
  example_indonesia?: string | null;
  category?: string;
  level?: string;
  is_published?: boolean;
};

function unauthorized() {
  return NextResponse.json(
    { message: "Sesi tidak valid. Silakan login ulang." },
    { status: 401 },
  );
}

function parseText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validatePayload(payload: VocabularyPayload) {
  const term_tolaki = parseText(payload.term_tolaki);
  const meaning_indonesia = parseText(payload.meaning_indonesia);

  if (!term_tolaki || !meaning_indonesia) {
    throw new Error("Kata Tolaki dan arti Indonesia wajib diisi.");
  }

  return {
    term_tolaki,
    meaning_indonesia,
    example_tolaki: parseOptionalText(payload.example_tolaki),
    example_indonesia: parseOptionalText(payload.example_indonesia),
    category: parseText(payload.category, "Umum"),
    level: parseText(payload.level, "Dasar"),
    is_published: payload.is_published ?? true,
  };
}

export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = createSupabaseClientWithToken(token);

  let query = supabase
    .from("vocabularies")
    .select(
      "id,term_tolaki,meaning_indonesia,example_tolaki,example_indonesia,category,level,is_published,created_at,updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: true })
    .range(from, to);

  if (category && category !== "Semua") {
    query = query.eq("category", category);
  }

  if (search) {
    const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `term_tolaki.ilike.%${escaped}%,meaning_indonesia.ilike.%${escaped}%,example_tolaki.ilike.%${escaped}%,example_indonesia.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({
    data,
    page,
    pageSize: PAGE_SIZE,
    total: count ?? 0,
  });
}

export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const payload = validatePayload((await request.json()) as VocabularyPayload);
    const supabase = createSupabaseClientWithToken(token);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return unauthorized();
    }

    const { data, error } = await supabase
      .from("vocabularies")
      .insert({
        ...payload,
        created_by: userData.user.id,
      })
      .select(
        "id,term_tolaki,meaning_indonesia,example_tolaki,example_indonesia,category,level,is_published,created_at,updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menambah kosakata.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as VocabularyPayload;
    const id = parseText(body.id);

    if (!id) {
      throw new Error("ID kosakata tidak valid.");
    }

    const payload = validatePayload(body);
    const supabase = createSupabaseClientWithToken(token);
    const { data, error } = await supabase
      .from("vocabularies")
      .update(payload)
      .eq("id", id)
      .select(
        "id,term_tolaki,meaning_indonesia,example_tolaki,example_indonesia,category,level,is_published,created_at,updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui kosakata.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const id = parseText(searchParams.get("id"));

  if (!id) {
    return NextResponse.json(
      { message: "ID kosakata tidak valid." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseClientWithToken(token);
  const { error } = await supabase.from("vocabularies").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
