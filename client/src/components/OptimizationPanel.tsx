import React, { useState } from 'react';
import { Button } from './ui/button';
import { FurnitureItemPosition } from '../types';
import { useFurnitureStore } from '../lib/stores/useFurnitureStore';
import { useTruckStore } from '../lib/stores/useTruckStore';
import { useAudio } from '../lib/stores/useAudio';
// Função auxiliar para verificar colisões
const checkCollision = (item1: FurnitureItemPosition, item2: FurnitureItemPosition): boolean => {
  return (
    item1.position.x - item1.width/2 < item2.position.x + item2.width/2 &&
    item1.position.x + item1.width/2 > item2.position.x - item2.width/2 &&
    item1.position.y - item1.height/2 < item2.position.y + item2.height/2 &&
    item1.position.y + item1.height/2 > item2.position.y - item2.height/2 &&
    item1.position.z - item1.depth/2 < item2.position.z + item2.depth/2 &&
    item1.position.z + item1.depth/2 > item2.position.z - item2.depth/2
  );
};

interface OptimizationPanelProps {
  className?: string;
}

const OptimizationPanel = ({ className }: OptimizationPanelProps) => {
  const { 
    placedItems, 
    setPlacedItems, 
    resetPlacedItems, 
    items 
  } = useFurnitureStore();
  
  const { 
    truckDimensions, 
    currentWeight, 
    addWeight, 
    removeWeight, 
    resetWeight 
  } = useTruckStore();
  
  const { playHit, playSuccess } = useAudio.getState();
  
  // Estado de otimização em progresso
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Estado para mostrar informações sobre o carregamento
  const [volumeUsed, setVolumeUsed] = useState<number>(0);
  const [volumePercentage, setVolumePercentage] = useState<number>(0);
  const [weightPercentage, setWeightPercentage] = useState<number>(0);
  
  // Função auxiliar para calcular o uso do caminhão
  const calculateUsage = () => {
    // Calcular volume total do caminhão
    const truckVolume = truckDimensions.width * truckDimensions.height * truckDimensions.depth;
    
    // Calcular volume ocupado pelos itens
    let itemsVolume = 0;
    placedItems.forEach(item => {
      itemsVolume += item.width * item.height * item.depth;
    });
    
    // Calcular porcentagens
    const volumePercent = (itemsVolume / truckVolume) * 100;
    const weightPercent = (currentWeight / truckDimensions.maxWeight) * 100;
    
    setVolumeUsed(itemsVolume);
    setVolumePercentage(Math.min(volumePercent, 100));
    setWeightPercentage(Math.min(weightPercent, 100));
  };
  
  // Atualizar o uso sempre que os itens ou pesos mudarem
  React.useEffect(() => {
    calculateUsage();
  }, [placedItems, currentWeight, truckDimensions]);
  
  // Função para resetar a configuração do caminhão
  const resetConfiguration = () => {
    if (placedItems.length === 0) {
      alert("O caminhão já está vazio.");
      return;
    }
    
    if (window.confirm("Tem certeza que deseja limpar o caminhão? Todos os itens serão removidos.")) {
      // Remover todos os itens
      resetPlacedItems();
      resetWeight();
      playSuccess();
    }
  };
  
  // Função para otimizar por peso
  const optimizeByWeight = () => {
    setIsOptimizing(true);
    
    try {
      if (placedItems.length === 0) {
        alert("Não há itens para otimizar.");
        setIsOptimizing(false);
        return;
      }
      
      // Salvar os itens atuais
      const itemsToOptimize = [...placedItems];
      
      // Limpar a configuração atual
      resetPlacedItems();
      resetWeight();
      
      // Ordenar por peso (do mais pesado para o mais leve)
      itemsToOptimize.sort((a, b) => b.weight - a.weight);
      
      // Dimensões do caminhão
      const { width: truckWidth, height: truckHeight, depth: truckDepth } = truckDimensions;
      
      // Distribuir os itens para balancear o peso
      const newPlacements: FurnitureItemPosition[] = [];
      
      // Flag para alternar lados (para distribuição de peso equilibrada)
      let leftSide = true;
      
      // Colocar itens pesados na parte traseira, alternando entre os lados
      itemsToOptimize.forEach((item, index) => {
        // Determinar posição com base no peso (índice após ordenação)
        let posX, posZ;
        
        // Os 20% mais pesados vão na parte traseira
        if (index < itemsToOptimize.length * 0.2) {
          posX = leftSide ? -truckWidth/4 : truckWidth/4;
          posZ = -truckDepth/3;
        } 
        // Os 30% intermediários vão no meio
        else if (index < itemsToOptimize.length * 0.5) {
          posX = leftSide ? -truckWidth/5 : truckWidth/5;
          posZ = 0;
        } 
        // Os mais leves vão na frente
        else {
          posX = leftSide ? -truckWidth/6 : truckWidth/6;
          posZ = truckDepth/4;
        }
        
        // Alternar lados para próximo item
        leftSide = !leftSide;
        
        // Determinar altura Y (empilhamento)
        let posY = item.height / 2; // Começa no chão
        
        // Verificar se pode empilhar em cima de outro item
        for (const placedItem of newPlacements) {
          // Verificar se este item está aproximadamente na mesma posição X,Z
          if (Math.abs(placedItem.position.x - posX) < item.width/2 && 
              Math.abs(placedItem.position.z - posZ) < item.depth/2) {
            
            // Verificar dimensões para empilhamento
            if (item.width <= placedItem.width * 1.1 && 
                item.depth <= placedItem.depth * 1.1) {
              // Posicionar em cima do item existente
              posY = placedItem.position.y + placedItem.height/2 + item.height/2;
              break;
            }
          }
        }
        
        // Criar o novo posicionamento
        const newPlacement: FurnitureItemPosition = {
          ...item,
          position: { x: posX, y: posY, z: posZ },
          rotation: { x: 0, y: 0, z: 0 }
        };
        
        // Adicionar à lista de itens posicionados
        newPlacements.push(newPlacement);
        addWeight(item.weight);
      });
      
      // Atualizar os itens no caminhão
      setPlacedItems(newPlacements);
      playSuccess();
      
    } catch (error) {
      console.error("Erro ao otimizar por peso:", error);
      playHit();
      alert("Ocorreu um erro ao otimizar a distribuição.");
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Função para otimizar por espaço (volume)
  const optimizeBySpace = () => {
    setIsOptimizing(true);
    
    try {
      if (placedItems.length === 0) {
        alert("Não há itens para otimizar.");
        setIsOptimizing(false);
        return;
      }
      
      // Salvar os itens atuais
      const itemsToOptimize = [...placedItems];
      
      // Limpar a configuração atual
      resetPlacedItems();
      resetWeight();
      
      // Ordenar por volume (do maior para o menor)
      itemsToOptimize.sort((a, b) => {
        const volumeA = a.width * a.height * a.depth;
        const volumeB = b.width * b.height * b.depth;
        return volumeB - volumeA;
      });
      
      // Dimensões do caminhão
      const { width: truckWidth, height: truckHeight, depth: truckDepth } = truckDimensions;
      
      // Algoritmo de posicionamento: "First Fit Decreasing"
      const newPlacements: FurnitureItemPosition[] = [];
      
      // Tamanho da grade para posicionamento
      const gridSize = 0.5; // 0.5m de espaçamento na grade
      
      // Verificar se uma posição está disponível para posicionar um item
      const isPositionAvailable = (
        item: FurnitureItemPosition, 
        x: number, 
        y: number, 
        z: number
      ): boolean => {
        // Verificar limites do caminhão
        if (x - item.width/2 < -truckWidth/2 || x + item.width/2 > truckWidth/2 ||
            y - item.height/2 < 0 || y + item.height/2 > truckHeight ||
            z - item.depth/2 < -truckDepth/2 || z + item.depth/2 > truckDepth/2) {
          return false;
        }
        
        // Verificar colisões com outros itens
        const testPlacement = {
          ...item,
          position: { x, y, z },
          rotation: { x: 0, y: 0, z: 0 }
        };
        
        for (const placedItem of newPlacements) {
          if (checkCollision(testPlacement, placedItem)) {
            return false;
          }
        }
        
        return true;
      };
      
      // Posicionar cada item
      itemsToOptimize.forEach(item => {
        // Opções para rotação do item (para melhor aproveitamento de espaço)
        const orientations = [
          { width: item.width, height: item.height, depth: item.depth, yRot: 0 },
          { width: item.depth, height: item.height, depth: item.width, yRot: Math.PI/2 },
        ];
        
        let bestPosition = null;
        let bestY = truckHeight; // Começar de cima para encontrar posição mais baixa
        let bestOrientation = orientations[0];
        
        // Testar cada orientação possível do item
        for (const orientation of orientations) {
          // Percorrer a grade para encontrar a posição ideal
          for (let z = -truckDepth/2 + orientation.depth/2; z <= truckDepth/2 - orientation.depth/2; z += gridSize) {
            for (let x = -truckWidth/2 + orientation.width/2; x <= truckWidth/2 - orientation.width/2; x += gridSize) {
              // Começar do chão e verificar se há espaço
              for (let y = orientation.height/2; y <= truckHeight - orientation.height/2; y += gridSize) {
                if (isPositionAvailable(
                  {...item, width: orientation.width, height: orientation.height, depth: orientation.depth},
                  x, y, z
                )) {
                  // Encontramos uma posição válida, verificar se é melhor que a atual
                  if (y < bestY) {
                    bestY = y;
                    bestPosition = { x, y, z };
                    bestOrientation = orientation;
                    break; // Encontramos a melhor posição para este x,z
                  }
                }
              }
            }
          }
        }
        
        // Se encontramos uma posição válida, adicionar o item
        if (bestPosition) {
          const newPlacement: FurnitureItemPosition = {
            ...item,
            width: bestOrientation.width,
            height: bestOrientation.height,
            depth: bestOrientation.depth,
            position: bestPosition,
            rotation: { x: 0, y: bestOrientation.yRot, z: 0 }
          };
          
          newPlacements.push(newPlacement);
          addWeight(item.weight);
        } else {
          console.warn(`Não foi possível encontrar posição para o item ${item.name}`);
        }
      });
      
      // Atualizar os itens no caminhão
      setPlacedItems(newPlacements);
      playSuccess();
      
    } catch (error) {
      console.error("Erro ao otimizar por espaço:", error);
      playHit();
      alert("Ocorreu um erro ao otimizar a distribuição.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className={`bg-card p-4 rounded-lg border shadow-md ${className}`}>
      <h3 className="text-lg font-medium mb-3">Ajuste Automático</h3>
      
      <div className="mb-4 space-y-4">
        {/* Indicadores de uso */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Volume Utilizado:</span>
              <span>{volumePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${volumePercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Peso Utilizado:</span>
              <span>{weightPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${weightPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {currentWeight.toFixed(1)}kg de {truckDimensions.maxWeight}kg
          </div>
        </div>
        
        {/* Botões de otimização */}
        <div className="space-y-2">
          <Button 
            className="w-full" 
            onClick={optimizeByWeight}
            disabled={isOptimizing || placedItems.length === 0}
          >
            {isOptimizing ? "Otimizando..." : "Distribuir por Peso"}
          </Button>
          
          <Button 
            className="w-full" 
            onClick={optimizeBySpace}
            disabled={isOptimizing || placedItems.length === 0}
          >
            {isOptimizing ? "Otimizando..." : "Distribuir por Espaço"}
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={resetConfiguration}
            disabled={isOptimizing || placedItems.length === 0}
          >
            Resetar Caminhão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationPanel;