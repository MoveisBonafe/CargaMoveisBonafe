import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { getAssetPath } from "./lib/utils";
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
