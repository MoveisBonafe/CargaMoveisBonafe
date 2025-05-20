import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import TruckLoader from "./components/TruckLoader";
import { Controls as ControlsType } from "./types";

// Define control keys for the application
const controls = [
  { name: ControlsType.forward, keys: ["KeyW", "ArrowUp"] },
  { name: ControlsType.backward, keys: ["KeyS", "ArrowDown"] },
  { name: ControlsType.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: ControlsType.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: ControlsType.up, keys: ["KeyE"] },
  { name: ControlsType.down, keys: ["KeyQ"] },
  { name: ControlsType.rotate, keys: ["KeyR"] },
];

// Main App component
function App() {
  // Set up audio elements
  useEffect(() => {
    const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio.getState();
    
    // Use a função que determina o caminho base correto para os recursos
    const getAssetPath = (path: string) => {
      // Se window.basePath existir (definido no index.html), use-o
      const basePath = (window as any).basePath || '/';
      // Remove a barra inicial se o basePath já terminar com uma barra
      if (path.startsWith('/') && basePath.endsWith('/')) {
        path = path.substring(1);
      }
      return `${basePath}${path}`;
    };
    
    const backgroundMusic = new Audio(getAssetPath("sounds/background.mp3"));
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    setBackgroundMusic(backgroundMusic);
    
    const hitSound = new Audio(getAssetPath("sounds/hit.mp3"));
    hitSound.volume = 0.5;
    setHitSound(hitSound);
    
    const successSound = new Audio(getAssetPath("sounds/success.mp3"));
    successSound.volume = 0.7;
    setSuccessSound(successSound);
    
    return () => {
      backgroundMusic.pause();
      hitSound.pause();
      successSound.pause();
    };
  }, []);

  return (
    <KeyboardControls map={controls}>
      <div className="h-screen w-screen overflow-hidden bg-gray-900">
        <TruckLoader />
      </div>
    </KeyboardControls>
  );
}

export default App;
