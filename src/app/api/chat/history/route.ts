import { NextResponse } from "next/server";
import {
  createSupabaseClientWithToken,
  getBearerToken,
} from "@/lib/supabase-auth";

type ChatHistoryMessagePayload = {
  role?: "user" | "assistant";
  content?: string;
};

type SaveChatPayload = {
  conversationId?: string | null;
  title?: string;
  messages?: ChatHistoryMessagePayload[];
};

function unauthorized() {
  return NextResponse.json(
    { message: "Sesi tidak valid. Silakan login ulang." },
    { status: 401 },
  );
}

function normalizeTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

  return title ? title.slice(0, 72) : "Chat baru";
}

function normalizeMessages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((message) => {
      const role =
        message?.role === "user" || message?.role === "assistant"
          ? message.role
          : null;
      const content =
        typeof message?.content === "string" ? message.content.trim() : "";

      if (!role || !content) {
        return null;
      }

      return { role, content };
    })
    .filter((message): message is { role: "user" | "assistant"; content: string } =>
      Boolean(message),
    );
}

export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  const supabase = createSupabaseClientWithToken(token);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (conversationId) {
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .select("id,title,created_at,updated_at")
      .eq("id", conversationId)
      .single();

    if (conversationError) {
      return NextResponse.json(
        { message: conversationError.message },
        { status: 404 },
      );
    }

    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("id,role,content,created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { message: messagesError.message },
        { status: 403 },
      );
    }

    return NextResponse.json({ conversation, messages: messages ?? [] });
  }

  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id,title,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  const payload = (await request.json()) as SaveChatPayload;
  const messages = normalizeMessages(payload.messages);

  if (messages.length === 0) {
    return NextResponse.json(
      { message: "Pesan chat tidak boleh kosong." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseClientWithToken(token);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return unauthorized();
  }

  let conversationId =
    typeof payload.conversationId === "string" && payload.conversationId.trim()
      ? payload.conversationId.trim()
      : null;

  if (!conversationId) {
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: userData.user.id,
        title: normalizeTitle(payload.title ?? messages[0]?.content),
      })
      .select("id,title,created_at,updated_at")
      .single();

    if (conversationError) {
      return NextResponse.json(
        { message: conversationError.message },
        { status: 403 },
      );
    }

    conversationId = conversation.id;
  }

  const { error: messagesError } = await supabase.from("chat_messages").insert(
    messages.map((message) => ({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
    })),
  );

  if (messagesError) {
    return NextResponse.json({ message: messagesError.message }, { status: 403 });
  }

  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("id,title,created_at,updated_at")
    .eq("id", conversationId)
    .single();

  return NextResponse.json({ conversationId, conversation });
}

export async function DELETE(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { message: "ID chat tidak ditemukan." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseClientWithToken(token);
  const { error } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
