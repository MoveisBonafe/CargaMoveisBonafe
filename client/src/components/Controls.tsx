import { useState } from "react";
import { Html } from "@react-three/drei";
import { FurnitureItem, FurnitureItemPosition } from "../types";
import { useTruckStore } from "../lib/stores/useTruckStore";
import { cn } from "../lib/utils";

interface ControlsProps {
  items: FurnitureItem[];
  placedItems: FurnitureItemPosition[];
  onDragStart: (itemId: string) => void;
  selectedItem: string | null;
}

const Controls = ({ items, placedItems, onDragStart, selectedItem }: ControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { truckDimensions } = useTruckStore();
  
  // Get placed item IDs for checking availability
  const placedItemIds = placedItems.map(item => item.id);
  
  // Calculate usage statistics
  const calculateVolumeUsage = () => {
    const truckVolume = truckDimensions.width * truckDimensions.height * truckDimensions.depth;
    const usedVolume = placedItems.reduce((acc, item) => {
      return acc + (item.width * item.height * item.depth);
    }, 0);
    
    return {
      used: usedVolume,
      total: truckVolume,
      percentage: (usedVolume / truckVolume) * 100
    };
  };
  
  const volumeStats = calculateVolumeUsage();
  
  return (
    <Html position={[-truckDimensions.width / 2 - 2, truckDimensions.height / 2, 0]}>
      <div 
        className={cn(
          "bg-card border border-border rounded-md shadow-lg transition-all duration-300",
          isExpanded ? "w-64" : "w-10"
        )}
      >
        <div className="flex items-center justify-between p-2 border-b border-border">
          <h3 className={cn("font-medium", !isExpanded && "hidden")}>Itens Disponíveis</h3>
          <button
            className="p-1 rounded-md hover:bg-secondary/50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "←" : "→"}
          </button>
        </div>
        
        {isExpanded && (
          <>
            <div className="p-3 border-b border-border">
              <div className="mb-1 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Uso do Volume do Caminhão</span>
                <span className="text-xs font-medium">
                  {volumeStats.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(volumeStats.percentage, 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {volumeStats.used.toFixed(2)} / {volumeStats.total.toFixed(2)} unidades cúbicas
              </div>
            </div>
            
            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">
                  Nenhum item disponível. Adicione alguns no painel de configuração.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const isPlaced = placedItemIds.includes(item.id);
                    
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "p-2 rounded-md cursor-pointer transition-colors duration-150",
                          isPlaced 
                            ? "bg-secondary/30 border border-muted" 
                            : "bg-secondary hover:bg-secondary/70 border border-transparent",
                          selectedItem === item.id && "ring-2 ring-primary"
                        )}
                        onClick={() => onDragStart(item.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          <div className="text-xs text-muted-foreground">
                            L: {item.width}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            A: {item.height}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            P: {item.depth}
                          </div>
                        </div>
                        <div className="mt-1 text-xs">
                          {isPlaced ? (
                            <span className="text-muted-foreground">Colocado (clique para mover)</span>
                          ) : (
                            <span className="text-primary">Disponível</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Html>
  );
};

export default Controls;
