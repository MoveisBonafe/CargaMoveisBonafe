import { create } from "zustand";

export interface TruckDimensions {
  width: number;
  height: number;
  depth: number;
  maxWeight: number; // Peso máximo em kg
  maxStackHeight: number; // Altura máxima de empilhamento em unidades
}

export interface TruckType {
  id: string;
  name: string;
  dimensions: TruckDimensions;
  image?: string;
}

interface TruckState {
  // Tipos de caminhão disponíveis
  truckTypes: TruckType[];
  selectedTruckTypeId: string;
  
  // Dimensões e peso atual
  truckDimensions: TruckDimensions;
  currentWeight: number; // Peso atual carregado no caminhão
  
  // Ações para gerenciamento
  setTruckDimensions: (dimensions: TruckDimensions) => void;
  selectTruckType: (typeId: string) => void;
  addTruckType: (truckType: TruckType) => void;
  updateTruckType: (id: string, updates: Partial<TruckType>) => void;
  removeTruckType: (id: string) => void;
  
  // Ações para peso
  addWeight: (weight: number) => void;
  removeWeight: (weight: number) => void;
  resetWeight: () => void;
  
  // Armazenamento local
  saveTrucksToLocalStorage: () => void;
  loadTrucksFromLocalStorage: () => void;
  
  // Reset
  resetTruck: () => void;
}

// Caminhões predefinidos
const DEFAULT_TRUCK_TYPES: TruckType[] = [
  {
    id: "furgao-pequeno",
    name: "Furgão Pequeno",
    dimensions: {
      width: 2,
      height: 2,
      depth: 3,
      maxWeight: 1000,
      maxStackHeight: 4
    }
  },
  {
    id: "furgao-medio",
    name: "Furgão Médio",
    dimensions: {
      width: 2.5,
      height: 2.5,
      depth: 5,
      maxWeight: 2000,
      maxStackHeight: 5
    }
  },
  {
    id: "truck-pequeno",
    name: "Caminhão 3/4",
    dimensions: {
      width: 2.5,
      height: 2.2,
      depth: 5.5,
      maxWeight: 3500,
      maxStackHeight: 6
    }
  },
  {
    id: "caminhao-grande",
    name: "Caminhão Baú",
    dimensions: {
      width: 2.5,
      height: 2.5,
      depth: 7.5,
      maxWeight: 8000,
      maxStackHeight: 7
    }
  },
  {
    id: "carreta",
    name: "Carreta",
    dimensions: {
      width: 2.5,
      height: 2.7,
      depth: 14,
      maxWeight: 30000,
      maxStackHeight: 8
    }
  }
];

const DEFAULT_TRUCK_ID = "truck-pequeno"; // ID do caminhão padrão

export const useTruckStore = create<TruckState>((set, get) => ({
  truckTypes: DEFAULT_TRUCK_TYPES,
  selectedTruckTypeId: DEFAULT_TRUCK_ID,
  truckDimensions: DEFAULT_TRUCK_TYPES.find(t => t.id === DEFAULT_TRUCK_ID)?.dimensions || DEFAULT_TRUCK_TYPES[0].dimensions,
  currentWeight: 0,
  
  setTruckDimensions: (dimensions: TruckDimensions) => {
    set({ truckDimensions: dimensions });
  },
  
  selectTruckType: (typeId: string) => {
    const { truckTypes } = get();
    const selectedType = truckTypes.find(t => t.id === typeId);
    
    if (selectedType) {
      set({ 
        selectedTruckTypeId: typeId,
        truckDimensions: selectedType.dimensions 
      });
      console.log(`Caminhão selecionado: ${selectedType.name}`);
    } else {
      console.warn(`Tipo de caminhão não encontrado: ${typeId}`);
    }
  },
  
  addTruckType: (truckType: TruckType) => {
    // Verificar se já existe um caminhão com este ID
    const { truckTypes } = get();
    if (truckTypes.some(t => t.id === truckType.id)) {
      console.warn(`Já existe um caminhão com o ID: ${truckType.id}`);
      return;
    }
    
    set(state => ({
      truckTypes: [...state.truckTypes, truckType]
    }));
    
    // Salvar automaticamente
    get().saveTrucksToLocalStorage();
  },
  
  updateTruckType: (id: string, updates: Partial<TruckType>) => {
    const { truckTypes, selectedTruckTypeId } = get();
    const updatedTypes = truckTypes.map(type => 
      type.id === id ? { ...type, ...updates } : type
    );
    
    set({ truckTypes: updatedTypes });
    
    // Se o tipo atualizado for o selecionado, atualize as dimensões também
    if (id === selectedTruckTypeId) {
      const updatedType = updatedTypes.find(t => t.id === id);
      if (updatedType && updates.dimensions) {
        set({ truckDimensions: updatedType.dimensions });
      }
    }
    
    // Salvar automaticamente
    get().saveTrucksToLocalStorage();
  },
  
  removeTruckType: (id: string) => {
    const { truckTypes, selectedTruckTypeId } = get();
    
    // Não permitir remover todos os tipos
    if (truckTypes.length <= 1) {
      console.warn("Não é possível remover o único tipo de caminhão");
      return;
    }
    
    const updatedTypes = truckTypes.filter(t => t.id !== id);
    set({ truckTypes: updatedTypes });
    
    // Se o tipo removido for o selecionado, selecione outro
    if (id === selectedTruckTypeId) {
      const firstType = updatedTypes[0];
      set({ 
        selectedTruckTypeId: firstType.id,
        truckDimensions: firstType.dimensions
      });
    }
    
    // Salvar automaticamente
    get().saveTrucksToLocalStorage();
  },
  
  saveTrucksToLocalStorage: () => {
    const { truckTypes, selectedTruckTypeId } = get();
    try {
      localStorage.setItem('truck-types', JSON.stringify(truckTypes));
      localStorage.setItem('selected-truck-type', selectedTruckTypeId);
      console.log('Tipos de caminhão salvos no armazenamento local');
    } catch (error) {
      console.error('Erro ao salvar tipos de caminhão no armazenamento local:', error);
    }
  },
  
  loadTrucksFromLocalStorage: () => {
    try {
      const savedTypes = localStorage.getItem('truck-types');
      const savedSelectedId = localStorage.getItem('selected-truck-type');
      
      if (savedTypes) {
        const parsedTypes = JSON.parse(savedTypes) as TruckType[];
        set({ truckTypes: parsedTypes });
      }
      
      if (savedSelectedId) {
        const { truckTypes } = get();
        const selectedType = truckTypes.find(t => t.id === savedSelectedId);
        
        if (selectedType) {
          set({
            selectedTruckTypeId: savedSelectedId,
            truckDimensions: selectedType.dimensions
          });
        }
      }
      
      console.log('Tipos de caminhão carregados do armazenamento local');
    } catch (error) {
      console.error('Erro ao carregar tipos de caminhão do armazenamento local:', error);
    }
  },
  
  resetTruck: () => {
    set({ 
      truckTypes: DEFAULT_TRUCK_TYPES,
      selectedTruckTypeId: DEFAULT_TRUCK_ID,
      truckDimensions: DEFAULT_TRUCK_TYPES.find(t => t.id === DEFAULT_TRUCK_ID)?.dimensions 
        || DEFAULT_TRUCK_TYPES[0].dimensions,
      currentWeight: 0
    });
  },
  
  addWeight: (weight: number) => {
    set(state => ({ 
      currentWeight: state.currentWeight + weight 
    }));
  },
  
  removeWeight: (weight: number) => {
    set(state => ({ 
      currentWeight: Math.max(0, state.currentWeight - weight) 
    }));
  },
  
  resetWeight: () => {
    set({ currentWeight: 0 });
  }
}));
