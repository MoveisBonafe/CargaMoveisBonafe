import { create } from "zustand";

interface TruckDimensions {
  width: number;
  height: number;
  depth: number;
}

interface TruckState {
  truckDimensions: TruckDimensions;
  setTruckDimensions: (dimensions: TruckDimensions) => void;
  resetTruck: () => void;
}

const DEFAULT_TRUCK_DIMENSIONS: TruckDimensions = {
  width: 8,
  height: 8,
  depth: 16
};

export const useTruckStore = create<TruckState>((set) => ({
  truckDimensions: DEFAULT_TRUCK_DIMENSIONS,
  
  setTruckDimensions: (dimensions: TruckDimensions) => {
    set({ truckDimensions: dimensions });
  },
  
  resetTruck: () => {
    set({ truckDimensions: DEFAULT_TRUCK_DIMENSIONS });
  }
}));
