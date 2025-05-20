import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));

// Textura de madeira em base64 para solução de problemas no GitHub Pages
export const WOOD_TEXTURE_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCABAAEABAREA/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAMEBQIG/8QALRAAAgEDAwMEAQQCAwAAAAAAAQIDAAQRBRIhMUFRBhMiYRQycYGRFaEjwdH/2gAIAQEAAD8A+qUpSuXdVGWIA+zVdtVtEOGuYxj/AOVwdYsl63kQ/wA1UVlcblgQfIzXdKVS1OC5ks3SzlWOZgQrMMDPY/z0r59YDU9LvpdM1KASQKZEcBcgOv6lyOxxzjsa1NN9a61YqLfU7dbhUON7yFHx58g/zmu9TuJNZ1sO7MLa3JIHx4VerY7k8D+SfFQI7EbVyRnJ7VbtZ2OBn5DI4rS/7plIZdxJPYHAr594i0rX31e/mt5Z7yWeQtKPkWTJ6HHIx2xXrLHWdc0GMwX8ZuFJK+7jDEeeB19iuIdY1vVIzIEitVDYQD5ue3PP+hUCJvWGx+V0hDggZGR0J/8ASKnvL2K0xvJ3McMOprNt9UtOkiyEsccDAPOK2JLm2khZ1LbeOACSfpR1NeO0v01FNmRtcSIjEbVlAIGf9GvT6VHLFpsCTkGTbknGOprQpSlYN9qMVn+nDSnsnj+TVA6neXBPsW6xqf1PIcn+BWnZwqi5kZpZT1dzk/8AnyakureC5iKTRJKh7OoI/wAVCt9Ggt5yNPlktQTuijkwEP2D0+xXdvbyx3RkM7yRnpHu+K/2B/2aupSlczSxxLukdUHliAKxbjWrNUJhb3pOOE6Z/fpVQareyN/4bRicYDSMF/xya7hnv5GPuSRQDttTDH+TVkORXVKUqve2FrfR7J41YdmPVT9HtVSO1vbH/jx7sXaM/wCj4P8As1ZivIHTaXUN2wwqkbw6xJFiRPcjPVl6j9xUiKQSLuA2nvUlKUpSlK4kRJF2uqsPBGa5jgjiBEaKgPXaMUupIbe3aSQEhflhRkn6Hk1Y026kuI3WSNY3Q8YHBB+/+6vpSlKV//Z';

/**
 * Função para obter o caminho correto para os recursos, funcionando
 * tanto localmente quanto no GitHub Pages.
 */
export function getAssetPath(path: string): string {
  // Caso especial para a textura wood.jpg
  if (path === '/textures/wood.jpg') {
    // Retornar a textura base64 diretamente
    return WOOD_TEXTURE_BASE64;
  }

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

/**
 * Função para verificar se uma URL é uma URL de dados (data:URL)
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

export { getLocalStorage, setLocalStorage };
