export interface PriceEntry {
  id: string;
  product: string;
  storage: string;
  condition: string;
  price: number;
  seller: string;
  date_recorded: string; // YYYY-MM-DD
  created_at?: string;
}

export interface NewPriceEntryInput {
  product: string;
  storage: string;
  condition: string;
  price: number;
  seller: string;
  date_recorded: string;
}

export interface PricePoint {
  id: string;
  date: string;
  rawDate: string;
  price: number;
  seller: string;
  condition: string;
}

export interface PriceGroup {
  key: string; // `${product}-${storage}-${condition}`
  product: string;
  storage: string;
  condition: string;
  entries: PriceEntry[];
  
  // Computed statistics
  cheapestEntry: PriceEntry;
  cheapestPrice: number;
  averagePrice: number;
  latestEntry: PriceEntry;
  latestPrice: number;
  previousPrice: number | null;
  highestPrice: number;
  
  // Price drop detection
  hasDropped: boolean;
  priceDropAmount: number; // positive if dropped (e.g. 50 saved)
  priceDropPercent: number; // positive percentage (e.g. 12.5%)
  
  // History for charts
  history: PricePoint[];
  sellers: string[];
  totalRecords: number;
  lastUpdated: string;
}

export type SortOption =
  | "drop-desc"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "entries-desc"
  | "recent-desc";

export interface FilterState {
  search: string;
  condition: string;
  storage: string;
  seller: string;
  sortBy: SortOption;
  viewMode: "grid" | "table";
}
