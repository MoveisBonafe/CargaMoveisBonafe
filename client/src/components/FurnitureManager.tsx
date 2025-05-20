import { useState, useEffect } from "react";
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
import { useFurnitureStore } from "../lib/stores/useFurnitureStore";
import { FurnitureItem } from "../types";
import { v4 as uuidv4 } from 'uuid';

const FurnitureManager = () => {
  const { 
    items, 
    addItem, 
    removeItem, 
    updateItem,
    saveItemsToLocalStorage,
    loadItemsFromLocalStorage
  } = useFurnitureStore();
  
  // Estados para gerenciamento de móveis
  const [newItem, setNewItem] = useState<Omit<FurnitureItem, "id">>({
    code: "",
    name: "",
    width: 1,
    height: 1,
    depth: 1,
    weight: 20,
    color: "#3b82f6" // Azul por padrão
  });
  
  // Estado para o item sendo editado
  const [editingItem, setEditingItem] = useState<FurnitureItem | null>(null);
  
  // Carregar itens do localStorage quando o componente montar
  useEffect(() => {
    loadItemsFromLocalStorage();
  }, [loadItemsFromLocalStorage]);
  
  // Iniciar edição de um item
  const startEditing = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setEditingItem({...item});
    }
  };
  
  // Resetar o formulário de novo item
  const resetNewItemForm = () => {
    setNewItem({
      code: "",
      name: "",
      width: 1,
      height: 1,
      depth: 1,
      weight: 20,
      color: getRandomColor()
    });
  };
  
  // Gerar uma cor aleatória
  const getRandomColor = () => {
    const colors = [
      "#3b82f6", // Azul
      "#10b981", // Verde
      "#f59e0b", // Âmbar
      "#8b5cf6", // Roxo
      "#ec4899", // Rosa
      "#ef4444", // Vermelho
      "#6366f1", // Índigo
      "#14b8a6", // Teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Adicionar um novo móvel
  const handleAddItem = () => {
    if (!newItem.name || !newItem.code) {
      alert("Por favor, informe o nome e código do móvel");
      return;
    }
    
    // Verificar se o código já existe
    if (items.some(item => item.code === newItem.code)) {
      alert("Já existe um móvel com esse código. Por favor, use um código único.");
      return;
    }
    
    const itemToAdd: FurnitureItem = {
      ...newItem,
      id: uuidv4().substring(0, 8)
    };
    
    addItem(itemToAdd);
    resetNewItemForm();
  };
  
  // Atualizar um móvel existente
  const handleUpdateItem = () => {
    if (!editingItem) return;
    
    // Verificar se o código foi alterado e já existe
    const codeExists = items.some(
      item => item.code === editingItem.code && item.id !== editingItem.id
    );
    
    if (codeExists) {
      alert("Já existe um móvel com esse código. Por favor, use um código único.");
      return;
    }
    
    updateItem(editingItem.id, editingItem);
    setEditingItem(null);
  };
  
  // Excluir um móvel
  const handleRemoveItem = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este móvel?")) {
      removeItem(id);
    }
  };
  
  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default">Gerenciar Móveis</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Móveis</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova móveis para o seu carregamento.
            </DialogDescription>
          </DialogHeader>
          
          {/* Lista de móveis existentes */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            <h3 className="text-lg font-semibold">Móveis Cadastrados</h3>
            <div className="grid gap-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-md" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Código: {item.code} | 
                        Dimensões: {item.width}x{item.height}x{item.depth}m | 
                        Peso: {item.weight}kg
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => startEditing(item.id)}>
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Móvel</DialogTitle>
                        </DialogHeader>
                        
                        {editingItem && (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-item-code" className="text-right">
                                Código
                              </Label>
                              <Input
                                id="edit-item-code"
                                value={editingItem.code}
                                onChange={(e) => setEditingItem({...editingItem, code: e.target.value.toUpperCase()})}
                                className="col-span-3"
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-item-name" className="text-right">
                                Nome
                              </Label>
                              <Input
                                id="edit-item-name"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                className="col-span-3"
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-item-width" className="text-right">
                                Largura (m)
                              </Label>
                              <Input
                                id="edit-item-width"
                                type="number"
                                step="0.1"
                                value={editingItem.width}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  width: parseFloat(e.target.value) || 0
                                })}
                                className="col-span-3"
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-item-height" className="text-right">
                                Altura (m)
                              </Label>
                              <Input
                                id="edit-item-height"
                                type="number"
                                step="0.1"
                                value={editingItem.height}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  height: parseFloat(e.target.value) || 0
                                })}
                                className="col-span-3"
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-item-depth" className="text-right">
                                Profundidade (m)
                              </Label>
                              <Input
                                id="edit-item-depth"
                                type="number"
                                step="0.1"
                                value={editingItem.depth}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  depth: parseFloat(e.target.value) || 0
                                })}
                                className="col-span-3"
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-item-weight" className="text-right">
                                Peso (kg)
                              </Label>
                              <Input
                                id="edit-item-weight"
                                type="number"
                                step="1"
                                value={editingItem.weight}
                                onChange={(e) => setEditingItem({
                                  ...editingItem,
                                  weight: parseFloat(e.target.value) || 0
                                })}
                                className="col-span-3"
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-item-color" className="text-right">
                                Cor
                              </Label>
                              <div className="flex col-span-3 gap-2">
                                <Input
                                  id="edit-item-color"
                                  type="color"
                                  value={editingItem.color}
                                  onChange={(e) => setEditingItem({
                                    ...editingItem,
                                    color: e.target.value
                                  })}
                                  className="w-16"
                                />
                                <div 
                                  className="h-10 w-10 rounded-md border" 
                                  style={{ backgroundColor: editingItem.color }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <DialogFooter>
                          <Button type="submit" onClick={handleUpdateItem}>
                            Salvar Alterações
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Formulário para adicionar novo móvel */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Adicionar Novo Móvel</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-code" className="text-right">
                  Código
                </Label>
                <Input
                  id="new-item-code"
                  value={newItem.code}
                  onChange={(e) => setNewItem({...newItem, code: e.target.value.toUpperCase()})}
                  className="col-span-3"
                  placeholder="Ex: SOF-001"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="new-item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Ex: Sofá 3 Lugares"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-width" className="text-right">
                  Largura (m)
                </Label>
                <Input
                  id="new-item-width"
                  type="number"
                  step="0.1"
                  value={newItem.width}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    width: parseFloat(e.target.value) || 0
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-height" className="text-right">
                  Altura (m)
                </Label>
                <Input
                  id="new-item-height"
                  type="number"
                  step="0.1"
                  value={newItem.height}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    height: parseFloat(e.target.value) || 0
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-depth" className="text-right">
                  Profundidade (m)
                </Label>
                <Input
                  id="new-item-depth"
                  type="number"
                  step="0.1"
                  value={newItem.depth}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    depth: parseFloat(e.target.value) || 0
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-weight" className="text-right">
                  Peso (kg)
                </Label>
                <Input
                  id="new-item-weight"
                  type="number"
                  step="1"
                  value={newItem.weight}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    weight: parseFloat(e.target.value) || 0
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-color" className="text-right">
                  Cor
                </Label>
                <div className="flex col-span-3 gap-2">
                  <Input
                    id="new-item-color"
                    type="color"
                    value={newItem.color}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      color: e.target.value
                    })}
                    className="w-16"
                  />
                  <div 
                    className="h-10 w-10 rounded-md border" 
                    style={{ backgroundColor: newItem.color }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={handleAddItem}>
                Adicionar Móvel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="bg-slate-100 p-3 rounded-md">
        <h3 className="font-medium mb-2">Móveis Cadastrados: {items.length}</h3>
        <div className="text-sm text-slate-700">
          Clique em "Gerenciar Móveis" para adicionar, editar ou remover móveis.
          Os móveis cadastrados são salvos automaticamente no seu navegador.
        </div>
      </div>
    </div>
  );
};

export default FurnitureManager;