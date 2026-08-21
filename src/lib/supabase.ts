import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PriceEntry, NewPriceEntryInput } from "@/types";
import { INITIAL_SAMPLE_ENTRIES } from "./sample-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
  try {
    return url.startsWith("https://") && url.includes(".supabase.co");
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project.supabase.co" &&
    supabaseAnonKey !== "your-anon-key" &&
    isValidUrl(supabaseUrl)
);

// Create the Supabase client instance (or a dummy client if not yet configured)
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key"
);

const LOCAL_STORAGE_KEY = "gadget_price_entries_v1";

/**
 * Fetch all price entries, sorted chronologically
 */
export async function fetchPriceEntries(): Promise<{
  data: PriceEntry[];
  isSupabase: boolean;
  error?: string;
}> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("price_entries")
        .select("*")
        .order("date_recorded", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Supabase query error, falling back to local data:", error.message);
        return {
          data: getLocalEntries(),
          isSupabase: false,
          error: error.message,
        };
      }

      if (data && data.length > 0) {
        return {
          data: data.map((item) => ({
            id: String(item.id),
            product: String(item.product),
            storage: String(item.storage),
            condition: String(item.condition),
            price: Number(item.price),
            seller: String(item.seller),
            date_recorded: String(item.date_recorded),
            created_at: item.created_at ? String(item.created_at) : undefined,
          })),
          isSupabase: true,
        };
      }

      // If Supabase table is empty, auto-seed with sample entries so it's not blank
      console.log("Supabase table is empty, seeding initial entries...");
      await seedInitialSupabaseEntries();
      const refetched = await supabase
        .from("price_entries")
        .select("*")
        .order("date_recorded", { ascending: true });

      return {
        data: (refetched.data || INITIAL_SAMPLE_ENTRIES).map((item) => ({
          id: String(item.id),
          product: String(item.product),
          storage: String(item.storage),
          condition: String(item.condition),
          price: Number(item.price),
          seller: String(item.seller),
          date_recorded: String(item.date_recorded),
          created_at: item.created_at ? String(item.created_at) : undefined,
        })),
        isSupabase: true,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn("Supabase fetch exception:", errMsg);
      return {
        data: getLocalEntries(),
        isSupabase: false,
        error: errMsg,
      };
    }
  }

  // Fallback to localStorage or default sample dataset
  return {
    data: getLocalEntries(),
    isSupabase: false,
  };
}

/**
 * Insert a new price entry
 */
export async function insertPriceEntry(
  input: NewPriceEntryInput
): Promise<{ data: PriceEntry | null; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("price_entries")
        .insert([
          {
            product: input.product.trim(),
            storage: input.storage.trim(),
            condition: input.condition.trim(),
            price: Number(input.price),
            seller: input.seller.trim(),
            date_recorded: input.date_recorded,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: {
          id: String(data.id),
          product: String(data.product),
          storage: String(data.storage),
          condition: String(data.condition),
          price: Number(data.price),
          seller: String(data.seller),
          date_recorded: String(data.date_recorded),
          created_at: data.created_at ? String(data.created_at) : undefined,
        },
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Supabase insert error:", errMsg);
      // Fallback saving locally if Supabase fails
      const fallbackEntry: PriceEntry = {
        id: "local-" + Date.now(),
        ...input,
        created_at: new Date().toISOString(),
      };
      saveLocalEntry(fallbackEntry);
      return { data: fallbackEntry, error: errMsg };
    }
  }

  // Local storage mode
  const newEntry: PriceEntry = {
    id: "local-" + Date.now(),
    ...input,
    created_at: new Date().toISOString(),
  };
  saveLocalEntry(newEntry);
  return { data: newEntry };
}

/**
 * Delete a price entry by id
 */
export async function deletePriceEntry(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && !id.startsWith("local-") && !id.startsWith("sample-")) {
    try {
      const { error } = await supabase.from("price_entries").delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      deleteLocalEntry(id);
      return { success: false, error: errMsg };
    }
  }

  deleteLocalEntry(id);
  return { success: true };
}

/**
 * Seed Supabase with initial sample entries
 */
async function seedInitialSupabaseEntries() {
  try {
    const payload = INITIAL_SAMPLE_ENTRIES.map((entry) => ({
      product: entry.product,
      storage: entry.storage,
      condition: entry.condition,
      price: entry.price,
      seller: entry.seller,
      date_recorded: entry.date_recorded,
    }));
    await supabase.from("price_entries").insert(payload);
  } catch (err) {
    console.warn("Could not auto-seed Supabase entries:", err);
  }
}

/**
 * Helper: Local Storage management
 */
function getLocalEntries(): PriceEntry[] {
  if (typeof window === "undefined") {
    return INITIAL_SAMPLE_ENTRIES;
  }
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ENTRIES));
      return INITIAL_SAMPLE_ENTRIES;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_ENTRIES;
  } catch {
    return INITIAL_SAMPLE_ENTRIES;
  }
}

function saveLocalEntry(entry: PriceEntry) {
  if (typeof window === "undefined") return;
  const entries = getLocalEntries();
  const updated = [...entries, entry];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}

function deleteLocalEntry(id: string) {
  if (typeof window === "undefined") return;
  const entries = getLocalEntries();
  const updated = entries.filter((e) => e.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}

export function resetLocalEntriesToSample(): PriceEntry[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ENTRIES));
  }
  return INITIAL_SAMPLE_ENTRIES;
}
