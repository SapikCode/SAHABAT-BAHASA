import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { buildDictionaryContent } from "@/lib/dictionary-content";
import { createEmbedding, vectorLiteral } from "@/lib/openrouter";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";

type CorrectionPayload = {
  arti_indonesia?: string;
  kata_tolaki?: string;
  message_id?: string;
};

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL belum diset.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diset di .env.local.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function unauthorized() {
  return NextResponse.json(
    { message: "Silakan login untuk mengirim koreksi." },
    { status: 401 },
  );
}

function parseRequiredText(value: unknown, label: string) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new Error(`${label} wajib diisi.`);
  }

  return text;
}

export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  try {
    const authSupabase = createSupabaseClientWithToken(token);
    const { data: userData, error: userError } = await authSupabase.auth.getUser();

    if (userError || !userData.user) {
      return unauthorized();
    }

    const body = (await request.json()) as CorrectionPayload;
    const payload = {
      arti_indonesia: parseRequiredText(body.arti_indonesia, "Arti Indonesia"),
      is_published: true,
      kalimat_indonesia: null,
      kalimat_tolaki: null,
      kata_tolaki: parseRequiredText(body.kata_tolaki, "Kata atau kalimat Tolaki"),
    };
    const content = buildDictionaryContent(payload);
    const embedding = await createEmbedding(content);
    const adminSupabase = createSupabaseAdminClient();
    const { data, error } = await adminSupabase
      .from("dictionary_documents")
      .insert({
        ...payload,
        content,
        created_by: userData.user.id,
        embedding: vectorLiteral(embedding),
        metadata: {
          message_id: typeof body.message_id === "string" ? body.message_id : null,
          source: "user_correction",
        },
        source: "user_correction",
      })
      .select("id,kata_tolaki,arti_indonesia")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengirim koreksi.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
