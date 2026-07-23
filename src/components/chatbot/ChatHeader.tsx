import Link from "next/link";
import { AccountMenu } from "./AccountMenu";
import { navItems } from "./chat-data";
import type { ChatConversation } from "./chat-history-types";
import { MobileNavDrawer } from "./MobileNavDrawer";

type ChatHeaderProps = {
  displayName?: string | null;
  isAuthChecking?: boolean;
  isHistoryLoading?: boolean;
  isLoggedIn?: boolean;
  activeConversationId?: string | null;
  conversations?: ChatConversation[];
  onDeleteConversation?: (conversationId: string) => void;
  onNewChat?: () => void;
  onSelectConversation?: (conversationId: string) => void;
};

export function ChatHeader({
  activeConversationId,
  conversations = [],
  displayName,
  isAuthChecking = false,
  isHistoryLoading = false,
  isLoggedIn = false,
  onDeleteConversation,
  onNewChat,
  onSelectConversation,
}: ChatHeaderProps) {
  return (
    <header className="relative z-[100] flex h-16 shrink-0 items-center justify-between border-b border-[#eef0f3] bg-white px-4 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link className="flex items-center lg:hidden" href="/">
          {/* <img src='logo-sahabat-bahasa.png' className="w-14 h-14" ></img> */}
          <span className="text-lg font-semibold tracking-[-0.01em] text-[#de990e]">
            Kamori
          </span>
        </Link>

        <div className="hidden lg:block">
          <p className="text-sm font-medium text-[#7c828a]">Chatbot Pintar</p>
        </div>
      </div>

      <nav className="hidden gap-1 overflow-x-auto md:flex">
        {navItems.map((item) => (
          <Link
            className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-[#5b616e] transition hover:bg-[#eef0f3] hover:text-[#0a0b0d]"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:block">
        {isLoggedIn ? (
          <AccountMenu displayName={displayName} />
        ) : (
          <Link
            className="flex h-10 items-center rounded-full bg-[#de990e] px-5 text-sm font-semibold text-white transition hover:bg-[#bd7d08]"
            href="/login"
          >
            Masuk
          </Link>
        )}
      </div>

      <MobileNavDrawer
        activeConversationId={activeConversationId}
        conversations={conversations}
        displayName={displayName}
        isAuthChecking={isAuthChecking}
        isHistoryLoading={isHistoryLoading}
        isLoggedIn={isLoggedIn}
        onDeleteConversation={onDeleteConversation}
        onNewChat={onNewChat}
        onSelectConversation={onSelectConversation}
      />
    </header>
  );
}
