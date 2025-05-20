import { useState, useEffect } from "react";
import TruckVisualization from "./TruckVisualization";
import ConfigPanel from "./ConfigPanel";
import ExportPanel from "./ExportPanel";
import TruckSelector from "./TruckSelector";
import FurnitureManager from "./FurnitureManager";
import { Button } from "./ui/button";
import { useFurnitureStore } from "../lib/stores/useFurnitureStore";
import { useTruckStore } from "../lib/stores/useTruckStore";

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

  return (
    <div className="relative flex h-full w-full">
      {/* 3D visualization taking most of the screen */}
      <div className="flex-grow">
        <TruckVisualization />
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
        
        <div className="flex-grow overflow-auto custom-scrollbar">
          {activePanel === "config" ? (
            <div className="space-y-6 p-4">
              {/* Seleção de Caminhão */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-3">Tipo de Caminhão</h2>
                <TruckSelector />
              </div>
              
              {/* Gerenciamento de Móveis */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-3">Gerenciamento de Móveis</h2>
                <FurnitureManager />
              </div>
              
              {/* Painel de Configuração Original */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Configurações Avançadas</h2>
                <ConfigPanel />
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

import { useAudio } from "../lib/stores/useAudio";

export default TruckLoader;
