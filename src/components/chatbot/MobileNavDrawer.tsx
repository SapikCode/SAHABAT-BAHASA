"use client";

import {
  BookOpen,
  CircleQuestionMark,
  Clapperboard,
  LockKeyhole,
  Loader2,
  Menu,
  MessageSquareText,
  MessageSquareQuote,
  Plus,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccountMenu } from "./AccountMenu";
import { navItems } from "./chat-data";
import type { ChatConversation } from "./chat-history-types";

const navIcons: Record<string, LucideIcon> = {
  Kosakata: BookOpen,
  Ungkapan: MessageSquareQuote,
  "Cerita Budaya": Clapperboard,
  Kuis: CircleQuestionMark,
  Profil: UserRound,
};

type MobileNavDrawerProps = {
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

export function MobileNavDrawer({
  activeConversationId,
  conversations = [],
  displayName,
  isAuthChecking = false,
  isHistoryLoading = false,
  isLoggedIn = false,
  onDeleteConversation,
  onNewChat,
  onSelectConversation,
}: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        className="flex h-10 items-center gap-2 rounded-full bg-[#eef0f3] px-4 text-sm font-semibold text-[#0a0b0d]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu aria-hidden="true" size={18} strokeWidth={2.4} />
        Menu
      </button>

      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[80] bg-black/45 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        aria-label="Navigasi mobile"
        className={`fixed bottom-0 right-0 top-0 z-[90] flex w-[82vw] max-w-[340px] flex-col bg-white shadow-[-16px_0_40px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#eef0f3] px-5">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-[#de990e]">Menu</span>
          </div>
          <button
            aria-label="Tutup menu"
            className="grid size-10 place-items-center rounded-full bg-[#eef0f3] text-base font-semibold leading-none text-[#0a0b0d]"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="border-b border-[#eef0f3] p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#7c828a]">
                Riwayat chat
              </p>
              <button
                aria-label="Chat baru"
                className="grid size-8 place-items-center rounded-full text-[#5b616e] transition hover:bg-[#f5ead7] hover:text-[#de990e]"
                onClick={() => {
                  onNewChat?.();
                  setIsOpen(false);
                }}
                type="button"
              >
                <Plus aria-hidden="true" size={17} strokeWidth={2.5} />
              </button>
            </div>

            {isAuthChecking || isHistoryLoading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-[#dee1e6] bg-[#f7f7f7] p-3 text-sm font-medium text-[#5b616e]">
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
                        className={`group flex items-center gap-2 rounded-2xl border px-3 py-2 transition ${
                          isActive
                            ? "border-[#f0d2a1] bg-[#fff8ec]"
                            : "border-transparent hover:border-[#eef0f3] hover:bg-[#f7f7f7]"
                        }`}
                        key={conversation.id}
                      >
                        <button
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          onClick={() => {
                            onSelectConversation?.(conversation.id);
                            setIsOpen(false);
                          }}
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
                          className="grid size-8 shrink-0 place-items-center rounded-full text-[#8a9099] transition hover:bg-white hover:text-[#b42318]"
                          onClick={() => onDeleteConversation?.(conversation.id)}
                          type="button"
                        >
                          <Trash2
                            aria-hidden="true"
                            size={15}
                            strokeWidth={2.4}
                          />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-[#dee1e6] bg-[#f7f7f7] p-3">
                    <p className="text-sm font-semibold text-[#0a0b0d]">
                      Belum ada riwayat.
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[#5b616e]">
                      Mulai chat baru untuk menyimpannya.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#dee1e6] bg-[#f7f7f7] p-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f5ead7] text-[#de990e]">
                    <LockKeyhole aria-hidden="true" size={17} strokeWidth={2.2} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#0a0b0d]">
                      Login untuk simpan riwayat.
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[#5b616e]">
                      Chat tetap bisa dipakai tanpa login.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-[#7c828a]">
            Menu belajar
          </p>
          {navItems.map((item) => {
            const Icon = navIcons[item.label] ?? BookOpen;

            return (
              <Link
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-[#0a0b0d] transition hover:bg-[#f7f7f7]"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#de990e]/80 text-[#f5ead7]">
                  <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#eef0f3] p-4">
          {isLoggedIn ? (
            <div className="flex justify-center">
              <AccountMenu
                displayName={displayName}
                onNavigate={() => setIsOpen(false)}
              />
            </div>
          ) : (
            <Link
              className="flex h-11 items-center justify-center rounded-full bg-[#de990e] text-sm font-semibold text-white transition hover:bg-[#bd7d08]"
              href="/login"
              onClick={() => setIsOpen(false)}
            >
              Masuk
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
