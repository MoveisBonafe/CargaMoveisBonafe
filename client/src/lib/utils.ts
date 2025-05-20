import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));

/**
 * Função para obter o caminho correto para os recursos, funcionando
 * tanto localmente quanto no GitHub Pages.
 */
export function getAssetPath(path: string): string {
  // Remover a barra inicial se existir
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Verificar se estamos no GitHub Pages
  const hostname = window.location.hostname;
  if (hostname.includes('github.io') || hostname.includes('moveisbonafe.github.io')) {
    // No GitHub Pages, o caminho base é /CargaMoveisBonafe/
    return `/CargaMoveisBonafe/${normalizedPath}`;
  }
  
  // Localmente, usamos o caminho relativo 
  return `/${normalizedPath}`;
}

export { getLocalStorage, setLocalStorage };
