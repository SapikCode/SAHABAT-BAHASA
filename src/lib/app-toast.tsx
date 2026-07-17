"use client";

import toast from "react-hot-toast";
import { X } from "lucide-react";

type AppToastType = "error" | "success";

type AppToastOptions = {
  message: string;
  title?: string;
  type?: AppToastType;
};

const toastStyles: Record<
  AppToastType,
  {
    bar: string;
    border: string;
    defaultTitle: string;
  }
> = {
  error: {
    bar: "bg-[#de990e]",
    border: "border-[#f0d2a1]",
    defaultTitle: "Terjadi kendala",
  },
  success: {
    bar: "bg-[#73a920]",
    border: "border-[#dcebc4]",
    defaultTitle: "Berhasil",
  },
};

export function showAppToast({
  message,
  title,
  type = "error",
}: AppToastOptions) {
  const style = toastStyles[type];

  toast.custom(
    (toastState) => (
      <div
        className={`flex w-[min(92vw,420px)] items-start gap-3 rounded-[18px] border ${style.border} bg-white px-4 py-3 text-[#0a0b0d] shadow-[0_16px_48px_rgba(10,11,13,0.14)] transition ${
          toastState.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <span className={`mt-1 h-8 w-1 shrink-0 rounded-full ${style.bar}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title ?? style.defaultTitle}</p>
          <p className="mt-1 text-sm leading-6 text-[#5b616e]">{message}</p>
        </div>
        <button
          aria-label="Tutup notifikasi"
          className="grid size-8 shrink-0 place-items-center rounded-full text-[#7c828a] transition hover:bg-[#f7f7f7] hover:text-[#0a0b0d]"
          onClick={() => toast.dismiss(toastState.id)}
          type="button"
        >
          <X aria-hidden="true" size={16} strokeWidth={2.4} />
        </button>
      </div>
    ),
    {
      duration: type === "success" ? 3600 : 4800,
    },
  );
}

export function showErrorToast(message: string, title?: string) {
  showAppToast({ message, title, type: "error" });
}

export function showSuccessToast(message: string, title?: string) {
  showAppToast({ message, title, type: "success" });
}
