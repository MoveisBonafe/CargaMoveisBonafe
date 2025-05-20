import { useState, useRef, useEffect } from "react";
import { FurnitureItem, FurnitureItemPosition } from "../types";
import { useTruckStore } from "../lib/stores/useTruckStore";
import { cn } from "../lib/utils";

interface ControlsProps {
  items: FurnitureItem[];
  placedItems: FurnitureItemPosition[];
  onDragStart: (itemId: string) => void;
  selectedItem: string | null;
}

/**
 * Componente de controle independente (fora do contexto Three.js)
 * Este componente foi redesenhado para funcionar como um componente React regular
 * evitando problemas de renderização com o React Three Fiber
 */
const Controls = ({ items, placedItems, onDragStart, selectedItem }: ControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { truckDimensions, currentWeight } = useTruckStore();
  
  // Estado para controlar a posição do painel
  const [position, setPosition] = useState({ x: 20, y: 20 });
  
  // Estado para controlar o arrasto da legenda
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Estado para controlar a quantidade de itens a adicionar
  const [itemQuantities, setItemQuantities] = useState<{[key: string]: number}>({});
  
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
  
  // Calculate weight usage statistics
  const calculateWeightUsage = () => {
    const totalItemsWeight = placedItems.reduce((acc, item) => {
      return acc + item.weight;
    }, 0);
    
    return {
      used: totalItemsWeight,
      total: truckDimensions.maxWeight,
      percentage: (totalItemsWeight / truckDimensions.maxWeight) * 100
    };
  };
  
  const volumeStats = calculateVolumeUsage();
  const weightStats = calculateWeightUsage();
  
  // Funções para controle de arrasto do painel
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.stopPropagation();
    e.preventDefault();
  };
  
  // Inicializa as quantidades se necessário
  useEffect(() => {
    const quantities: {[key: string]: number} = {};
    items.forEach(item => {
      if (!(item.id in itemQuantities)) {
        quantities[item.id] = 1;
      }
    });
    
    if (Object.keys(quantities).length > 0) {
      setItemQuantities(prev => ({ ...prev, ...quantities }));
    }
  }, [items]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && panelRef.current) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        
        setPosition({
          x: position.x + deltaX,
          y: position.y + deltaY
        });
        
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);
  
  // Função para adicionar múltiplos itens de uma vez
  const handleAddMultipleItems = (itemId: string) => {
    const quantity = itemQuantities[itemId] || 1;
    
    // Aqui notificamos o usuário sobre a quantidade de itens sendo adicionados
    console.log(`Adicionando ${quantity}x item ${itemId}`);
    alert(`Adicionando ${quantity} unidades do item!`);
    
    for (let i = 0; i < quantity; i++) {
      onDragStart(itemId);
    }
  };
  
  return (
    <div 
      ref={panelRef}
      className={cn(
        "fixed bg-card border border-border rounded-md shadow-lg transition-all duration-300",
        isExpanded ? "w-64" : "w-10",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        zIndex: 100 
      }}
    >
      <div 
        className="flex items-center justify-between p-2 border-b border-border cursor-move bg-secondary/20"
        onMouseDown={handleMouseDown}
      >
        <h3 className={cn("font-medium", !isExpanded && "hidden")}>Itens Disponíveis</h3>
        <div className="flex gap-1">
          <span className="text-xs text-muted-foreground">{isDragging ? "Movendo..." : "Arraste aqui"}</span>
          <button
            className="p-1 rounded-md hover:bg-secondary/50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "←" : "→"}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div className="p-3 border-b border-border space-y-3">
            {/* Volume usage */}
            <div>
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
            
            {/* Weight usage */}
            <div>
              <div className="mb-1 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Uso do Peso do Caminhão</span>
                <span className="text-xs font-medium">
                  {weightStats.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className={cn(
                    "h-2 rounded-full",
                    weightStats.percentage > 90 ? "bg-destructive" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(weightStats.percentage, 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {weightStats.used.toFixed(0)} / {weightStats.total.toFixed(0)} kg
              </div>
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
                          <div className="flex flex-col gap-1">
                            <span className="text-primary">Disponível</span>
                            <div className="flex gap-1 items-center mt-1">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                className="w-12 h-6 text-xs p-1 border border-border rounded bg-background"
                                value={itemQuantities[item.id] || 1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  setItemQuantities(prev => ({
                                    ...prev,
                                    [item.id]: Math.max(1, Math.min(10, val))
                                  }));
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex-grow"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddMultipleItems(item.id);
                                }}
                              >
                                Adicionar {itemQuantities[item.id] || 1}x
                              </button>
                            </div>
                          </div>
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
  );
};

export default Controls;
