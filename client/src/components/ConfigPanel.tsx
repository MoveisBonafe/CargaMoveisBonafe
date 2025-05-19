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
    updateItem,
    addStackingRule, 
    removeStackingRule, 
    getStackingRules 
  } = useFurnitureStore();
  const { truckDimensions, setTruckDimensions } = useTruckStore();
  
  const [newItem, setNewItem] = useState<Omit<FurnitureItem, "id">>({
    code: "",
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
  
  // Estado para importação por código
  const [importCode, setImportCode] = useState("");
  const [importCodes, setImportCodes] = useState<string[]>([]);
  
  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.code.trim()) {
      alert("Por favor, digite um código e um nome para o item");
      return;
    }
    
    if (isEditing && editingItemId) {
      // Estamos editando um item existente
      console.log("Atualizando item:", editingItemId, newItem);
      updateItem(editingItemId, newItem);
      setIsEditing(false);
      setEditingItemId(null);
    } else {
      // Estamos adicionando um novo item
      addItem({
        ...newItem,
        id: Date.now().toString() // Simple unique ID
      });
    }
    
    // Resetar o formulário
    setNewItem({
      code: "",
      name: "",
      width: 1,
      height: 1,
      depth: 1,
      weight: 10,
      color: getRandomColor()
    });
  };
  
  const handleStartEdit = (itemId: string) => {
    const itemToEdit = items.find(item => item.id === itemId);
    if (itemToEdit) {
      setNewItem({
        code: itemToEdit.code,
        name: itemToEdit.name,
        width: itemToEdit.width,
        height: itemToEdit.height,
        depth: itemToEdit.depth,
        weight: itemToEdit.weight,
        color: itemToEdit.color
      });
      setEditingItemId(itemId);
      setIsEditing(true);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItemId(null);
    setNewItem({
      code: "",
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
  
  // Manipular adição de código para importação
  const handleAddImportCode = () => {
    if (!importCode) return;
    
    // Verificar se o código já está na lista
    if (importCodes.includes(importCode)) {
      alert("Esse código já está na lista de importação.");
      return;
    }
    
    // Verificar se o código existe na base de itens
    const itemExists = useFurnitureStore.getState().findItemByCode(importCode);
    if (!itemExists) {
      alert("Não foi encontrado nenhum item com este código.");
      return;
    }
    
    setImportCodes([...importCodes, importCode]);
    setImportCode("");
  };
  
  // Importar itens pelos códigos
  const handleImportItems = () => {
    if (importCodes.length === 0) {
      alert("Adicione pelo menos um código para importar.");
      return;
    }
    
    const importedItems = useFurnitureStore.getState().importItemsByCode(importCodes);
    if (importedItems.length === 0) {
      alert("Nenhum item encontrado com os códigos fornecidos.");
      return;
    }
    
    // Adicionar apenas os itens que foram importados com sucesso
    alert(`${importedItems.length} item(s) encontrado(s) e selecionado(s).`);
  };
  
  return (
    <div className="p-4">
      <Tabs defaultValue="truck">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="truck">Caminhão</TabsTrigger>
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="import">Importar</TabsTrigger>
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
                <Label htmlFor="itemCode">Código do Produto</Label>
                <Input
                  id="itemCode"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  placeholder="ex: SOF-001, MES-001"
                />
              </div>
              
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
              
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleAddItem} className="flex-grow" variant="default">
                    Salvar Alterações
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline">
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button onClick={handleAddItem} className="w-full">
                  Adicionar Item
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Itens Disponíveis</h3>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => useFurnitureStore.getState().saveItemsToLocalStorage()}
                >
                  Salvar Local
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => useFurnitureStore.getState().loadItemsFromLocalStorage()}
                >
                  Carregar Local
                </Button>
              </div>
            </div>
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
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStartEdit(item.id)}
                              className="flex-1"
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => removeItem(item.id)}
                              className="flex-1"
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
        
        {/* Import by Code */}
        <TabsContent value="import" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Importar Itens por Código</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Digite os códigos dos produtos a serem carregados.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="ex: SOF-001"
                  className="flex-grow"
                />
                <Button onClick={handleAddImportCode} size="sm">
                  Adicionar
                </Button>
              </div>
              
              {importCodes.length > 0 && (
                <div className="bg-secondary/30 p-2 rounded-md">
                  <p className="text-sm font-medium mb-1">Códigos para importar:</p>
                  <div className="flex flex-wrap gap-2">
                    {importCodes.map((code, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-xs">
                        <span>{code}</span>
                        <button 
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => setImportCodes(importCodes.filter((_, i) => i !== index))}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleImportItems} 
                className="w-full"
                disabled={importCodes.length === 0}
              >
                Importar Itens
              </Button>
            </div>
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
