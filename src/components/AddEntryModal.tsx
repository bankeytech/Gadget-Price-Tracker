"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Calendar, DollarSign, Tag, Store, Smartphone, HardDrive, ShieldCheck } from "lucide-react";
import { NewPriceEntryInput } from "@/types";
import {
  POPULAR_PRODUCTS,
  STORAGE_OPTIONS,
  CONDITION_OPTIONS,
  POPULAR_SELLERS,
} from "@/lib/sample-data";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: NewPriceEntryInput) => Promise<void>;
  initialValues?: Partial<NewPriceEntryInput>;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [product, setProduct] = useState("");
  const [storage, setStorage] = useState("128GB");
  const [condition, setCondition] = useState("Excellent");
  const [price, setPrice] = useState("");
  const [seller, setSeller] = useState("eBay");
  const [customSeller, setCustomSeller] = useState("");
  const [dateRecorded, setDateRecorded] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  // Sync initial values if opening modal with prefilled data (e.g. from a group's "Add Price Point")
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setProduct(initialValues.product || "");
        setStorage(initialValues.storage || "128GB");
        setCondition(initialValues.condition || "Excellent");
        setPrice(initialValues.price ? String(initialValues.price) : "");
        if (initialValues.seller) {
          if (POPULAR_SELLERS.includes(initialValues.seller)) {
            setSeller(initialValues.seller);
            setCustomSeller("");
          } else {
            setSeller("Custom");
            setCustomSeller(initialValues.seller);
          }
        }
        setDateRecorded(initialValues.date_recorded || getTodayString());
      } else {
        setProduct("");
        setStorage("128GB");
        setCondition("Excellent");
        setPrice("");
        setSeller("eBay");
        setCustomSeller("");
        setDateRecorded(getTodayString());
      }
      setErrorMessage("");
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!product.trim()) {
      setErrorMessage("Please enter a gadget name or model.");
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage("Please enter a valid price greater than $0.");
      return;
    }

    const finalSeller = seller === "Custom" ? customSeller.trim() : seller.trim();
    if (!finalSeller) {
      setErrorMessage("Please specify the seller or marketplace.");
      return;
    }

    if (!dateRecorded) {
      setErrorMessage("Please select a date.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        product: product.trim(),
        storage,
        condition,
        price: numPrice,
        seller: finalSeller,
        date_recorded: dateRecorded,
      });
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to add price entry";
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuggestions = POPULAR_PRODUCTS.filter(
    (p) => product && p.toLowerCase().includes(product.toLowerCase()) && p.toLowerCase() !== product.toLowerCase()
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-left animate-modal my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              {initialValues?.product ? `Add Price for ${initialValues.product}` : "Add New Price Entry"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Record a resale deal or historic price point
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Product Name */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Gadget / Product Name *
            </label>
            <input
              type="text"
              required
              value={product}
              onChange={(e) => {
                setProduct(e.target.value);
                setShowProductSuggestions(true);
              }}
              onFocus={() => setShowProductSuggestions(true)}
              placeholder="e.g. iPhone 13, MacBook Air M2, Sony WH-1000XM5"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />

            {/* Suggestions Dropdown */}
            {showProductSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-slate-950 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                <div className="p-1.5 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Suggestions
                </div>
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setProduct(suggestion);
                      setShowProductSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Storage & Condition Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Storage */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                Storage Capacity
              </label>
              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none cursor-pointer"
              >
                {STORAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Item Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none cursor-pointer"
              >
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Date Recorded Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="299.99"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-base font-bold text-emerald-400 placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Date Recorded */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Date Recorded *
              </label>
              <input
                type="date"
                required
                value={dateRecorded}
                onChange={(e) => setDateRecorded(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white font-mono outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Seller / Marketplace */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              Seller / Marketplace *
            </label>
            
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {POPULAR_SELLERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSeller(s);
                    setCustomSeller("");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    seller === s
                      ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSeller("Custom")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  seller === "Custom"
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                + Custom Seller
              </button>
            </div>

            {seller === "Custom" && (
              <input
                type="text"
                required
                value={customSeller}
                onChange={(e) => setCustomSeller(e.target.value)}
                placeholder="Enter marketplace or seller name (e.g. Gazelle, Local Store)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white placeholder-slate-500 outline-none"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
