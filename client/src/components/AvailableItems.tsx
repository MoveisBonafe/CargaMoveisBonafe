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
    <div className="bg-card border border-border rounded-md shadow-lg w-full">
      <div className="flex items-center justify-between p-2 border-b border-border bg-secondary/20">
        <h3 className="font-medium">Itens Disponíveis</h3>
      </div>
      
      <div className="p-3">
        {items.length === 0 ? (
          <div className="text-center p-3 bg-muted rounded-md">
            <div className="flex justify-center mb-1">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum item cadastrado. Use "Gerenciar Móveis" para adicionar itens.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-3 pr-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col p-2 bg-card border rounded-md hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.width}x{item.height}x{item.depth}m
                          <span className="ml-2">{item.weight}kg</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs bg-secondary/50 px-2 py-1 rounded">
                      {item.code}
                    </div>
                  </div>
                  
                  {/* Controles de quantidade */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, (quantities[item.id] || 1) - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <Input
                        type="number"
                        min="1"
                        className="w-12 h-6 text-xs text-center"
                        value={quantities[item.id] || 1}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      />
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, (quantities[item.id] || 1) + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      className="text-xs"
                    >
                      Adicionar
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