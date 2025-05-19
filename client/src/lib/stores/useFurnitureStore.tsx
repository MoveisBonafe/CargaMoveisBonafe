import { create } from "zustand";
import { FurnitureItem, FurnitureItemPosition, StackingRule } from "../../types";

interface FurnitureState {
  items: FurnitureItem[];
  placedItems: FurnitureItemPosition[];
  stackingRules: StackingRule[];
  
  // Item management
  addItem: (item: FurnitureItem) => void;
  removeItem: (id: string) => void;
  resetItems: () => void;
  
  // Placement management
  setPlacedItems: (items: FurnitureItemPosition[]) => void;
  resetPlacedItems: () => void;
  
  // Stacking rules
  addStackingRule: (item1Id: string, item2Id: string) => void;
  removeStackingRule: (item1Id: string, item2Id: string) => void;
  getStackingRules: () => StackingRule[];
}

// Sample furniture items
const SAMPLE_ITEMS: FurnitureItem[] = [
  {
    id: "sofa",
    name: "Sofá",
    width: 2.5,
    height: 1,
    depth: 1,
    weight: 80, // 80kg
    color: "#3b82f6"
  },
  {
    id: "table",
    name: "Mesa de Jantar",
    width: 2,
    height: 0.8,
    depth: 1.2,
    weight: 45, // 45kg
    color: "#10b981"
  },
  {
    id: "chair",
    name: "Cadeira",
    width: 0.6,
    height: 0.9,
    depth: 0.6,
    weight: 8, // 8kg
    color: "#f59e0b"
  },
  {
    id: "bed",
    name: "Estrutura de Cama",
    width: 2,
    height: 0.4,
    depth: 1.8,
    weight: 65, // 65kg
    color: "#8b5cf6"
  }
];

// Sample stacking rules
const SAMPLE_STACKING_RULES: StackingRule[] = [
  {
    item1Id: "table",
    item2Id: "chair"
  }
];

export const useFurnitureStore = create<FurnitureState>((set, get) => ({
  items: SAMPLE_ITEMS,
  placedItems: [],
  stackingRules: SAMPLE_STACKING_RULES,
  
  addItem: (item: FurnitureItem) => {
    set((state) => ({
      items: [...state.items, item]
    }));
  },
  
  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      placedItems: state.placedItems.filter((item) => item.id !== id),
      stackingRules: state.stackingRules.filter(
        (rule) => rule.item1Id !== id && rule.item2Id !== id
      )
    }));
  },
  
  resetItems: () => {
    set({
      items: SAMPLE_ITEMS,
      placedItems: [],
      stackingRules: SAMPLE_STACKING_RULES
    });
  },
  
  setPlacedItems: (items: FurnitureItemPosition[]) => {
    set({ placedItems: items });
  },
  
  resetPlacedItems: () => {
    set({ placedItems: [] });
  },
  
  addStackingRule: (item1Id: string, item2Id: string) => {
    // Don't add duplicate rules
    const exists = get().stackingRules.some(
      (rule) => rule.item1Id === item1Id && rule.item2Id === item2Id
    );
    
    if (!exists) {
      set((state) => ({
        stackingRules: [
          ...state.stackingRules,
          { item1Id, item2Id }
        ]
      }));
    }
  },
  
  removeStackingRule: (item1Id: string, item2Id: string) => {
    set((state) => ({
      stackingRules: state.stackingRules.filter(
        (rule) => !(rule.item1Id === item1Id && rule.item2Id === item2Id)
      )
    }));
  },
  
  getStackingRules: () => {
    return get().stackingRules;
  }
}));
