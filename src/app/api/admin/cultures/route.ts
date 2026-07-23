import { NextResponse } from "next/server";
import {
  parseCultureSections,
  slugifyCultureTitle,
} from "@/data/tolakiCulture";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";

const PAGE_SIZE = 12;

type CulturePayload = {
  id?: string;
  slug?: string;
  title?: string;
  category?: string;
  summary?: string | null;
  hero_image_url?: string | null;
  sections?: unknown;
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

function isMissingCultureTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    error.message?.includes("tolaki_culture_topics") ||
    error.message?.includes("schema cache")
  );
}

function setupRequiredResponse() {
  return NextResponse.json({
    data: [],
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    setupRequired: true,
    message:
      "Tabel public.tolaki_culture_topics belum ada di Supabase. Jalankan SQL pada docs/tolaki_culture_topics.sql di project yang dipakai .env.local.",
  });
}

function setupRequiredError() {
  return NextResponse.json(
    {
      message:
        "Tabel public.tolaki_culture_topics belum ada. Jalankan SQL pada docs/tolaki_culture_topics.sql terlebih dulu.",
      setupRequired: true,
    },
    { status: 409 },
  );
}

function validatePayload(payload: CulturePayload) {
  const title = parseText(payload.title);

  if (!title) {
    throw new Error("Judul budaya wajib diisi.");
  }

  const slug = parseText(payload.slug, slugifyCultureTitle(title));
  const sections = parseCultureSections(payload.sections);

  if (!slug) {
    throw new Error("Slug budaya tidak valid.");
  }

  if (sections.length === 0) {
    throw new Error("Minimal isi satu bagian konten budaya.");
  }

  return {
    slug,
    title,
    category: parseText(payload.category, "Adat Istiadat"),
    summary: parseText(payload.summary),
    hero_image_url: parseOptionalText(payload.hero_image_url),
    sections,
    is_published: payload.is_published ?? true,
  };
}

const selectColumns =
  "id,slug,title,category,summary,hero_image_url,sections,is_published,created_at,updated_at";

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
    .from("tolaki_culture_topics")
    .select(selectColumns, { count: "exact" })
    .order("created_at", { ascending: true })
    .range(from, to);

  if (category && category !== "Semua") {
    query = query.eq("category", category);
  }

  if (search) {
    const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `title.ilike.%${escaped}%,summary.ilike.%${escaped}%,category.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    if (isMissingCultureTableError(error)) {
      return setupRequiredResponse();
    }

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
    const payload = validatePayload((await request.json()) as CulturePayload);
    const supabase = createSupabaseClientWithToken(token);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return unauthorized();
    }

    const { data, error } = await supabase
      .from("tolaki_culture_topics")
      .insert({
        ...payload,
        created_by: userData.user.id,
      })
      .select(selectColumns)
      .single();

    if (error) {
      if (isMissingCultureTableError(error)) {
        return setupRequiredError();
      }

      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menambah budaya Tolaki.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as CulturePayload;
    const id = parseText(body.id);

    if (!id) {
      throw new Error("ID budaya tidak valid.");
    }

    const payload = validatePayload(body);
    const supabase = createSupabaseClientWithToken(token);
    const { data, error } = await supabase
      .from("tolaki_culture_topics")
      .update(payload)
      .eq("id", id)
      .select(selectColumns)
      .single();

    if (error) {
      if (isMissingCultureTableError(error)) {
        return setupRequiredError();
      }

      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui budaya.";

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
      { message: "ID budaya tidak valid." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseClientWithToken(token);
  const { error } = await supabase
    .from("tolaki_culture_topics")
    .delete()
    .eq("id", id);

  if (error) {
    if (isMissingCultureTableError(error)) {
      return setupRequiredError();
    }

    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
