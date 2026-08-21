"use client";

import React, { useState } from "react";
import {
  X,
  TrendingDown,
  TrendingUp,
  Trash2,
  Plus,
  Calendar,
  Store,
  Tag,
  ArrowDownRight,
  Sparkles,
  Layers,
  HardDrive,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { PriceGroup } from "@/types";
import { formatCurrency, formatDate, getConditionBadgeStyles } from "@/lib/data-utils";

interface PriceHistoryModalProps {
  group: PriceGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onQuickAdd: (group: PriceGroup) => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  group,
  isOpen,
  onClose,
  onDeleteEntry,
  onQuickAdd,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen || !group) return null;

  const condStyles = getConditionBadgeStyles(group.condition);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this recorded price point?")) {
      try {
        setDeletingId(id);
        await onDeleteEntry(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Chart data formatting
  const chartData = group.history.map((pt) => ({
    id: pt.id,
    date: pt.date,
    rawDate: pt.rawDate,
    price: pt.price,
    seller: pt.seller,
  }));

  // Min & max for YAxis domain with padding
  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const yMin = Math.max(0, Math.floor(minPrice * 0.9));
  const yMax = Math.ceil(maxPrice * 1.1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-left animate-modal my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {group.product}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <HardDrive className="w-3 h-3 text-slate-400" />
                {group.storage}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium border ${condStyles.bg} ${condStyles.text} ${condStyles.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${condStyles.dot}`} />
                {group.condition}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Historical resale price trends across {group.sellers.join(", ")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          {/* Lowest Recorded Deal */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Lowest Deal
            </span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {formatCurrency(group.cheapestPrice)}
            </div>
            <span className="text-[10px] text-slate-500 truncate block">
              on {group.cheapestEntry.seller}
            </span>
          </div>

          {/* Market Average */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Market Average
            </span>
            <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
              {formatCurrency(group.averagePrice)}
            </div>
            <span className="text-[10px] text-slate-500 block">
              Across all entries
            </span>
          </div>

          {/* Highest Recorded */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Highest Price
            </span>
            <div className="text-lg font-bold font-mono text-slate-300 mt-0.5">
              {formatCurrency(group.highestPrice)}
            </div>
            <span className="text-[10px] text-slate-500 block">
              Recorded peak
            </span>
          </div>

          {/* Price Drop status */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Recent Trend
            </span>
            {group.hasDropped ? (
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" />
                -{group.priceDropPercent}%
              </div>
            ) : (
              <div className="text-lg font-bold font-mono text-slate-300 mt-0.5">
                {group.entries.length > 1 ? "Stable" : "1 Point"}
              </div>
            )}
            <span className="text-[10px] text-slate-500 block">
              {group.totalRecords} total records
            </span>
          </div>
        </div>

        {/* Interactive Recharts Graph */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Price Timeline ($ USD)
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Price
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-slate-500 border-t border-dashed inline-block" /> Avg ({formatCurrency(group.averagePrice)})
              </span>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    fontFamily="JetBrains Mono"
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    fontFamily="JetBrains Mono"
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const diffFromAvg = data.price - group.averagePrice;
                        return (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-mono">
                            <div className="text-base font-bold text-emerald-400">
                              {formatCurrency(data.price)}
                            </div>
                            <div className="text-slate-300 mt-1 font-sans">
                              Seller: <span className="font-semibold text-white">{data.seller}</span>
                            </div>
                            <div className="text-slate-400 text-[11px] font-sans">
                              Date: {formatDate(data.rawDate)}
                            </div>
                            <div
                              className={`text-[11px] mt-1 font-medium ${
                                diffFromAvg < 0 ? "text-emerald-400" : "text-amber-400"
                              }`}
                            >
                              {diffFromAvg < 0
                                ? `${formatCurrency(Math.abs(diffFromAvg))} below average`
                                : diffFromAvg > 0
                                ? `${formatCurrency(diffFromAvg)} above average`
                                : "At average"}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={group.averagePrice}
                    stroke="#64748b"
                    strokeDasharray="4 4"
                    label={{
                      value: "Avg",
                      fill: "#94a3b8",
                      fontSize: 10,
                      position: "insideTopRight",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                    dot={{ r: 4, fill: "#10b981", stroke: "#090d16", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#34d399", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-slate-500">
              No historical chart points yet
            </div>
          )}
        </div>

        {/* Individual Entries Breakdown List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Recorded Price Points ({group.entries.length})
            </h4>
            <button
              onClick={() => onQuickAdd(group)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Price Point
            </button>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800">
            {group.entries
              .slice()
              .reverse()
              .map((entry, idx) => {
                const isLowest = entry.price === group.cheapestPrice;
                return (
                  <div
                    key={entry.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-xs font-mono font-medium text-slate-400">
                        #{group.entries.length - idx}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            {formatCurrency(entry.price)}
                          </span>
                          {isLowest && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Lowest Deal
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Store className="w-3 h-3 text-slate-500" />
                            {entry.seller}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {formatDate(entry.date_recorded)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      title="Delete price point"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
