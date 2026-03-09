export type AgentId = "orchestrator" | "image" | "cooking" | "shopping" | "location";

export interface AgentConfig {
  id: AgentId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface AgentLog {
  agent: AgentId;
  status: "thinking" | "processing" | "done" | "error" | "routed" | "consolidating";
  detail: string;
  timestamp: Date;
}

export interface OrchestratorDecision {
  intent: string;
  agents: AgentId[];
  parallel: boolean;
  summary_for_user: string;
  agent_instructions: Partial<Record<AgentId, string>>;
}

export interface DetectedIngredient {
  name: string;
  category: "Fridge" | "Cupboard" | "Freezer";
  estimated_quantity: string;
  confidence: number;
}

export interface ImageDetectionResult {
  ingredients: DetectedIngredient[];
  notes: string;
}

export interface Recipe {
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time_minutes: number;
  servings: number;
  uses_ingredients: string[];
  missing_ingredients: string[];
  steps: string[];
  tags: string[];
  chef_tip?: string;
}

export interface CookingResult {
  recipes: Recipe[];
}

export interface PricedItem {
  item: string;
  estimated_price: string;
  budget_alternative?: string;
  budget_price?: string;
  available_at: string[];
}

export interface ShoppingResult {
  shopping_list: PricedItem[];
  total_estimated: string;
  budget_total: string;
  money_saving_tips: string[];
}

export interface StoreInfo {
  name: string;
  distance: string;
  delivery_available: boolean;
  collection_available: boolean;
  delivery_fee?: string;
  min_order?: string;
  delivery_time?: string;
  recommendation: string;
}

export interface LocationResult {
  stores: StoreInfo[];
  best_option: {
    method: "collection" | "delivery";
    store: string;
    reason: string;
  };
}

export type AgentResult =
  | { type: "image_results"; data: ImageDetectionResult }
  | { type: "recipes"; data: CookingResult }
  | { type: "shopping"; data: ShoppingResult }
  | { type: "location"; data: LocationResult };

export interface PipelineResult {
  agentChain: AgentId[];
  results: AgentResult[];
}
