import { NextResponse } from "next/server";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";

const PAGE_SIZE = 12;

type ExpressionPayload = {
  id?: string;
  title?: string;
  expression_tolaki?: string;
  meaning_indonesia?: string;
  description?: string | null;
  context_note?: string | null;
  category?: string;
  expression_type?: string;
  source_note?: string | null;
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

function validatePayload(payload: ExpressionPayload) {
  const expression_tolaki = parseText(payload.expression_tolaki);
  const meaning_indonesia = parseText(payload.meaning_indonesia);

  if (!expression_tolaki || !meaning_indonesia) {
    throw new Error("Ungkapan Tolaki dan arti Indonesia wajib diisi.");
  }

  const expression_type = parseText(payload.expression_type, "Pe'olili");

  return {
    title: parseText(payload.title, expression_type),
    expression_tolaki,
    meaning_indonesia,
    description: parseOptionalText(payload.description),
    context_note: parseOptionalText(payload.context_note),
    category: parseText(payload.category, "Etika"),
    expression_type,
    source_note: parseOptionalText(payload.source_note),
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
  const type = searchParams.get("type")?.trim();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = createSupabaseClientWithToken(token);

  let query = supabase
    .from("expressions")
    .select(
      "id,title,expression_tolaki,meaning_indonesia,description,context_note,category,expression_type,source_note,is_published,created_at,updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: true })
    .range(from, to);

  if (category && category !== "Semua") {
    query = query.eq("category", category);
  }

  if (type && type !== "Semua") {
    query = query.eq("expression_type", type);
  }

  if (search) {
    const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `title.ilike.%${escaped}%,expression_tolaki.ilike.%${escaped}%,meaning_indonesia.ilike.%${escaped}%,description.ilike.%${escaped}%,context_note.ilike.%${escaped}%`,
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
    const payload = validatePayload((await request.json()) as ExpressionPayload);
    const supabase = createSupabaseClientWithToken(token);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return unauthorized();
    }

    const { data, error } = await supabase
      .from("expressions")
      .insert({
        ...payload,
        created_by: userData.user.id,
      })
      .select(
        "id,title,expression_tolaki,meaning_indonesia,description,context_note,category,expression_type,source_note,is_published,created_at,updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menambah ungkapan.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as ExpressionPayload;
    const id = parseText(body.id);

    if (!id) {
      throw new Error("ID ungkapan tidak valid.");
    }

    const payload = validatePayload(body);
    const supabase = createSupabaseClientWithToken(token);
    const { data, error } = await supabase
      .from("expressions")
      .update(payload)
      .eq("id", id)
      .select(
        "id,title,expression_tolaki,meaning_indonesia,description,context_note,category,expression_type,source_note,is_published,created_at,updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui ungkapan.";

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
      { message: "ID ungkapan tidak valid." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseClientWithToken(token);
  const { error } = await supabase.from("expressions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
