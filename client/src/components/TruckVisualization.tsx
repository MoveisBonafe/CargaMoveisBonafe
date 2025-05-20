import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { 
  OrbitControls, 
  useTexture, 
  Grid, 
  Environment, 
  PerspectiveCamera,
  Plane
} from "@react-three/drei";
import * as THREE from "three";
import { useKeyboardControls } from "@react-three/drei";
import { Controls as ControlsType, FurnitureItemPosition } from "../types";
import FurnitureItem from "./FurnitureItem";
import { useFurnitureStore } from "../lib/stores/useFurnitureStore";
import { useTruckStore } from "../lib/stores/useTruckStore";
import ControlsPanel from "./Controls";
import { useAudio } from "../lib/stores/useAudio";

// Helper function to check collisions between two items
const checkCollision = (item1: FurnitureItemPosition, item2: FurnitureItemPosition) => {
  return (
    item1.position.x < item2.position.x + item2.width &&
    item1.position.x + item1.width > item2.position.x &&
    item1.position.y < item2.position.y + item2.height &&
    item1.position.y + item1.height > item2.position.y &&
    item1.position.z < item2.position.z + item2.depth &&
    item1.position.z + item1.depth > item2.position.z
  );
};

// Truck component for visualizing the truck box
const Truck = () => {
  // Obtém o caminho base correto para os recursos
  const getAssetPath = (path: string) => {
    // Se window.basePath existir (definido no index.html), use-o
    const basePath = (window as any).basePath || '/';
    // Remove a barra inicial se o basePath já terminar com uma barra
    if (path.startsWith('/') && basePath.endsWith('/')) {
      path = path.substring(1);
    }
    return `${basePath}${path}`;
  };
  
  const woodTexture = useTexture(getAssetPath("textures/wood.jpg"));
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(5, 5);
  
  const { truckDimensions } = useTruckStore();
  const { width, height, depth } = truckDimensions;
  
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
      
      {/* Back wall */}
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color="#555555" transparent opacity={0.2} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, height, depth]} />
        <meshStandardMaterial color="#555555" transparent opacity={0.2} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, height, depth]} />
        <meshStandardMaterial color="#555555" transparent opacity={0.2} />
      </mesh>
      
      {/* Ceiling (optional, can be transparent) */}
      <mesh position={[0, height, 0]} receiveShadow>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color="#444444" transparent opacity={0.1} />
      </mesh>
      
      {/* Grid for floor reference */}
      <Grid
        position={[0, 0.11, 0]}
        args={[width, depth, 10, 10]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#6f6f6f"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={30}
      />
    </group>
  );
};

// Main visualization component
const TruckVisualization = () => {
  const { items, placedItems, setPlacedItems, getStackingRules, resetPlacedItems } = useFurnitureStore();
  const { 
    truckDimensions, 
    currentWeight, 
    addWeight, 
    removeWeight, 
    resetWeight 
  } = useTruckStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<FurnitureItemPosition | null>(null);
  const { playHit, playSuccess } = useAudio.getState();
  
  // Estado para controlar o tipo de distribuição automática
  const [optimizationType, setOptimizationType] = useState<'none' | 'weight' | 'space'>('none');
  
  // Função para resetar a configuração
  const resetConfiguration = () => {
    // Remover o item atualmente arrastado, se houver
    setDraggedItem(null);
    
    // Remover todos os itens do caminhão
    placedItems.forEach(item => {
      removeWeight(item.weight);
    });
    
    // Limpar a lista de itens colocados
    resetPlacedItems();
    resetWeight();
    
    console.log("Configuração resetada. Todos os itens removidos do caminhão.");
  };
  
  // Função para otimizar a distribuição de carga com base no peso
  const optimizeByWeight = () => {
    if (placedItems.length === 0) {
      alert("Não há itens para otimizar.");
      return;
    }
    
    // Remover todos os itens atuais para reorganizá-los
    const itemsToOptimize = [...placedItems];
    resetPlacedItems();
    resetWeight();
    
    // Ordenar itens por peso (do mais pesado para o mais leve)
    itemsToOptimize.sort((a, b) => b.weight - a.weight);
    
    // Dimensões do caminhão para cálculos
    const { width: truckWidth, depth: truckDepth } = truckDimensions;
    
    // Definir grid para posicionamento dos itens
    const gridX = truckWidth / 3; // Divide caminhão em 3 seções horizontais
    const gridZ = truckDepth / 3; // Divide caminhão em 3 seções de profundidade
    
    // Distribuir itens para balancear o peso
    // Mais pesados nas bordas de trás, mais leves no centro e frente
    const newPlacements: FurnitureItemPosition[] = [];
    let leftHeavy = true; // Alternar entre esquerda e direita para balanço
    
    itemsToOptimize.forEach((item, index) => {
      // Calcular posição com base no índice e peso
      let posX, posZ;
      
      if (index % 3 === 0) { // Itens mais pesados (começando do índice 0, 3, 6...)
        posX = leftHeavy ? -truckWidth/4 : truckWidth/4; // Alternar entre lados
        posZ = -truckDepth/3; // Parte traseira do caminhão
        leftHeavy = !leftHeavy; // Inverter para o próximo item pesado
      } else if (index % 3 === 1) { // Itens de peso médio
        posX = leftHeavy ? truckWidth/5 : -truckWidth/5;
        posZ = 0; // Centro do caminhão
      } else { // Itens mais leves
        posX = leftHeavy ? -truckWidth/6 : truckWidth/6;
        posZ = truckDepth/3; // Parte frontal do caminhão
      }
      
      // Calcular posição Y (altura) para empilhamento
      // Verificar se há algo abaixo para empilhar
      let posY = item.height / 2; // Começa no chão
      let canStack = false;
      
      for (const placedItem of newPlacements) {
        // Verificar se este item pode ser colocado em cima de outro
        if (Math.abs(placedItem.position.x - posX) < 0.5 && 
            Math.abs(placedItem.position.z - posZ) < 0.5) {
          
          // Verificar se as dimensões são compatíveis
          if (item.width <= placedItem.width && item.depth <= placedItem.depth) {
            posY = placedItem.position.y + placedItem.height/2 + item.height/2;
            canStack = true;
            break;
          }
        }
      }
      
      // Adicionar item na nova posição
      const newPlacement: FurnitureItemPosition = {
        ...item,
        position: { x: posX, y: posY, z: posZ },
        rotation: { x: 0, y: 0, z: 0 } // Reset rotação para simplificar
      };
      
      newPlacements.push(newPlacement);
      addWeight(item.weight);
    });
    
    // Atualizar a lista de itens colocados
    setPlacedItems(newPlacements);
    playSuccess();
  };
  
  // Função para otimizar a distribuição de carga com base no espaço
  const optimizeBySpace = () => {
    if (placedItems.length === 0) {
      alert("Não há itens para otimizar.");
      return;
    }
    
    // Remover todos os itens atuais para reorganizá-los
    const itemsToOptimize = [...placedItems];
    resetPlacedItems();
    resetWeight();
    
    // Ordenar itens por volume (do maior para o menor)
    itemsToOptimize.sort((a, b) => {
      const volumeA = a.width * a.height * a.depth;
      const volumeB = b.width * b.height * b.depth;
      return volumeB - volumeA;
    });
    
    // Dimensões do caminhão
    const { width: truckWidth, height: truckHeight, depth: truckDepth } = truckDimensions;
    
    // Algoritmo de "Best Fit Decreasing" para otimização de espaço
    const newPlacements: FurnitureItemPosition[] = [];
    
    // Criar grid 3D para posicionamento
    const gridSizeX = 0.5; // Incremento de 0.5m no eixo X
    const gridSizeZ = 0.5; // Incremento de 0.5m no eixo Z
    
    // Função para verificar se um item pode ser colocado em uma posição
    const canPlaceItem = (item: FurnitureItemPosition, x: number, y: number, z: number): boolean => {
      // Verificar limites do caminhão
      if (x - item.width/2 < -truckWidth/2 || x + item.width/2 > truckWidth/2 ||
          y - item.height/2 < 0 || y + item.height/2 > truckHeight ||
          z - item.depth/2 < -truckDepth/2 || z + item.depth/2 > truckDepth/2) {
        return false;
      }
      
      // Verificar colisões com outros itens
      const testItem = {
        ...item,
        position: { x, y, z },
        rotation: { x: 0, y: 0, z: 0 }
      };
      
      for (const placedItem of newPlacements) {
        if (checkCollision(testItem, placedItem)) {
          return false;
        }
      }
      
      return true;
    };
    
    // Colocar cada item no local mais baixo possível
    itemsToOptimize.forEach(item => {
      let bestX = 0, bestY = 0, bestZ = 0;
      let bestY_value = truckHeight; // Começar do topo para encontrar a posição mais baixa
      
      // Tentar todas as posições possíveis da grade
      for (let z = -truckDepth/2 + item.depth/2; z <= truckDepth/2 - item.depth/2; z += gridSizeZ) {
        for (let x = -truckWidth/2 + item.width/2; x <= truckWidth/2 - item.width/2; x += gridSizeX) {
          // Começar do chão e subir até encontrar uma posição válida
          for (let y = item.height/2; y <= truckHeight - item.height/2; y += 0.1) {
            if (canPlaceItem(item, x, y, z)) {
              // Se esta posição é mais baixa que a melhor encontrada, atualizar
              if (y < bestY_value) {
                bestX = x;
                bestY = y;
                bestZ = z;
                bestY_value = y;
                break; // Encontrou a posição mais baixa para este x,z
              }
            }
          }
        }
      }
      
      // Se encontrou uma posição válida
      if (bestY_value < truckHeight) {
        const newPlacement: FurnitureItemPosition = {
          ...item,
          position: { x: bestX, y: bestY, z: bestZ },
          rotation: { x: 0, y: 0, z: 0 }
        };
        
        newPlacements.push(newPlacement);
        addWeight(item.weight);
      } else {
        console.warn(`Não foi possível encontrar posição para o item ${item.name}`);
      }
    });
    
    // Atualizar a lista de itens colocados
    setPlacedItems(newPlacements);
    playSuccess();
  };
  
  // Function to handle item drag start
  const handleDragStart = (itemId: string) => {
    setSelectedItem(itemId);
    const existingPlacement = placedItems.find(item => item.id === itemId);
    
    if (existingPlacement) {
      // Se o item já está colocado, permitir o ajuste fino
      // sem removê-lo completamente, apenas marcá-lo como selecionado
      // para permitir o reposicionamento sem perder seu lugar
      setDraggedItem(existingPlacement);
    } else {
      // If it's a new item, create a new placement
      const itemData = items.find(item => item.id === itemId);
      if (itemData) {
        // Verificar se adicionar esse item excederá o peso máximo do caminhão
        if (currentWeight + itemData.weight > truckDimensions.maxWeight) {
          alert(`Não é possível adicionar este item. Excederá o peso máximo do caminhão (${truckDimensions.maxWeight} kg).`);
          playHit();
          return;
        }
        
        const newPlacement: FurnitureItemPosition = {
          ...itemData,
          position: { x: 0, y: itemData.height / 2, z: 0 },
          rotation: { x: 0, y: 0, z: 0 }
        };
        setDraggedItem(newPlacement);
      }
    }
  };
  
  // Referência para a função de rotação
  const [rotationMode, setRotationMode] = useState(false);
  const [keyboardControlsActive, setKeyboardControlsActive] = useState(false);
  
  // Estado para controlar a distribuição automática
  // (Este estado foi removido e substituído por optimizationType)
  
  // Função para alternar modo de rotação
  const toggleRotationMode = () => {
    setRotationMode(prev => !prev);
  };
  
  // Função para encontrar uma posição adequada para um novo item
  const findOptimalPosition = (itemData: FurnitureItemPosition): THREE.Vector3 => {
    const { width, height, depth } = itemData;
    const { width: truckWidth, height: truckHeight, depth: truckDepth } = truckDimensions;
    
    // Definir uma grade para posições potenciais
    const gridStepX = 0.5;
    const gridStepZ = 0.5;
    
    // Começar do fundo do caminhão
    for (let z = -truckDepth/2 + depth/2; z <= truckDepth/2 - depth/2; z += gridStepZ) {
      for (let x = -truckWidth/2 + width/2; x <= truckWidth/2 - width/2; x += gridStepX) {
        // Verificar se podemos colocar no chão
        const position = new THREE.Vector3(x, height/2, z);
        
        // Crie uma posição de teste para verificar colisões
        const testPlacement = {
          ...itemData,
          position: {
            x: position.x,
            y: position.y,
            z: position.z
          },
          rotation: { x: 0, y: 0, z: 0 }
        };
        
        // Verificar colisões com itens já colocados
        let hasCollision = false;
        for (const placedItem of placedItems) {
          if (checkCollision(testPlacement, placedItem)) {
            hasCollision = true;
            break;
          }
        }
        
        // Se não houver colisão, retornar esta posição
        if (!hasCollision) {
          return position;
        }
      }
    }
    
    // Se não encontrar uma posição ótima, retornar o centro do caminhão
    return new THREE.Vector3(0, height/2, 0);
  };
  
  // Function to handle item placement
  const handlePlacement = (position: THREE.Vector3) => {
    if (!draggedItem || !selectedItem) return;
    
    const itemData = items.find(item => item.id === selectedItem);
    if (!itemData) return;
    
    // Verificar se o item já estava colocado (ajuste fino)
    const itemAlreadyPlaced = placedItems.some(item => item.id === selectedItem);
    
    // Check if position is within truck bounds
    const halfWidth = itemData.width / 2;
    const halfDepth = itemData.depth / 2;
    
    const truckHalfWidth = truckDimensions.width / 2;
    const truckHalfDepth = truckDimensions.depth / 2;
    
    // Verificar se o item está completamente dentro dos limites do caminhão
    if (
      position.x - halfWidth < -truckHalfWidth ||
      position.x + halfWidth > truckHalfWidth ||
      position.z - halfDepth < -truckHalfDepth ||
      position.z + halfDepth > truckHalfDepth
    ) {
      // O item está fora dos limites do caminhão, não permitir a colocação
      playHit(); // Tocar som de erro
      return; // Sair da função sem colocar o item
    }
    
    // Se chegou até aqui, o item está dentro dos limites
    // Garantir que o item fique totalmente dentro do caminhão
    let x = Math.min(Math.max(position.x, -truckHalfWidth + halfWidth), truckHalfWidth - halfWidth);
    let z = Math.min(Math.max(position.z, -truckHalfDepth + halfDepth), truckHalfDepth - halfDepth);
    
    // Find floor level (may be on top of another item)
    let y = itemData.height / 2; // Start with item on the ground
    
    // Posição final do item
    let finalPosition = { x, y, z };
    
    const newPlacement: FurnitureItemPosition = {
      ...itemData,
      position: finalPosition,
      rotation: draggedItem.rotation
    };
    
    // Check if we can place it on top of another item
    const stackingRules = getStackingRules();
    
    // Sort placed items by y-position (height) to check from bottom to top
    const sortedItems = [...placedItems].sort((a, b) => 
      a.position.y - b.position.y
    );
    
    for (const placedItem of sortedItems) {
      // Skip if it's the same item
      if (placedItem.id === selectedItem) continue;
      
      // Create temporary placement to check collision at current height
      const tempPlacement = { ...newPlacement };
      
      // Check if there's an x-z overlap (item is above the other)
      if (
        Math.abs(placedItem.position.x - x) < (placedItem.width + itemData.width) / 2 &&
        Math.abs(placedItem.position.z - z) < (placedItem.depth + itemData.depth) / 2
      ) {
        // Check if we can stack this item on top of the other
        const canStack = stackingRules.some(rule => 
          rule.item1Id === placedItem.id && rule.item2Id === selectedItem
        );
        
        if (canStack) {
          // Calculate new y position on top of the item
          const newY = placedItem.position.y + placedItem.height / 2 + itemData.height / 2;
          
          // Update position and check if it exceeds truck height
          if (newY + itemData.height / 2 <= truckDimensions.height) {
            y = newY;
          }
        }
      }
    }
    
    // Update final placement
    newPlacement.position.y = y;
    
    // Check collision with other items
    let hasCollision = false;
    for (const placedItem of placedItems) {
      if (placedItem.id === selectedItem) continue;
      
      if (checkCollision(newPlacement, placedItem)) {
        hasCollision = true;
        break;
      }
    }
    
    // Verificar se a altura máxima de empilhamento será excedida
    if (y + itemData.height / 2 > truckDimensions.maxStackHeight) {
      alert(`Não é possível colocar este item. Excederá a altura máxima de empilhamento (${truckDimensions.maxStackHeight} unidades).`);
      playHit();
      return;
    }
    
    if (!hasCollision) {
      if (itemAlreadyPlaced) {
        // Se é um ajuste de posição, atualize a posição do item existente
        const updatedItems = placedItems.map(item => 
          item.id === selectedItem ? newPlacement : item
        );
        setPlacedItems(updatedItems);
      } else {
        // Adicionar o peso do item ao peso total do caminhão (apenas para novos itens)
        addWeight(itemData.weight);
        
        // Add to placed items
        setPlacedItems([...placedItems, newPlacement]);
      }
      
      setDraggedItem(null);
      setSelectedItem(null);
      playSuccess();
    } else {
      // If collision, play error sound
      playHit();
    }
  };
  
  // Function to handle drag movement
  const handleDragMove = (position: THREE.Vector3) => {
    if (!draggedItem) return;
    
    setDraggedItem({
      ...draggedItem,
      position: { 
        x: position.x, 
        y: draggedItem.height / 2, 
        z: position.z 
      }
    });
  };
  
  return (
    <Canvas shadows>
      <PerspectiveCamera
        makeDefault
        position={[10, 10, 10]}
        fov={45}
        near={0.1}
        far={1000}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      
      <Suspense fallback={null}>
        {/* Truck */}
        <Truck />
        
        {/* Placed items */}
        {placedItems.map((item) => (
          <FurnitureItem
            key={item.id}
            item={item}
            isPlaced={true}
            onDragStart={() => handleDragStart(item.id)}
            isSelected={selectedItem === item.id}
          />
        ))}
        
        {/* Currently dragged item */}
        {draggedItem && (
          <FurnitureItem
            item={draggedItem}
            isPlaced={false}
            isDragging={true}
            isSelected={true}
            onDragMove={handleDragMove}
            onPlacement={handlePlacement}
          />
        )}
        
        {/* Controles de otimização automática */}
        <div className="absolute top-4 right-4 bg-background p-3 rounded-lg border shadow-md">
          <h3 className="text-sm font-medium mb-2">Ajuste Automático</h3>
          <div className="space-y-2">
            <button 
              className="w-full px-3 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
              onClick={() => {
                // Implementar otimização por peso
                optimizeByWeight();
              }}
            >
              Distribuir por Peso
            </button>
            <button 
              className="w-full px-3 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
              onClick={() => {
                // Implementar otimização por espaço
                optimizeBySpace();
              }}
            >
              Distribuir por Espaço
            </button>
            <button 
              className="w-full px-3 py-2 text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md"
              onClick={() => {
                // Resetar configuração
                if (window.confirm("Tem certeza que deseja resetar a configuração? Todos os itens serão removidos do caminhão.")) {
                  resetConfiguration();
                }
              }}
            >
              Resetar Caminhão
            </button>
          </div>
        </div>
        
        {/* Controls panel for item selection */}
        <ControlsPanel 
          items={items} 
          placedItems={placedItems} 
          onDragStart={handleDragStart} 
          selectedItem={selectedItem}
        />
        
        <OrbitControls 
          makeDefault 
          minDistance={2}
          maxDistance={30}
          target={[0, truckDimensions.height / 2, 0]}
        />
      </Suspense>
    </Canvas>
  );
};

export default TruckVisualization;
