import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  Bot,
  Loader,
  MoreHorizontal,
  PencilLine,
  UserRound,
  X,
} from "lucide-react";
import { quickPrompts } from "./chat-data";
import { useScrollLock } from "@/hooks/useScrollLock";
import { PT_Serif } from "next/font/google";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatThreadProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  isThreadLoading?: boolean;
  onSubmitCorrection?: (payload: CorrectionPayload) => Promise<void>;
  onQuickPrompt: (prompt: string) => void;
};

export type CorrectionPayload = {
  arti_indonesia: string;
  kata_tolaki: string;
  messageId: string;
};

export const instrumen = PT_Serif({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap'
})



function useTypingText(text: string, shouldAnimate: boolean) {
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? "" : text);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText("");

    let index = 0;
    const timer = window.setInterval(() => {
      index += Math.max(1, Math.ceil(text.length / 140));
      setDisplayedText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [shouldAnimate, text]);

  return displayedText;
}

function EmptyState({ onQuickPrompt }: Pick<ChatThreadProps, "onQuickPrompt">) {
  return (
    <div className="w-full text-center">
      <img
        alt=""
        className="mx-auto h-30 w-30 md:h-47 md:w-47"
        src="/logo-kamori.webp"
      />
      <h1 className={` ${instrumen.className} -mt-6 text-[38px] font-normal leading-none text-[#0a0b0d] md:text-[46px]`}>
        Kamori

      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#5b616e]">
        Tanyakan arti kata, contoh kalimat, ungkapan, pepatah, atau budaya
        Tolaki.
      </p>

      <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
        {quickPrompts.map((prompt) => (
          <button
            className="rounded-2xl border border-[#dee1e6] bg-white px-3 py-3 text-sm font-semibold text-[#0a0b0d] transition hover:border-[#73a920] hover:text-[#73a920]"
            key={prompt}
            onClick={() => onQuickPrompt(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onOpenCorrection,
  shouldAnimate = false,
}: {
  message: ChatMessage;
  onOpenCorrection?: (message: ChatMessage) => void;
  shouldAnimate?: boolean;
}) {
  const [isActionOpen, setIsActionOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);
  const isAssistant = message.role === "assistant";
  const displayedContent = useTypingText(message.content, shouldAnimate);
  const isTyping = shouldAnimate && displayedContent.length < message.content.length;
  const normalizedContent = displayedContent
    .replace(/\*\*\*([^*\n]+?)\*\*\*/g, "**$1**")
    .replace(/\*([^*\n]+?)\*\*/g, "**$1**")
    .replace(/\*\*([^*\n]+?)\*/g, "**$1**");
  const safeContent =
    (normalizedContent.match(/\*\*/g) ?? []).length % 2 === 0
      ? normalizedContent
      : normalizedContent.replace(/\*\*/g, "");
  const contentParts = safeContent.split(/(\*\*[^*\n]+?\*\*)/g);

  useEffect(() => {
    if (!isActionOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        actionRef.current &&
        !actionRef.current.contains(target)
      ) {
        setIsActionOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isActionOpen]);

  return (
    <article
      className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant ? (
        <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-[#f5ead7] text-[#de990e]">
          <Bot aria-hidden="true" size={18} strokeWidth={2.4} />
        </span>
      ) : null}

      <div className={`flex max-w-[86%] flex-col ${isAssistant ? "items-start" : "items-end"}`}>
        <div
          className={`rounded-[22px] px-5 py-4 text-sm leading-7 ${isAssistant
            ? "border border-[#dee1e6] bg-white text-[#0a0b0d]"
            : "bg-[#de990e] text-white"
            }`}
        >
          <p className="whitespace-pre-wrap">
            {contentParts.map((part, index) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
              }

              return <span key={index}>{part.replace(/\*/g, "")}</span>;
            })}
            {isTyping ? (
              <span className="ml-0.5 inline-block h-4 w-1 translate-y-0.5 animate-pulse rounded-full bg-[#de990e]" />
            ) : null}
          </p>
        </div>

        {isAssistant && !isTyping ? (
          <div className="relative mt-1" ref={actionRef}>
            <button
              aria-label="Aksi pesan"
              className="group grid size-8 place-items-center rounded-full text-[#8a9099] transition hover:bg-[#f5ead7] hover:text-[#de990e]"
              onClick={() => setIsActionOpen((current) => !current)}
              title="Aksi pesan"
              type="button"
            >
              <MoreHorizontal aria-hidden="true" size={18} strokeWidth={2.4} />
              <span className="pointer-events-none absolute left-9 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#0a0b0d] px-3 py-1 text-xs font-medium text-white shadow-lg group-hover:block">
                Aksi
              </span>
            </button>

            {isActionOpen ? (
              <div className="absolute bottom-9 left-0 z-[60] min-w-36 rounded-2xl border border-[#eef0f3] bg-white p-1 shadow-[0_14px_36px_rgba(10,11,13,0.12)]">
                <button
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#0a0b0d] transition hover:bg-[#f7f7f7]"
                  onClick={() => {
                    setIsActionOpen(false);
                    onOpenCorrection?.(message);
                  }}
                  title="Benarkan jawaban"
                  type="button"
                >
                  <PencilLine
                    aria-hidden="true"
                    className="text-[#de990e]"
                    size={16}
                    strokeWidth={2.4}
                  />
                  Benarkan
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {!isAssistant ? (
        <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-[#eef0f3] text-[#0a0b0d]/35">
          <UserRound aria-hidden="true" size={18} strokeWidth={2.4} />
        </span>
      ) : null}
    </article>
  );
}

function CorrectionModal({
  isSubmitting,
  message,
  onClose,
  onSubmit,
}: {
  isSubmitting: boolean;
  message: ChatMessage;
  onClose: () => void;
  onSubmit: (payload: CorrectionPayload) => Promise<void>;
}) {
  const [artiIndonesia, setArtiIndonesia] = useState("");
  const [kataTolaki, setKataTolaki] = useState("");

  useScrollLock(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      arti_indonesia: artiIndonesia,
      kata_tolaki: kataTolaki,
      messageId: message.id,
    });
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/45 px-4 py-6">
      <form
        className="w-full max-w-lg rounded-[26px] border border-[#efe6d7] bg-white p-5 shadow-[0_24px_80px_rgba(10,11,13,0.2)]"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.06em] text-[#de990e]">
              Benarkan jawaban
            </p>
          </div>
          <button
            aria-label="Tutup modal"
            className="grid size-10 place-items-center rounded-full bg-[#f7f7f7] text-[#5b616e] transition hover:text-[#0a0b0d]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[#0a0b0d]">
              Kata/kalimat dalam Tolaki
            </span>
            <textarea
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[#dee1e6] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
              onChange={(event) => setKataTolaki(event.target.value)}
              placeholder="Contoh: Inaku..."
              required
              value={kataTolaki}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#0a0b0d]">
              Arti kata/kalimat
            </span>
            <textarea
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[#dee1e6] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#de990e] focus:ring-4 focus:ring-[#de990e]/10"
              onChange={(event) => setArtiIndonesia(event.target.value)}
              placeholder="Contoh: Saya..."
              required
              value={artiIndonesia}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-full border border-[#dee1e6] px-5 text-sm font-bold text-[#5b616e] transition hover:bg-[#f7f7f7]"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="flex h-11 items-center justify-center rounded-full bg-[#de990e] px-5 text-sm font-bold text-white transition hover:bg-[#bd7d08] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan koreksi"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ChatThread({
  messages,
  isLoading,
  isThreadLoading = false,
  onSubmitCorrection,
  onQuickPrompt,
}: ChatThreadProps) {
  const isEmpty = messages.length === 0;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [correctionMessage, setCorrectionMessage] = useState<ChatMessage | null>(
    null,
  );
  const [isCorrectionSubmitting, setIsCorrectionSubmitting] = useState(false);
  const lastAssistantMessageId = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "assistant")?.id,
    [messages],
  );

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }

  useEffect(() => {
    scrollToBottom(messages.length <= 1 ? "auto" : "smooth");
  }, [messages.length, isLoading]);

  function handleScroll() {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 160);
  }

  async function handleSubmitCorrection(payload: CorrectionPayload) {
    if (!onSubmitCorrection) {
      return;
    }

    setIsCorrectionSubmitting(true);

    try {
      await onSubmitCorrection(payload);
      setCorrectionMessage(null);
    } finally {
      setIsCorrectionSubmitting(false);
    }
  }

  return (
    <div
      className="relative flex min-h-0 flex-1 overflow-y-auto"
      onScroll={handleScroll}
      ref={scrollContainerRef}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 md:px-6">
        {isThreadLoading ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="flex items-center gap-3 rounded-full border border-[#eef0f3] bg-white px-5 py-3 text-sm font-medium text-[#5b616e] shadow-[0_10px_32px_rgba(10,11,13,0.06)]">
              <Loader size={18} className="animate-spin" />
              Sedang memuat chat...
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <EmptyState onQuickPrompt={onQuickPrompt} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 py-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onOpenCorrection={setCorrectionMessage}
                shouldAnimate={
                  message.role === "assistant" &&
                  message.id === lastAssistantMessageId &&
                  !isLoading
                }
              />
            ))}

            {isLoading ? (
              <article className="flex gap-3">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-[#f5ead7] text-[#de990e]">
                  <Bot aria-hidden="true" size={18} strokeWidth={2.4} />
                </span>
                <div className="px-1 py-4 text-sm font-normal animate-pulse text-[#5b616e]/55">
                  Tunggu Sebentar...
                </div>
              </article>
            ) : null}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {showScrollButton ? (
        <button
          aria-label="Scroll ke pesan terbaru"
          className="fixed bottom-24 left-1/2 z-30 grid size-10 -translate-x-1/2 place-items-center rounded-full border border-[#dee1e6] bg-white text-[#0a0b0d] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition hover:border-[#de990e] hover:text-[#de990e] lg:left-[calc(50%+140px)]"
          onClick={() => scrollToBottom()}
          type="button"
        >
          <ArrowDown aria-hidden="true" size={18} strokeWidth={2.5} />
        </button>
      ) : null}

      {correctionMessage ? (
        <CorrectionModal
          isSubmitting={isCorrectionSubmitting}
          message={correctionMessage}
          onClose={() => {
            if (!isCorrectionSubmitting) {
              setCorrectionMessage(null);
            }
          }}
          onSubmit={handleSubmitCorrection}
        />
      ) : null}
    </div>
  );
}
