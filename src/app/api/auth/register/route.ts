import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { normalizeUsername, usernameToInternalEmail } from "@/lib/auth-username";

type RegisterPayload = {
  username?: string;
  password?: string;
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
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const username = normalizeUsername(payload.username ?? "");
    const password = payload.password ?? "";

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password minimal 6 karakter." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const email = usernameToInternalEmail(username);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: username,
        full_name: username,
        login_id: username,
      },
    });

    if (error) {
      const isDuplicate =
        error.message.toLowerCase().includes("already") ||
        error.message.toLowerCase().includes("registered");

      return NextResponse.json(
        {
          message: isDuplicate
            ? "Username sudah dipakai. Coba username lain."
            : error.message,
        },
        { status: isDuplicate ? 409 : 400 },
      );
    }

    return NextResponse.json({
      userId: data.user?.id,
      email,
      username,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal membuat akun.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

