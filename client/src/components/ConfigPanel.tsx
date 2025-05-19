import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useFurnitureStore } from "../lib/stores/useFurnitureStore";
import { useTruckStore } from "../lib/stores/useTruckStore";
import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Check, X, AlertCircle } from "lucide-react";
import { Switch } from "./ui/switch";
import { cn } from "../lib/utils";
import { FurnitureItem, StackingRule } from "../types";
import { Alert, AlertDescription } from "./ui/alert";

const ConfigPanel = () => {
  const { 
    items, 
    addItem, 
    removeItem, 
    addStackingRule, 
    removeStackingRule, 
    getStackingRules 
  } = useFurnitureStore();
  const { truckDimensions, setTruckDimensions } = useTruckStore();
  
  const [newItem, setNewItem] = useState<Omit<FurnitureItem, "id">>({
    name: "",
    width: 1,
    height: 1,
    depth: 1,
    weight: 10,
    color: "#3b82f6"
  });
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newRuleItem1, setNewRuleItem1] = useState("");
  const [newRuleItem2, setNewRuleItem2] = useState("");
  
  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      alert("Por favor, digite um nome para o item");
      return;
    }
    
    addItem({
      ...newItem,
      id: Date.now().toString() // Simple unique ID
    });
    
    setNewItem({
      name: "",
      width: 1,
      height: 1,
      depth: 1,
      weight: 10,
      color: getRandomColor()
    });
  };
  
  const handleAddStackingRule = () => {
    if (!newRuleItem1 || !newRuleItem2) {
      alert("Please select both items for the stacking rule");
      return;
    }
    
    addStackingRule(newRuleItem1, newRuleItem2);
    setNewRuleItem1("");
    setNewRuleItem2("");
  };
  
  const getRandomColor = () => {
    const colors = [
      "#3b82f6", // blue
      "#ef4444", // red
      "#10b981", // green
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#6366f1", // indigo
      "#14b8a6"  // teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  return (
    <div className="p-4">
      <Tabs defaultValue="truck">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="truck">Caminhão</TabsTrigger>
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="rules">Regras de Empilhamento</TabsTrigger>
        </TabsList>
        
        {/* Truck Configuration */}
        <TabsContent value="truck">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Dimensões do Caminhão</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <Label htmlFor="truckWidth">Largura</Label>
                  <Input
                    id="truckWidth"
                    type="number"
                    min="1"
                    max="20"
                    value={truckDimensions.width}
                    onChange={(e) => setTruckDimensions({
                      ...truckDimensions,
                      width: Number(e.target.value) || 1
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="truckHeight">Altura</Label>
                  <Input
                    id="truckHeight"
                    type="number"
                    min="1"
                    max="20"
                    value={truckDimensions.height}
                    onChange={(e) => setTruckDimensions({
                      ...truckDimensions,
                      height: Number(e.target.value) || 1
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="truckDepth">Profundidade</Label>
                  <Input
                    id="truckDepth"
                    type="number"
                    min="1"
                    max="40"
                    value={truckDimensions.depth}
                    onChange={(e) => setTruckDimensions({
                      ...truckDimensions,
                      depth: Number(e.target.value) || 1
                    })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="truckMaxWeight">Peso Máximo (kg)</Label>
                  <Input
                    id="truckMaxWeight"
                    type="number"
                    min="100"
                    step="100"
                    value={truckDimensions.maxWeight}
                    onChange={(e) => setTruckDimensions({
                      ...truckDimensions,
                      maxWeight: Number(e.target.value) || 100
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="truckMaxStackHeight">Altura Máx. Empilhamento</Label>
                  <Input
                    id="truckMaxStackHeight"
                    type="number"
                    min="1"
                    max="20"
                    value={truckDimensions.maxStackHeight}
                    onChange={(e) => setTruckDimensions({
                      ...truckDimensions,
                      maxStackHeight: Number(e.target.value) || 1
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Ajuda de Controles</h3>
              <div className="bg-secondary/50 p-3 rounded-md">
                <p className="text-sm mb-2">Controles de Câmera:</p>
                <ul className="text-xs space-y-1">
                  <li>W/↑: Mover câmera para frente</li>
                  <li>S/↓: Mover câmera para trás</li>
                  <li>A/←: Mover câmera para esquerda</li>
                  <li>D/→: Mover câmera para direita</li>
                  <li>E: Mover câmera para cima</li>
                  <li>Q: Mover câmera para baixo</li>
                  <li>R: Reiniciar câmera</li>
                  <li>Mouse: Clique e arraste para rotacionar visão</li>
                  <li>Roda do mouse: Aproximar/afastar</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Items Configuration */}
        <TabsContent value="items" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Adicionar Novo Item</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="itemName">Nome</Label>
                <Input
                  id="itemName"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="ex: Sofá, Mesa, Cadeira"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="itemWidth">Largura</Label>
                  <Input
                    id="itemWidth"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newItem.width}
                    onChange={(e) => setNewItem({ 
                      ...newItem, 
                      width: Number(e.target.value) || 0.1 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="itemHeight">Altura</Label>
                  <Input
                    id="itemHeight"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newItem.height}
                    onChange={(e) => setNewItem({ 
                      ...newItem, 
                      height: Number(e.target.value) || 0.1 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="itemDepth">Profundidade</Label>
                  <Input
                    id="itemDepth"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newItem.depth}
                    onChange={(e) => setNewItem({ 
                      ...newItem, 
                      depth: Number(e.target.value) || 0.1 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="itemWeight">Peso (kg)</Label>
                  <Input
                    id="itemWeight"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newItem.weight}
                    onChange={(e) => setNewItem({ 
                      ...newItem, 
                      weight: Number(e.target.value) || 0.1 
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="itemColor">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="itemColor"
                    type="color"
                    className="w-16 h-9 p-1"
                    value={newItem.color}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  />
                  <Input
                    value={newItem.color}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                    className="flex-grow"
                  />
                </div>
              </div>
              
              <Button onClick={handleAddItem} className="w-full">
                Adicionar Item
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Itens Disponíveis</h3>
            {items.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Nenhum item adicionado ainda. Adicione alguns itens acima.</AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[300px]">
                <Accordion type="multiple" className="w-full">
                  {items.map((item) => (
                    <AccordionItem value={item.id} key={item.id}>
                      <AccordionTrigger className="hover:bg-secondary/30 px-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-2 space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>Largura: {item.width}</div>
                            <div>Altura: {item.height}</div>
                            <div>Profundidade: {item.depth}</div>
                          </div>
                          <div className="text-sm mt-1">
                            <div>Peso: {item.weight} kg</div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeItem(item.id)}
                            className="w-full"
                          >
                            Remover
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
        
        {/* Stacking Rules Configuration */}
        <TabsContent value="rules" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Adicionar Regra de Empilhamento</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Defina quais itens podem ser empilhados uns sobre os outros.
            </p>
            <div className="space-y-2">
              <div>
                <Label htmlFor="bottomItem">Item de Baixo</Label>
                <select
                  id="bottomItem"
                  className="w-full p-2 rounded-md bg-secondary text-foreground border border-border"
                  value={newRuleItem1}
                  onChange={(e) => setNewRuleItem1(e.target.value)}
                >
                  <option value="">Selecione um item...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="topItem">Item de Cima</Label>
                <select
                  id="topItem"
                  className="w-full p-2 rounded-md bg-secondary text-foreground border border-border"
                  value={newRuleItem2}
                  onChange={(e) => setNewRuleItem2(e.target.value)}
                >
                  <option value="">Selecione um item...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button 
                onClick={handleAddStackingRule} 
                className="w-full"
                disabled={items.length < 2}
              >
                Adicionar Regra
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Regras de Empilhamento Atuais</h3>
            {getStackingRules().length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma regra de empilhamento definida ainda. Por padrão, os itens não podem ser empilhados uns sobre os outros.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {getStackingRules().map((rule, index) => {
                    const item1 = items.find(i => i.id === rule.item1Id);
                    const item2 = items.find(i => i.id === rule.item2Id);
                    
                    if (!item1 || !item2) return null;
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-secondary/30 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item1.color }}
                          />
                          <span className="text-sm">{item1.name}</span>
                          <span className="text-xs text-muted-foreground">pode suportar</span>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item2.color }}
                          />
                          <span className="text-sm">{item2.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeStackingRule(rule.item1Id, rule.item2Id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigPanel;
