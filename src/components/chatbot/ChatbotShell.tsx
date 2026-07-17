"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppSidebar } from "./AppSidebar";
import { ChatComposer } from "./ChatComposer";
import { ChatHeader } from "./ChatHeader";
import {
  ChatThread,
  type ChatMessage,
  type CorrectionPayload,
} from "./ChatThread";
import type { ChatConversation } from "./chat-history-types";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { createClientId } from "@/lib/client-id";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

function showChatErrorToast(message: string) {
  showErrorToast(message, "Chat belum bisa merespons");
}

export function ChatbotShell() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null,
  );
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const loadingHistoryUserIdRef = useRef<string | null>(null);
  const loadedHistoryUserIdRef = useRef<string | null>(null);
  const isLoggedIn = Boolean(userId);

  const getAccessToken = useCallback(async () => {
    if (!supabase) {
      return null;
    }

    const { data } = await supabase.auth.getSession();

    return data.session?.access_token ?? null;
  }, [supabase]);

  const loadConversations = useCallback(async (nextUserId: string) => {
    if (
      loadedHistoryUserIdRef.current === nextUserId ||
      loadingHistoryUserIdRef.current === nextUserId
    ) {
      return;
    }

    loadingHistoryUserIdRef.current = nextUserId;
    const token = await getAccessToken();

    if (!token) {
      loadingHistoryUserIdRef.current = null;
      setConversations([]);
      return;
    }

    setIsHistoryLoading(true);

    try {
      const response = await fetch("/api/chat/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = (await response.json()) as {
        conversations?: ChatConversation[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Gagal memuat riwayat chat.");
      }

      setConversations(data.conversations ?? []);
      loadedHistoryUserIdRef.current = nextUserId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memuat riwayat chat.";
      showChatErrorToast(message);
    } finally {
      loadingHistoryUserIdRef.current = null;
      setIsHistoryLoading(false);
    }
  }, [getAccessToken]);

  const saveHistoryMessages = useCallback(
    async ({
      conversationId,
      historyMessages,
      title,
    }: {
      conversationId: string | null;
      historyMessages: Pick<ChatMessage, "role" | "content">[];
      title?: string;
    }) => {
      const token = await getAccessToken();

      if (!token) {
        return null;
      }

      const response = await fetch("/api/chat/history", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          messages: historyMessages,
          title,
        }),
      });
      const data = (await response.json()) as {
        conversation?: ChatConversation;
        conversationId?: string;
        message?: string;
      };

      if (!response.ok || !data.conversationId) {
        throw new Error(data.message ?? "Riwayat chat belum tersimpan.");
      }

      setConversations((currentConversations) => {
        const nextConversation =
          data.conversation ??
          currentConversations.find(
            (conversation) => conversation.id === data.conversationId,
          );

        if (!nextConversation) {
          return currentConversations;
        }

        return [
          nextConversation,
          ...currentConversations.filter(
            (conversation) => conversation.id !== nextConversation.id,
          ),
        ];
      });

      return data.conversationId;
    },
    [getAccessToken],
  );

  const syncAuthSession = useCallback(
    (session: Session | null) => {
      const user = session?.user;

      if (!user) {
        loadingHistoryUserIdRef.current = null;
        loadedHistoryUserIdRef.current = null;
        setActiveConversationId(null);
        setConversations([]);
        setDisplayName(null);
        setIsAuthChecking(false);
        setMessages([]);
        setUserId(null);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const name =
        metadata.display_name ??
        metadata.full_name ??
        metadata.name ??
        user.email?.replace("@sahabat-bahasa.local", "");

      setDisplayName(name ? String(name) : null);
      setUserId(user.id);
      setIsAuthChecking(false);
      void loadConversations(user.id);
    },
    [loadConversations],
  );

  useEffect(() => {
    if (!supabase) {
      setIsAuthChecking(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        syncAuthSession(data.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        syncAuthSession(session);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase, syncAuthSession]);

  function startNewChat() {
    if (isLoading) {
      return;
    }

    setActiveConversationId(null);
    setMessages([]);
  }

  async function loadConversation(conversationId: string) {
    if (isLoading) {
      return;
    }

    const token = await getAccessToken();

    if (!token) {
      showChatErrorToast("Silakan login untuk membuka riwayat chat.");
      return;
    }

    setIsConversationLoading(true);
    setMessages([]);

    try {
      const response = await fetch(
        `/api/chat/history?conversationId=${encodeURIComponent(conversationId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = (await response.json()) as {
        messages?: Array<{
          content: string;
          role: "user" | "assistant";
        }>;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Gagal membuka riwayat chat.");
      }

      setMessages(
        (data.messages ?? []).map((message) => ({
          id: createClientId("chat"),
          role: message.role,
          content: message.content,
        })),
      );
      setActiveConversationId(conversationId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal membuka riwayat chat.";
      showChatErrorToast(message);
    } finally {
      setIsConversationLoading(false);
    }
  }

  async function deleteConversation(conversationId: string) {
    const token = await getAccessToken();

    if (!token) {
      showChatErrorToast("Silakan login untuk menghapus riwayat chat.");
      return;
    }

    try {
      const response = await fetch(
        `/api/chat/history?conversationId=${encodeURIComponent(conversationId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Gagal menghapus riwayat chat.");
      }

      setConversations((currentConversations) =>
        currentConversations.filter(
          (conversation) => conversation.id !== conversationId,
        ),
      );

      if (activeConversationId === conversationId) {
        startNewChat();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus riwayat chat.";
      showChatErrorToast(message);
    }
  }

  async function submitCorrection(payload: CorrectionPayload) {
    const token = await getAccessToken();

    if (!token) {
      showErrorToast(
        "Silakan login untuk mengirim koreksi ke kamus chatbot.",
        "Koreksi belum terkirim",
      );
      throw new Error("Login diperlukan.");
    }

    const response = await fetch("/api/chat/corrections", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        arti_indonesia: payload.arti_indonesia,
        kata_tolaki: payload.kata_tolaki,
        message_id: payload.messageId,
      }),
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      const message = data.message ?? "Gagal mengirim koreksi.";
      showErrorToast(message, "Koreksi belum terkirim");
      throw new Error(message);
    }

    showSuccessToast(
      "Koreksi tersimpan dan akan dipakai sebagai data kamus chatbot.",
      "Koreksi diterima",
    );
  }

  async function sendMessage(content: string) {
    const trimmedContent = content.trim();

    if (!trimmedContent || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createClientId("chat"),
      role: "user",
      content: trimmedContent,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setIsLoading(true);

    try {
      let conversationId = activeConversationId;

      try {
        const savedConversationId = await saveHistoryMessages({
          conversationId,
          historyMessages: [
            {
              role: userMessage.role,
              content: userMessage.content,
            },
          ],
          title: trimmedContent,
        });

        if (savedConversationId) {
          conversationId = savedConversationId;
          setActiveConversationId(savedConversationId);
        }
      } catch (historyError) {
        const message =
          historyError instanceof Error
            ? historyError.message
            : "Riwayat chat belum tersimpan.";
        showChatErrorToast(message);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      const data = (await response.json()) as {
        answer?: string;
        error?: string;
      };

      const answer = data.answer;

      if (!response.ok || !answer) {
        throw new Error(data.error ?? "Jawaban belum tersedia.");
      }

      const assistantMessage: ChatMessage = {
        id: createClientId("chat"),
        role: "assistant",
        content: answer,
      };

      setIsLoading(false);
      setMessages((currentMessages) => [...currentMessages, assistantMessage]);

      if (conversationId) {
        try {
          await saveHistoryMessages({
            conversationId,
            historyMessages: [
              {
                role: assistantMessage.role,
                content: assistantMessage.content,
              },
            ],
          });
        } catch (historyError) {
          const message =
            historyError instanceof Error
              ? historyError.message
              : "Riwayat jawaban belum tersimpan.";
          showChatErrorToast(message);
        }
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Gagal menghubungi chatbot.";
      showChatErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-white text-[#0a0b0d]">
      <AppSidebar
        activeConversationId={activeConversationId}
        conversations={conversations}
        displayName={displayName}
        isAuthChecking={isAuthChecking}
        isHistoryLoading={isHistoryLoading}
        isLoggedIn={isLoggedIn}
        onDeleteConversation={deleteConversation}
        onNewChat={startNewChat}
        onSelectConversation={loadConversation}
      />
      <section className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-white lg:ml-[280px]">
        <ChatHeader
          activeConversationId={activeConversationId}
          conversations={conversations}
          displayName={displayName}
          isAuthChecking={isAuthChecking}
          isHistoryLoading={isHistoryLoading}
          isLoggedIn={isLoggedIn}
          onDeleteConversation={deleteConversation}
          onNewChat={startNewChat}
          onSelectConversation={loadConversation}
        />
        <ChatThread
          isLoading={isLoading}
          isThreadLoading={isConversationLoading}
          messages={messages}
          onQuickPrompt={sendMessage}
          onSubmitCorrection={submitCorrection}
        />
        <ChatComposer isLoading={isLoading} onSendMessage={sendMessage} />
      </section>
    </main>
  );
}
