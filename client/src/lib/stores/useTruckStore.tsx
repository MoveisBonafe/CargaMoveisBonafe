import { create } from "zustand";

interface TruckDimensions {
  width: number;
  height: number;
  depth: number;
  maxWeight: number; // Peso máximo em kg
  maxStackHeight: number; // Altura máxima de empilhamento em unidades
}

interface TruckState {
  truckDimensions: TruckDimensions;
  setTruckDimensions: (dimensions: TruckDimensions) => void;
  resetTruck: () => void;
  currentWeight: number; // Peso atual carregado no caminhão
  addWeight: (weight: number) => void;
  removeWeight: (weight: number) => void;
  resetWeight: () => void;
}

const DEFAULT_TRUCK_DIMENSIONS: TruckDimensions = {
  width: 8,
  height: 8,
  depth: 16,
  maxWeight: 3500, // Padrão 3500kg (caminhão pequeno/médio)
  maxStackHeight: 6 // Altura máxima de empilhamento padrão
};

export const useTruckStore = create<TruckState>((set, get) => ({
  truckDimensions: DEFAULT_TRUCK_DIMENSIONS,
  currentWeight: 0,
  
  setTruckDimensions: (dimensions: TruckDimensions) => {
    set({ truckDimensions: dimensions });
  },
  
  resetTruck: () => {
    set({ 
      truckDimensions: DEFAULT_TRUCK_DIMENSIONS,
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
