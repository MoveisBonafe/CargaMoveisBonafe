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
  const [autoDistribute, setAutoDistribute] = useState(true);
  
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
    
    // Se a distribuição automática está ativada e item não já estava colocado
    let finalPosition = { x, y, z };
    
    if (autoDistribute && !itemAlreadyPlaced) {
      // Criar um objeto temporário para passar para a função findOptimalPosition
      const tempItem: FurnitureItemPosition = {
        ...itemData,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      };
      
      // Encontrar posição ótima e usar suas coordenadas
      const optimalPos = findOptimalPosition(tempItem);
      finalPosition = { 
        x: optimalPos.x, 
        y: optimalPos.y, 
        z: optimalPos.z 
      };
      
      console.log("Posicionando automaticamente em:", finalPosition);
    }
    
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
