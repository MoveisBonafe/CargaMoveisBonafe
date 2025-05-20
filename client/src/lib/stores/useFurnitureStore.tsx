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
  updateItem: (id: string, updatedItem: Partial<FurnitureItem>) => void;
  
  // Placement management
  setPlacedItems: (items: FurnitureItemPosition[]) => void;
  resetPlacedItems: () => void;
  
  // Stacking rules
  addStackingRule: (item1Id: string, item2Id: string) => void;
  removeStackingRule: (item1Id: string, item2Id: string) => void;
  getStackingRules: () => StackingRule[];
  
  // Local storage
  saveItemsToLocalStorage: () => void;
  loadItemsFromLocalStorage: () => void;
  
  // Importação/Exportação
  importItemsByCode: (codes: string[]) => FurnitureItem[];
  findItemByCode: (code: string) => FurnitureItem | undefined;
}

// Sample furniture items
const SAMPLE_ITEMS: FurnitureItem[] = [
  {
    id: "sofa",
    code: "SOF-001",
    name: "Sofá",
    width: 2.5,
    height: 1,
    depth: 1,
    weight: 80, // 80kg
    color: "#3b82f6"
  },
  {
    id: "table",
    code: "MES-001",
    name: "Mesa de Jantar",
    width: 2,
    height: 0.8,
    depth: 1.2,
    weight: 45, // 45kg
    color: "#10b981"
  },
  {
    id: "chair",
    code: "CAD-001",
    name: "Cadeira",
    width: 0.6,
    height: 0.9,
    depth: 0.6,
    weight: 8, // 8kg
    color: "#f59e0b"
  },
  {
    id: "bed",
    code: "CAM-001",
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
    
    // Salvar automaticamente no localStorage após adicionar um item
    setTimeout(() => get().saveItemsToLocalStorage(), 0);
  },
  
  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      placedItems: state.placedItems.filter((item) => item.id !== id),
      stackingRules: state.stackingRules.filter(
        (rule) => rule.item1Id !== id && rule.item2Id !== id
      )
    }));
    
    // Salvar automaticamente no localStorage após remover um item
    setTimeout(() => get().saveItemsToLocalStorage(), 0);
  },
  
  updateItem: (id: string, updatedItem: Partial<FurnitureItem>) => {
    set((state) => ({
      items: state.items.map(item => 
        item.id === id ? { ...item, ...updatedItem } : item
      ),
      // Também atualize os itens colocados se houver algum
      placedItems: state.placedItems.map(item => 
        item.id === id ? { ...item, ...updatedItem, position: item.position, rotation: item.rotation } : item
      ),
    }));
    
    // Salvar automaticamente no localStorage após atualizar um item
    setTimeout(() => get().saveItemsToLocalStorage(), 0);
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
  },
  
  // Funções de armazenamento local
  saveItemsToLocalStorage: () => {
    const { items, stackingRules } = get();
    try {
      localStorage.setItem('furniture-items', JSON.stringify(items));
      localStorage.setItem('stacking-rules', JSON.stringify(stackingRules));
      console.log('Itens e regras salvos no armazenamento local.');
    } catch (error) {
      console.error('Erro ao salvar no armazenamento local:', error);
    }
  },
  
  loadItemsFromLocalStorage: () => {
    try {
      const savedItems = localStorage.getItem('furniture-items');
      const savedRules = localStorage.getItem('stacking-rules');
      
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems) as FurnitureItem[];
        set({ items: parsedItems });
        console.log('Itens carregados do armazenamento local.');
      }
      
      if (savedRules) {
        const parsedRules = JSON.parse(savedRules) as StackingRule[];
        set({ stackingRules: parsedRules });
        console.log('Regras carregadas do armazenamento local.');
      }
    } catch (error) {
      console.error('Erro ao carregar do armazenamento local:', error);
    }
  },
  
  // Funções de importação/exportação
  importItemsByCode: (codes: string[]) => {
    const { items } = get();
    const importedItems: FurnitureItem[] = [];
    
    for (const code of codes) {
      const foundItem = items.find(item => item.code === code);
      if (foundItem) {
        importedItems.push(foundItem);
      }
    }
    
    return importedItems;
  },
  
  findItemByCode: (code: string) => {
    const { items } = get();
    return items.find(item => item.code === code);
  }
}));
