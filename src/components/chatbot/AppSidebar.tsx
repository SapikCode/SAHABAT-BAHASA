import Link from "next/link";
import { Loader2, MessageSquareText, Plus, Trash2 } from "lucide-react";
import type { ChatConversation } from "./chat-history-types";

type AppSidebarProps = {
  activeConversationId?: string | null;
  conversations?: ChatConversation[];
  displayName?: string | null;
  isAuthChecking?: boolean;
  isHistoryLoading?: boolean;
  isLoggedIn?: boolean;
  onDeleteConversation?: (conversationId: string) => void;
  onNewChat?: () => void;
  onSelectConversation?: (conversationId: string) => void;
};

export function AppSidebar({
  activeConversationId,
  conversations = [],
  displayName,
  isAuthChecking = false,
  isHistoryLoading = false,
  isLoggedIn = false,
  onDeleteConversation,
  onNewChat,
  onSelectConversation,
}: AppSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-[70] hidden h-screen w-[280px] shrink-0 border-r border-[#eef0f3] bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-[#eef0f3] px-5">
        <Link className="flex items-center" href="/">
          <img src='logo-kamori.webp' className="w-14 h-14 mt-1" ></img>
          <span className="text-lg ml-1 font-semibold tracking-[-0.01em] text-[#2d9184]">
            Kamori
          </span>
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#7c828a]">
            Riwayat chat
          </p>
          <button
            aria-label="Chat baru"
            className="grid size-8 place-items-center rounded-full text-[#5b616e] transition hover:bg-[#f5ead7] hover:text-[#de990e]"
            onClick={onNewChat}
            type="button"
          >
            <Plus aria-hidden="true" size={17} strokeWidth={2.5} />
          </button>
        </div>

        {isAuthChecking || isHistoryLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-[#dee1e6] bg-[#f7f7f7] p-4 text-sm font-medium text-[#5b616e]">
            <Loader2
              aria-hidden="true"
              className="animate-spin"
              size={16}
              strokeWidth={2.4}
            />
            Memuat riwayat chat...
          </div>
        ) : isLoggedIn ? (
          <div className="space-y-1">
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <div
                    className={`group flex items-center gap-2 rounded-2xl border px-3 py-2 transition ${isActive
                      ? "border-[#f0d2a1] bg-[#fff8ec]"
                      : "border-transparent hover:border-[#eef0f3] hover:bg-[#f7f7f7]"
                      }`}
                    key={conversation.id}
                  >
                    <button
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => onSelectConversation?.(conversation.id)}
                      type="button"
                    >
                      <MessageSquareText
                        aria-hidden="true"
                        className="shrink-0 text-[#de990e]"
                        size={16}
                        strokeWidth={2.4}
                      />
                      <span className="truncate text-sm font-medium text-[#0a0b0d]">
                        {conversation.title}
                      </span>
                    </button>
                    <button
                      aria-label={`Hapus ${conversation.title}`}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-[#8a9099] opacity-0 transition hover:bg-white hover:text-[#b42318] group-hover:opacity-100"
                      onClick={() => onDeleteConversation?.(conversation.id)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={15} strokeWidth={2.4} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-[#dee1e6] bg-[#f7f7f7] p-4">
                <p className="text-sm font-semibold text-[#0a0b0d]">
                  {displayName ?? "Pengguna"}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#5b616e]">
                  Riwayat chat baru akan muncul setelah kamu mulai bertanya.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#dee1e6] bg-[#f7f7f7] p-4">
            <p className="text-sm font-semibold text-[#0a0b0d]">
              Login untuk menyimpan riwayat.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5b616e]">
              Kamu tetap bisa bertanya, tetapi chat sebelumnya baru tersimpan
              setelah masuk.
            </p>
            <Link
              className="mt-4 inline-flex h-10 items-center rounded-full bg-[#0a0b0d] px-4 text-sm font-semibold text-white"
              href="/login"
            >
              Masuk
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
