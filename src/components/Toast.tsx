"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 animate-modal transition-all ${
            toast.type === "success"
              ? "bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10"
              : toast.type === "error"
              ? "bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-500/10"
              : "bg-slate-900/95 border-sky-500/40 text-sky-300 shadow-sky-500/10"
          }`}
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <h5 className="text-xs font-bold text-white">{toast.title}</h5>
            {toast.message && (
              <p className="text-[11px] text-slate-300 mt-0.5">{toast.message}</p>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
