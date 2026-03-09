import { AgentConfig, AgentId } from "../types/agents";

export const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
  orchestrator: {
    id: "orchestrator",
    name: "Orchestrator",
    icon: "cpu",
    color: "indigo",
    description: "Routes tasks to specialized agents and consolidates results",
  },
  image: {
    id: "image",
    name: "Image Detection",
    icon: "camera",
    color: "blue",
    description: "Identifies and classifies ingredients from photos",
  },
  cooking: {
    id: "cooking",
    name: "Cooking",
    icon: "chef-hat",
    color: "emerald",
    description: "Recommends recipes and cooking instructions",
  },
  shopping: {
    id: "shopping",
    name: "Shopping",
    icon: "shopping-cart",
    color: "amber",
    description: "Finds missing ingredients with real-world pricing",
  },
  location: {
    id: "location",
    name: "Location",
    icon: "map-pin",
    color: "rose",
    description: "Finds nearby stores with delivery and collection options",
  },
};

export const AGENT_STYLES: Record<AgentId, { badge: string; bg: string; text: string }> = {
  orchestrator: { badge: "bg-indigo-100 text-indigo-700 border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-700" },
  image:        { badge: "bg-blue-100 text-blue-700 border-blue-200",       bg: "bg-blue-50",   text: "text-blue-700" },
  cooking:      { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
  shopping:     { badge: "bg-amber-100 text-amber-700 border-amber-200",    bg: "bg-amber-50",  text: "text-amber-700" },
  location:     { badge: "bg-rose-100 text-rose-700 border-rose-200",       bg: "bg-rose-50",   text: "text-rose-700" },
};

export const PARALLEL_GROUPS: AgentId[][] = [
  ["shopping", "location"],
];

export const AGENT_DEPENDENCIES: Partial<Record<AgentId, AgentId>> = {
  cooking: "image",
};
