import { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FurnitureItemPosition } from "../types";
import { useAudio } from "../lib/stores/useAudio";

interface FurnitureItemProps {
  item: FurnitureItemPosition;
  isPlaced: boolean;
  isDragging?: boolean;
  isSelected?: boolean;
  onDragStart?: () => void;
  onDragMove?: (position: THREE.Vector3) => void;
  onPlacement?: (position: THREE.Vector3) => void;
}

const FurnitureItem = ({
  item,
  isPlaced,
  isDragging = false,
  isSelected = false,
  onDragStart,
  onDragMove,
  onPlacement
}: FurnitureItemProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scene, camera, raycaster, pointer, gl } = useThree();
  const { playHit } = useAudio.getState();
  const [isDraggingInternal, setIsDraggingInternal] = useState(false);
  
  // Create a plane at y=0 (floor level) for intersection testing
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  
  // Handle pointer down event
  const handlePointerDown = (e: any) => {
    if (!isPlaced && !isDragging) return;
    e.stopPropagation();
    setIsDraggingInternal(true);
    if (onDragStart) {
      onDragStart();
      playHit();
    }
    gl.domElement.style.cursor = 'grabbing';
  };
  
  // Handle pointer up event
  const handlePointerUp = (e: any) => {
    if (!isDraggingInternal) return;
    e.stopPropagation();
    setIsDraggingInternal(false);
    
    if (isDragging && onPlacement) {
      // Create a ray from the camera to the pointer
      raycaster.setFromCamera(pointer, camera);
      
      // Find where the ray intersects the plane
      const target = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, target);
      
      // Call the placement handler
      onPlacement(target);
    }
    
    gl.domElement.style.cursor = 'auto';
  };
  
  // Handle pointer move event
  const handlePointerMove = (e: any) => {
    if (!isDraggingInternal || !isDragging || !onDragMove) return;
    e.stopPropagation();
    
    // Create a ray from the camera to the pointer
    raycaster.setFromCamera(pointer, camera);
    
    // Find where the ray intersects the plane
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);
    
    // Call the drag move handler
    onDragMove(target);
  };
  
  // Add event listeners for drag events
  useEffect(() => {
    const domElement = gl.domElement;
    
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingInternal, isDragging, onDragMove, onPlacement]);
  
  // Set position and rotation
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.x = item.position.x;
      meshRef.current.position.y = item.position.y;
      meshRef.current.position.z = item.position.z;
      
      meshRef.current.rotation.x = item.rotation.x;
      meshRef.current.rotation.y = item.rotation.y;
      meshRef.current.rotation.z = item.rotation.z;
    }
  }, [item]);
  
  // Animation for selected/dragging items
  useFrame((_, delta) => {
    if (meshRef.current && (isSelected || isDragging)) {
      // Subtle hover animation
      const time = Date.now() * 0.001;
      meshRef.current.position.y = item.position.y + Math.sin(time * 2) * 0.05;
    }
  });
  
  // Create material with color
  const material = new THREE.MeshStandardMaterial({
    color: item.color,
    metalness: 0.2,
    roughness: 0.7,
    transparent: isDragging || isSelected,
    opacity: isDragging || isSelected ? 0.7 : 1
  });
  
  // Material for outline
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.5
  });
  
  return (
    <group>
      {/* Item mesh */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerOver={() => gl.domElement.style.cursor = isPlaced ? "pointer" : "default"}
        onPointerOut={() => gl.domElement.style.cursor = "default"}
      >
        <boxGeometry args={[item.width, item.height, item.depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Outline mesh (only for selected items) */}
      {isSelected && (
        <mesh
          position={[item.position.x, item.position.y, item.position.z]}
          rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
        >
          <boxGeometry args={[
            item.width + 0.05,
            item.height + 0.05,
            item.depth + 0.05
          ]} />
          <primitive object={outlineMaterial} attach="material" />
        </mesh>
      )}
      
      {/* Item label */}
      <Html
        position={[item.position.x, item.position.y + item.height / 2 + 0.2, item.position.z]}
        center
        distanceFactor={10}
      >
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {item.name}
        </div>
      </Html>
    </group>
  );
};

// Import Html component
import { Html } from "@react-three/drei";

export default FurnitureItem;
