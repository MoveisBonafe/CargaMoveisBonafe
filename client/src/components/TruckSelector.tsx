import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { TruckType, useTruckStore } from "../lib/stores/useTruckStore";
import { v4 as uuidv4 } from 'uuid';

const TruckSelector = () => {
  const { 
    truckTypes, 
    selectedTruckTypeId, 
    selectTruckType,
    addTruckType,
    updateTruckType,
    removeTruckType,
    saveTrucksToLocalStorage,
    loadTrucksFromLocalStorage
  } = useTruckStore();
  
  // Estado para o formulário de novo caminhão
  const [newTruck, setNewTruck] = useState<TruckType>({
    id: "",
    name: "",
    dimensions: {
      width: 2.5,
      height: 2.2,
      depth: 5.5,
      maxWeight: 3500,
      maxStackHeight: 6
    }
  });
  
  // Estado para o formulário de edição
  const [editingTruck, setEditingTruck] = useState<TruckType | null>(null);
  
  // Abrir o formulário de edição com um caminhão existente
  const startEditing = (truckId: string) => {
    const truck = truckTypes.find(t => t.id === truckId);
    if (truck) {
      setEditingTruck({...truck});
    }
  };
  
  // Carregar caminhões do localStorage na montagem do componente
  useEffect(() => {
    loadTrucksFromLocalStorage();
  }, [loadTrucksFromLocalStorage]);
  
  // Resetar o formulário de novo caminhão
  const resetNewTruckForm = () => {
    setNewTruck({
      id: "",
      name: "",
      dimensions: {
        width: 2.5,
        height: 2.2,
        depth: 5.5,
        maxWeight: 3500,
        maxStackHeight: 6
      }
    });
  };
  
  // Adicionar um novo caminhão
  const handleAddTruck = () => {
    if (!newTruck.name) {
      alert("Por favor, informe um nome para o caminhão");
      return;
    }
    
    // Gerar um ID único se estiver vazio
    const truckToAdd = {
      ...newTruck,
      id: newTruck.id || uuidv4().substring(0, 8)
    };
    
    addTruckType(truckToAdd);
    resetNewTruckForm();
  };
  
  // Atualizar um caminhão existente
  const handleUpdateTruck = () => {
    if (!editingTruck) return;
    
    updateTruckType(editingTruck.id, editingTruck);
    setEditingTruck(null);
  };
  
  // Excluir um caminhão
  const handleRemoveTruck = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este caminhão?")) {
      removeTruckType(id);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="truck-selector" className="font-medium">
          Selecionar Caminhão:
        </Label>
        <Select
          value={selectedTruckTypeId}
          onValueChange={selectTruckType}
        >
          <SelectTrigger className="w-64" id="truck-selector">
            <SelectValue placeholder="Selecione um tipo de caminhão" />
          </SelectTrigger>
          <SelectContent>
            {truckTypes.map((truck) => (
              <SelectItem key={truck.id} value={truck.id}>
                {truck.name} ({truck.dimensions.width}x{truck.dimensions.height}x{truck.dimensions.depth}m)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Botão para gerenciar caminhões */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Gerenciar Caminhões</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Tipos de Caminhão</DialogTitle>
              <DialogDescription>
                Adicione, edite ou remova tipos de caminhão para o seu carregamento.
              </DialogDescription>
            </DialogHeader>
            
            {/* Lista de caminhões existentes */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              <h3 className="text-lg font-semibold">Caminhões Cadastrados</h3>
              <div className="grid gap-2">
                {truckTypes.map((truck) => (
                  <div key={truck.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <div className="font-medium">{truck.name}</div>
                      <div className="text-sm text-gray-500">
                        Dimensões: {truck.dimensions.width}x{truck.dimensions.height}x{truck.dimensions.depth}m | 
                        Peso máx: {truck.dimensions.maxWeight}kg
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => startEditing(truck.id)}>
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Caminhão</DialogTitle>
                          </DialogHeader>
                          
                          {editingTruck && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-truck-name" className="text-right">
                                  Nome
                                </Label>
                                <Input
                                  id="edit-truck-name"
                                  value={editingTruck.name}
                                  onChange={(e) => setEditingTruck({...editingTruck, name: e.target.value})}
                                  className="col-span-3"
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-truck-width" className="text-right">
                                  Largura (m)
                                </Label>
                                <Input
                                  id="edit-truck-width"
                                  type="number"
                                  step="0.1"
                                  value={editingTruck.dimensions.width}
                                  onChange={(e) => setEditingTruck({
                                    ...editingTruck,
                                    dimensions: {
                                      ...editingTruck.dimensions,
                                      width: parseFloat(e.target.value) || 0
                                    }
                                  })}
                                  className="col-span-3"
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-truck-height" className="text-right">
                                  Altura (m)
                                </Label>
                                <Input
                                  id="edit-truck-height"
                                  type="number"
                                  step="0.1"
                                  value={editingTruck.dimensions.height}
                                  onChange={(e) => setEditingTruck({
                                    ...editingTruck,
                                    dimensions: {
                                      ...editingTruck.dimensions,
                                      height: parseFloat(e.target.value) || 0
                                    }
                                  })}
                                  className="col-span-3"
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-truck-depth" className="text-right">
                                  Comprimento (m)
                                </Label>
                                <Input
                                  id="edit-truck-depth"
                                  type="number"
                                  step="0.1"
                                  value={editingTruck.dimensions.depth}
                                  onChange={(e) => setEditingTruck({
                                    ...editingTruck,
                                    dimensions: {
                                      ...editingTruck.dimensions,
                                      depth: parseFloat(e.target.value) || 0
                                    }
                                  })}
                                  className="col-span-3"
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-truck-weight" className="text-right">
                                  Peso máx. (kg)
                                </Label>
                                <Input
                                  id="edit-truck-weight"
                                  type="number"
                                  step="100"
                                  value={editingTruck.dimensions.maxWeight}
                                  onChange={(e) => setEditingTruck({
                                    ...editingTruck,
                                    dimensions: {
                                      ...editingTruck.dimensions,
                                      maxWeight: parseFloat(e.target.value) || 0
                                    }
                                  })}
                                  className="col-span-3"
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-truck-stack" className="text-right">
                                  Altura máx. empilhamento
                                </Label>
                                <Input
                                  id="edit-truck-stack"
                                  type="number"
                                  step="1"
                                  value={editingTruck.dimensions.maxStackHeight}
                                  onChange={(e) => setEditingTruck({
                                    ...editingTruck,
                                    dimensions: {
                                      ...editingTruck.dimensions,
                                      maxStackHeight: parseFloat(e.target.value) || 0
                                    }
                                  })}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                          )}
                          
                          <DialogFooter>
                            <Button type="submit" onClick={handleUpdateTruck}>
                              Salvar Alterações
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveTruck(truck.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Formulário para adicionar novo caminhão */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">Adicionar Novo Caminhão</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-truck-name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="new-truck-name"
                    value={newTruck.name}
                    onChange={(e) => setNewTruck({...newTruck, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Ex: Furgão Pequeno"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-truck-width" className="text-right">
                    Largura (m)
                  </Label>
                  <Input
                    id="new-truck-width"
                    type="number"
                    step="0.1"
                    value={newTruck.dimensions.width}
                    onChange={(e) => setNewTruck({
                      ...newTruck,
                      dimensions: {
                        ...newTruck.dimensions,
                        width: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-truck-height" className="text-right">
                    Altura (m)
                  </Label>
                  <Input
                    id="new-truck-height"
                    type="number"
                    step="0.1"
                    value={newTruck.dimensions.height}
                    onChange={(e) => setNewTruck({
                      ...newTruck,
                      dimensions: {
                        ...newTruck.dimensions,
                        height: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-truck-depth" className="text-right">
                    Comprimento (m)
                  </Label>
                  <Input
                    id="new-truck-depth"
                    type="number"
                    step="0.1"
                    value={newTruck.dimensions.depth}
                    onChange={(e) => setNewTruck({
                      ...newTruck,
                      dimensions: {
                        ...newTruck.dimensions,
                        depth: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-truck-weight" className="text-right">
                    Peso máx. (kg)
                  </Label>
                  <Input
                    id="new-truck-weight"
                    type="number"
                    step="100"
                    value={newTruck.dimensions.maxWeight}
                    onChange={(e) => setNewTruck({
                      ...newTruck,
                      dimensions: {
                        ...newTruck.dimensions,
                        maxWeight: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-truck-stack" className="text-right">
                    Altura máx. empilhamento
                  </Label>
                  <Input
                    id="new-truck-stack"
                    type="number"
                    step="1"
                    value={newTruck.dimensions.maxStackHeight}
                    onChange={(e) => setNewTruck({
                      ...newTruck,
                      dimensions: {
                        ...newTruck.dimensions,
                        maxStackHeight: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={handleAddTruck}>
                  Adicionar Caminhão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Informações do caminhão selecionado */}
      {selectedTruckTypeId && (
        <div className="bg-slate-100 p-3 rounded-md">
          <h3 className="font-medium mb-1">
            {truckTypes.find(t => t.id === selectedTruckTypeId)?.name}
          </h3>
          <div className="text-sm text-slate-700 grid grid-cols-2 gap-x-8 gap-y-1">
            <div>
              <span className="font-medium">Dimensões:</span>{" "}
              {truckTypes.find(t => t.id === selectedTruckTypeId)?.dimensions.width} x{" "}
              {truckTypes.find(t => t.id === selectedTruckTypeId)?.dimensions.height} x{" "}
              {truckTypes.find(t => t.id === selectedTruckTypeId)?.dimensions.depth} m
            </div>
            <div>
              <span className="font-medium">Peso máximo:</span>{" "}
              {truckTypes.find(t => t.id === selectedTruckTypeId)?.dimensions.maxWeight} kg
            </div>
            <div>
              <span className="font-medium">Altura máx. empilhamento:</span>{" "}
              {truckTypes.find(t => t.id === selectedTruckTypeId)?.dimensions.maxStackHeight} unidades
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckSelector;