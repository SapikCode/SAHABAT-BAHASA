import { NextResponse } from "next/server";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";
import { extractYouTubeId, getYouTubeThumbnailUrl, slugifyTitle } from "@/lib/youtube";

const PAGE_SIZE = 12;

type CultureVideoPayload = {
  id?: string;
  slug?: string;
  title?: string;
  description?: string | null;
  category?: string;
  youtube_url?: string | null;
  thumbnail_url?: string | null;
  duration_label?: string | null;
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

function validatePayload(payload: CultureVideoPayload) {
  const title = parseText(payload.title);
  const youtube_url = parseOptionalText(payload.youtube_url);

  if (!title) {
    throw new Error("Judul video wajib diisi.");
  }

  if (!youtube_url) {
    throw new Error("URL YouTube wajib diisi.");
  }

  if (!extractYouTubeId(youtube_url)) {
    throw new Error("URL YouTube tidak valid.");
  }

  const slug = parseText(payload.slug, slugifyTitle(title));

  if (!slug) {
    throw new Error("Slug video tidak valid.");
  }

  return {
    slug,
    title,
    description: parseOptionalText(payload.description),
    category: parseText(payload.category, "Budaya"),
    youtube_url,
    thumbnail_url:
      parseOptionalText(payload.thumbnail_url) ?? getYouTubeThumbnailUrl(youtube_url),
    duration_label: parseOptionalText(payload.duration_label),
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
    .from("culture_videos")
    .select(
      "id,slug,title,description,category,youtube_url,thumbnail_url,duration_label,is_published,created_at,updated_at",
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
      `title.ilike.%${escaped}%,description.ilike.%${escaped}%,category.ilike.%${escaped}%,youtube_url.ilike.%${escaped}%`,
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
    const payload = validatePayload((await request.json()) as CultureVideoPayload);
    const supabase = createSupabaseClientWithToken(token);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return unauthorized();
    }

    const { data, error } = await supabase
      .from("culture_videos")
      .insert({
        ...payload,
        created_by: userData.user.id,
      })
      .select(
        "id,slug,title,description,category,youtube_url,thumbnail_url,duration_label,is_published,created_at,updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menambah video budaya.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as CultureVideoPayload;
    const id = parseText(body.id);

    if (!id) {
      throw new Error("ID video budaya tidak valid.");
    }

    const payload = validatePayload(body);
    const supabase = createSupabaseClientWithToken(token);
    const { data, error } = await supabase
      .from("culture_videos")
      .update(payload)
      .eq("id", id)
      .select(
        "id,slug,title,description,category,youtube_url,thumbnail_url,duration_label,is_published,created_at,updated_at",
      )
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui video budaya.";

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
      { message: "ID video budaya tidak valid." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseClientWithToken(token);
  const { error } = await supabase.from("culture_videos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

