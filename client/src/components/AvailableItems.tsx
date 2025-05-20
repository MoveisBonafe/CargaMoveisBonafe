import { useState } from "react";
import { useFurnitureStore } from "../lib/stores/useFurnitureStore";
import { ScrollArea } from "./ui/scroll-area";
import { FurnitureItem } from "../types";
import { AlertCircle, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AvailableItemsProps {
  onItemSelect?: (item: FurnitureItem) => void;
}

const AvailableItems = ({ onItemSelect }: AvailableItemsProps) => {
  const { items, saveItemsToLocalStorage } = useFurnitureStore();
  
  // Estado para armazenar a quantidade de cada item
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Função para adicionar item com quantidade
  const handleAddItem = (item: FurnitureItem) => {
    if (onItemSelect) {
      const quantity = quantities[item.id] || 1;
      
      // Adicionar o item quantas vezes for a quantidade
      for (let i = 0; i < quantity; i++) {
        onItemSelect(item);
      }
    }
  };
  
  // Função para atualizar a quantidade de um item
  const updateQuantity = (itemId: string, newValue: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, newValue) // Mínimo de 1 item
    }));
  };

  return (
    <div className="w-full">
      <div className="p-1">
        {items.length === 0 ? (
          <div className="text-center p-2 bg-muted rounded-md">
            <div className="flex justify-center mb-1">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum item cadastrado. Use "Gerenciar Móveis" para adicionar itens.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[100px]">
            <div className="space-y-2 pr-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-2 bg-card border rounded-md hover:bg-accent/5 transition-colors"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-medium text-xs truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.width}x{item.height}x{item.depth}m
                      <span className="ml-1">{item.weight}kg</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => updateQuantity(item.id, (quantities[item.id] || 1) - 1)}
                    >
                      <Minus className="h-2 w-2" />
                    </Button>
                    
                    <Input
                      type="number"
                      min="1"
                      className="w-8 h-5 text-xs text-center"
                      value={quantities[item.id] || 1}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    />
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => updateQuantity(item.id, (quantities[item.id] || 1) + 1)}
                    >
                      <Plus className="h-2 w-2" />
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      className="text-xs h-5 px-2"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default AvailableItems;