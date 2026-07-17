"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

type ChatComposerProps = {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
};

export function ChatComposer({
  isLoading,
  onSendMessage,
}: ChatComposerProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || isLoading) {
      return;
    }

    onSendMessage(message);
    setMessage("");
  }

  return (
    <div className="relative z-20 w-full shrink-0 border-t border-transparent bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 md:px-6">
      <form
        className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-[24px] border border-[#dee1e6] bg-white p-2 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="chat-message">
          Tulis pertanyaan
        </label>
        <input
          className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-[#0a0b0d] outline-none placeholder:text-[#7c828a]"
          disabled={isLoading}
          id="chat-message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tulis pertanyaan..."
          type="text"
          value={message}
        />
        <button
          aria-label="Kirim pesan"
          className="grid size-12 place-items-center rounded-full bg-[#de990e] text-white transition hover:bg-[#bd7d08] disabled:cursor-not-allowed disabled:bg-[#d8c1a0]"
          disabled={isLoading || !message.trim()}
          type="submit"
        >
          <Send aria-hidden="true" size={18} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}
