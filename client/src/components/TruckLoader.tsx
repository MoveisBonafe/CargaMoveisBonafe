import { useState, useEffect } from "react";
import TruckVisualization from "./TruckVisualization";
import ConfigPanel from "./ConfigPanel";
import ExportPanel from "./ExportPanel";
import TruckSelector from "./TruckSelector";
import FurnitureManager from "./FurnitureManager";
import AvailableItems from "./AvailableItems";
import Controls from "./Controls";
import { Button } from "./ui/button";
import { useFurnitureStore } from "../lib/stores/useFurnitureStore";
import { useTruckStore } from "../lib/stores/useTruckStore";
import { useAudio } from "../lib/stores/useAudio";
import { FurnitureItemPosition } from "../types";

const TruckLoader = () => {
  const [activePanel, setActivePanel] = useState<"config" | "export">("config");
  const resetTruck = useTruckStore(state => state.resetTruck);
  const { resetItems } = useFurnitureStore();
  
  // Carregar dados salvos quando o componente é montado
  useEffect(() => {
    // Carregar tipos de caminhão e móveis do localStorage
    useTruckStore.getState().loadTrucksFromLocalStorage();
    useFurnitureStore.getState().loadItemsFromLocalStorage();
  }, []);

  const handleReset = () => {
    resetTruck();
    resetItems();
  };

  // Estados e funções para o controle de itens
  const { items, placedItems } = useFurnitureStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Função para iniciar o arrasto de um item
  const handleDragStart = (itemId: string) => {
    console.log(`Iniciando arrasto do item ${itemId}`);
    setSelectedItem(itemId);
  };

  return (
    <div className="relative flex h-full w-full">
      {/* 3D visualization taking most of the screen */}
      <div className="flex-grow relative">
        <TruckVisualization selectedItemId={selectedItem} />
        
        {/* Painel de controle flutuante (fora do contexto Three.js) */}
        <Controls 
          items={items}
          placedItems={placedItems}
          onDragStart={handleDragStart}
          selectedItem={selectedItem}
        />
      </div>

      {/* Sidebar panel */}
      <div className="w-96 bg-card border-l border-border h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-2xl font-bold">Carregador de Caminhão</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant={activePanel === "config" ? "default" : "outline"} 
              onClick={() => setActivePanel("config")}
            >
              Configurar
            </Button>
            <Button 
              variant={activePanel === "export" ? "default" : "outline"} 
              onClick={() => setActivePanel("export")}
            >
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Itens Disponíveis - Sempre visível */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            Itens Disponíveis
          </h2>
          <div className="h-[120px]">
            <AvailableItems onItemSelect={(item) => {
              // Adicionar o item diretamente quando selecionado
              const { placedItems, setPlacedItems } = useFurnitureStore.getState();
              const { truckDimensions, addWeight } = useTruckStore.getState();
              
              // Posição padrão no centro do caminhão
              const newItem: FurnitureItemPosition = {
                ...item,
                position: { x: 0, y: item.height/2, z: 0 },
                rotation: { x: 0, y: 0, z: 0 }
              };
              
              setPlacedItems([...placedItems, newItem]);
              addWeight(item.weight);
            }} />
          </div>
        </div>
        
        {/* Painel de Otimização Automática */}
        <div className="px-4 py-3 border-b border-border bg-blue-50/30">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            Otimização de Carga
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button 
              size="sm"
              onClick={() => {
                // Distribuir por peso
                const { placedItems, setPlacedItems, resetPlacedItems } = useFurnitureStore.getState();
                const { truckDimensions, addWeight, resetWeight } = useTruckStore.getState();
                const { playSuccess } = useAudio.getState();
                
                if (placedItems.length === 0) {
                  alert("Não há itens para otimizar.");
                  return;
                }
                
                // Backup, limpar e reordenar
                const itemsToOptimize = [...placedItems];
                resetPlacedItems();
                resetWeight();
                
                // Ordenar por peso (do mais pesado para o mais leve)
                itemsToOptimize.sort((a, b) => b.weight - a.weight);
                
                // Dimensões
                const { width, depth } = truckDimensions;
                
                // Reorganizar
                const newItems: FurnitureItemPosition[] = [];
                let leftSide = true;
                
                itemsToOptimize.forEach((item, index) => {
                  // Posição baseada no peso
                  let posX = leftSide ? -width/4 : width/4;
                  let posZ = index < itemsToOptimize.length * 0.5 ? -depth/3 : 0;
                  leftSide = !leftSide;
                  
                  const newItem = {
                    ...item,
                    position: { x: posX, y: item.height/2, z: posZ },
                    rotation: { x: 0, y: 0, z: 0 }
                  };
                  
                  newItems.push(newItem);
                  addWeight(item.weight);
                });
                
                setPlacedItems(newItems);
                playSuccess();
              }}
            >
              Por Peso
            </Button>
            
            <Button 
              size="sm"
              onClick={() => {
                // Distribuir por espaço
                const { placedItems, setPlacedItems, resetPlacedItems } = useFurnitureStore.getState();
                const { truckDimensions, addWeight, resetWeight } = useTruckStore.getState();
                const { playSuccess } = useAudio.getState();
                
                if (placedItems.length === 0) {
                  alert("Não há itens para otimizar.");
                  return;
                }
                
                // Backup, limpar e reordenar
                const itemsToOptimize = [...placedItems];
                resetPlacedItems();
                resetWeight();
                
                // Ordenar por volume
                itemsToOptimize.sort((a, b) => {
                  return (b.width * b.height * b.depth) - (a.width * a.height * a.depth);
                });
                
                // Dimensões
                const { width, depth } = truckDimensions;
                
                // Reorganizar em grid
                const newItems: FurnitureItemPosition[] = [];
                const cols = 3;
                
                itemsToOptimize.forEach((item, index) => {
                  const row = Math.floor(index / cols);
                  const col = index % cols;
                  
                  const posX = (col - 1) * width/3;
                  const posZ = row * 0.5 - depth/3;
                  
                  const newItem = {
                    ...item,
                    position: { x: posX, y: item.height/2, z: posZ },
                    rotation: { x: 0, y: 0, z: 0 }
                  };
                  
                  newItems.push(newItem);
                  addWeight(item.weight);
                });
                
                setPlacedItems(newItems);
                playSuccess();
              }}
            >
              Por Espaço
            </Button>
          </div>
          
          <Button 
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={() => {
              if (window.confirm("Tem certeza que deseja limpar o caminhão? Todos os itens serão removidos.")) {
                resetTruck();
                resetItems();
              }
            }}
          >
            Limpar Caminhão
          </Button>
        </div>
        
        <div className="flex-grow overflow-auto custom-scrollbar">
          {activePanel === "config" ? (
            <div className="space-y-6 p-4">
              {/* Seleção de Caminhão */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-3">Tipo de Caminhão</h2>
                <TruckSelector />
              </div>
              
              {/* Gerenciamento de Móveis */}
              <div className="pb-4">
                <h2 className="text-xl font-semibold mb-3">Gerenciamento de Móveis</h2>
                <FurnitureManager />
              </div>
            </div>
          ) : (
            <ExportPanel />
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-between">
          <Button 
            variant="destructive" 
            onClick={handleReset}
          >
            Reiniciar Caminhão
          </Button>
          
          <Button onClick={() => {
            const { toggleMute } = useAudio.getState();
            toggleMute();
          }}>
            Alternar Som
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TruckLoader;
