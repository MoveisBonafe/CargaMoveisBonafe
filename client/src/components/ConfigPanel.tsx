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
    color: "#3b82f6"
  });
  
  const [newRuleItem1, setNewRuleItem1] = useState("");
  const [newRuleItem2, setNewRuleItem2] = useState("");
  
  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      alert("Please enter a name for the item");
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
          <TabsTrigger value="truck">Truck</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="rules">Stacking Rules</TabsTrigger>
        </TabsList>
        
        {/* Truck Configuration */}
        <TabsContent value="truck">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Truck Dimensions</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="truckWidth">Width</Label>
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
                  <Label htmlFor="truckHeight">Height</Label>
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
                  <Label htmlFor="truckDepth">Depth</Label>
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
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Controls Help</h3>
              <div className="bg-secondary/50 p-3 rounded-md">
                <p className="text-sm mb-2">Camera Controls:</p>
                <ul className="text-xs space-y-1">
                  <li>W/↑: Move camera forward</li>
                  <li>S/↓: Move camera backward</li>
                  <li>A/←: Move camera left</li>
                  <li>D/→: Move camera right</li>
                  <li>E: Move camera up</li>
                  <li>Q: Move camera down</li>
                  <li>R: Reset camera</li>
                  <li>Mouse: Click and drag to rotate view</li>
                  <li>Mouse wheel: Zoom in/out</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Items Configuration */}
        <TabsContent value="items" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Add New Item</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="itemName">Name</Label>
                <Input
                  id="itemName"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Sofa, Table, Chair"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="itemWidth">Width</Label>
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
                  <Label htmlFor="itemHeight">Height</Label>
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
                  <Label htmlFor="itemDepth">Depth</Label>
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
              </div>
              
              <div>
                <Label htmlFor="itemColor">Color</Label>
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
                Add Item
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Available Items</h3>
            {items.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No items added yet. Add some items above.</AlertDescription>
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
                            <div>Width: {item.width}</div>
                            <div>Height: {item.height}</div>
                            <div>Depth: {item.depth}</div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeItem(item.id)}
                            className="w-full"
                          >
                            Remove
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
            <h3 className="text-lg font-medium mb-2">Add Stacking Rule</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Define which items can be stacked on top of each other.
            </p>
            <div className="space-y-2">
              <div>
                <Label htmlFor="bottomItem">Bottom Item</Label>
                <select
                  id="bottomItem"
                  className="w-full p-2 rounded-md bg-secondary text-foreground border border-border"
                  value={newRuleItem1}
                  onChange={(e) => setNewRuleItem1(e.target.value)}
                >
                  <option value="">Select an item...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="topItem">Top Item</Label>
                <select
                  id="topItem"
                  className="w-full p-2 rounded-md bg-secondary text-foreground border border-border"
                  value={newRuleItem2}
                  onChange={(e) => setNewRuleItem2(e.target.value)}
                >
                  <option value="">Select an item...</option>
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
                Add Stacking Rule
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Current Stacking Rules</h3>
            {getStackingRules().length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No stacking rules defined yet. By default, items cannot be stacked on each other.
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
                          <span className="text-xs text-muted-foreground">can support</span>
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
