"use client";

import React, { useState } from "react";
import { X, Database, Check, Copy, Terminal, ExternalLink, ShieldAlert, Sparkles } from "lucide-react";

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  isConfigured,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 1. Create the price_entries table
create table if not exists price_entries (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  storage text not null default 'N/A',
  condition text not null default 'Good',
  price numeric not null,
  seller text not null,
  date_recorded date not null default current_date,
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table price_entries enable row level security;

-- 3. Create open access policies for public tracker demo
create policy "Allow public read access"
  on price_entries for select
  using (true);

create policy "Allow public insert access"
  on price_entries for insert
  with check (true);

create policy "Allow public delete access"
  on price_entries for delete
  using (true);
`;

  const envCode = `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envCode);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-left animate-modal my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isConfigured
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Supabase Database Setup
              </h3>
              <p className="text-xs text-slate-400">
                {isConfigured
                  ? "Supabase is active and connected"
                  : "Currently running in persistent Local Storage fallback mode"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        <div className="mt-4">
          {isConfigured ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-semibold">Connected to Supabase!</span> All mutations and price data are synced directly to your live Supabase `price_entries` table.
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Local Storage Mode Active:</span> You can use the app immediately with full add, delete, filter, and chart features. To connect your own Supabase project, follow the 2 steps below.
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-4 mt-5 text-xs text-slate-300">
          {/* Step 1: SQL Schema */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center font-mono text-[11px]">
                  1
                </span>
                Run SQL Schema in Supabase SQL Editor:
              </span>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition-colors"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedSql ? "Copied!" : "Copy SQL"}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
              <code>{sqlCode}</code>
            </pre>
          </div>

          {/* Step 2: Environment Variables */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center font-mono text-[11px]">
                  2
                </span>
                Add credentials to <code className="text-emerald-400 font-mono">.env.local</code>:
              </span>
              <button
                onClick={handleCopyEnv}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition-colors"
              >
                {copiedEnv ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedEnv ? "Copied!" : "Copy Format"}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
              <code>{envCode}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
