import { useFurnitureStore } from "../lib/stores/useFurnitureStore";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { FurnitureItem } from "../types";

interface AvailableItemsProps {
  onItemSelect?: (item: FurnitureItem) => void;
}

const AvailableItems = ({ onItemSelect }: AvailableItemsProps) => {
  const { items } = useFurnitureStore();

  return (
    <div className="border-t border-border pt-4">
      <h2 className="text-lg font-semibold mb-3">Itens Disponíveis</h2>
      {items.length === 0 ? (
        <div className="text-center p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            Nenhum item cadastrado. Use "Gerenciar Móveis" para adicionar itens.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-card border rounded-md hover:bg-accent/5 transition-colors"
              >
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
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AvailableItems;