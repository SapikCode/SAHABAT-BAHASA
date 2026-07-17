import { NextResponse } from "next/server";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";

const PAGE_SIZE = 12;

type ProfileUpdatePayload = {
  id?: string;
  role?: "user" | "admin";
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
    .from("profiles")
    .select(
      "id,email,display_name,avatar_url,role,created_at,updated_at,quiz_attempts!quiz_attempts_user_profile_fkey(id,score,total_questions,completed_at)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    const escaped = search.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `email.ilike.%${escaped}%,display_name.ilike.%${escaped}%,role.ilike.%${escaped}%`,
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

export async function PATCH(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as ProfileUpdatePayload;
    const id = parseText(body.id);
    const role = body.role;

    if (!id) {
      throw new Error("ID pengguna tidak valid.");
    }

    if (role !== "user" && role !== "admin") {
      throw new Error("Role tidak valid.");
    }

    const supabase = createSupabaseClientWithToken(token);
    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select("id,email,display_name,avatar_url,role,created_at,updated_at")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui pengguna.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
