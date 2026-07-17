import { NextResponse } from "next/server";
import { buildDictionaryContent } from "@/lib/dictionary-content";
import { createEmbedding, vectorLiteral } from "@/lib/openrouter";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";

const PAGE_SIZE = 12;

type DictionaryPayload = {
  id?: string;
  kata_tolaki?: string;
  arti_indonesia?: string;
  kalimat_tolaki?: string | null;
  kalimat_indonesia?: string | null;
  is_published?: boolean;
};

function unauthorized() {
  return NextResponse.json(
    { message: "Sesi tidak valid. Silakan login ulang." },
    { status: 401 },
  );
}

function parseText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validatePayload(payload: DictionaryPayload) {
  const kata_tolaki = parseText(payload.kata_tolaki);
  const arti_indonesia = parseText(payload.arti_indonesia);

  if (!kata_tolaki || !arti_indonesia) {
    throw new Error("Kata Tolaki dan arti Indonesia wajib diisi.");
  }

  return {
    kata_tolaki,
    arti_indonesia,
    kalimat_tolaki: parseOptionalText(payload.kalimat_tolaki),
    kalimat_indonesia: parseOptionalText(payload.kalimat_indonesia),
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
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = createSupabaseClientWithToken(token);

  let query = supabase
    .from("dictionary_documents")
    .select(
      "id,kata_tolaki,arti_indonesia,kalimat_tolaki,kalimat_indonesia,is_published,source_row,updated_at",
      { count: "exact" },
    )
    .order("source_row", { ascending: true, nullsFirst: false })
    .range(from, to);

  if (search) {
    const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `kata_tolaki.ilike.%${escaped}%,arti_indonesia.ilike.%${escaped}%,kalimat_tolaki.ilike.%${escaped}%,kalimat_indonesia.ilike.%${escaped}%`,
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
    const payload = validatePayload((await request.json()) as DictionaryPayload);
    const content = buildDictionaryContent(payload);
    const embedding = await createEmbedding(content);
    const supabase = createSupabaseClientWithToken(token);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return unauthorized();
    }

    const { data, error } = await supabase
      .from("dictionary_documents")
      .insert({
        ...payload,
        content,
        embedding: vectorLiteral(embedding),
        source: "admin",
        metadata: { source: "admin" },
        created_by: userData.user.id,
      })
      .select(
        "id,kata_tolaki,arti_indonesia,kalimat_tolaki,kalimat_indonesia,is_published,source_row,updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menambah data kamus.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as DictionaryPayload;
    const id = parseText(body.id);

    if (!id) {
      throw new Error("ID data kamus tidak valid.");
    }

    const payload = validatePayload(body);
    const content = buildDictionaryContent(payload);
    const embedding = await createEmbedding(content);
    const supabase = createSupabaseClientWithToken(token);
    const { data, error } = await supabase
      .from("dictionary_documents")
      .update({
        ...payload,
        content,
        embedding: vectorLiteral(embedding),
      })
      .eq("id", id)
      .select(
        "id,kata_tolaki,arti_indonesia,kalimat_tolaki,kalimat_indonesia,is_published,source_row,updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui data kamus.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as DictionaryPayload;
    const id = parseText(body.id);

    if (!id) {
      throw new Error("ID data kamus tidak valid.");
    }

    const supabase = createSupabaseClientWithToken(token);
    const { error } = await supabase
      .from("dictionary_documents")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus data kamus.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
