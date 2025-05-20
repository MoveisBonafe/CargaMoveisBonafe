import { useEffect } from 'react';

/**
 * Componente que se encarrega de corrigir os caminhos de recursos quando a aplicação 
 * está rodando no GitHub Pages.
 * 
 * Este componente não renderiza nada visualmente, apenas aplica as correções necessárias
 * no carregamento da aplicação.
 */
const PathFixComponent = () => {
  useEffect(() => {
    // Verifica se estamos no GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
      console.log('Componente de correção de caminhos inicializado no GitHub Pages');
      
      // Verifica se temos referência às texturas e sons
      const texturesElements = document.querySelectorAll('img[src^="/textures/"]');
      const audioElements = document.querySelectorAll('audio[src^="/sounds/"]');
      
      // Corrige os caminhos das texturas
      texturesElements.forEach(img => {
        const originalSrc = img.getAttribute('src');
        if (originalSrc && originalSrc.startsWith('/')) {
          const newSrc = `/CargaMoveisBonafe${originalSrc}`;
          console.log(`Corrigindo textura: ${originalSrc} -> ${newSrc}`);
          img.setAttribute('src', newSrc);
        }
      });
      
      // Corrige os caminhos dos sons
      audioElements.forEach(audio => {
        const originalSrc = audio.getAttribute('src');
        if (originalSrc && originalSrc.startsWith('/')) {
          const newSrc = `/CargaMoveisBonafe${originalSrc}`;
          console.log(`Corrigindo áudio: ${originalSrc} -> ${newSrc}`);
          audio.setAttribute('src', newSrc);
        }
      });
    }
  }, []);
  
  // Este componente não renderiza nada visualmente
  return null;
};

export default PathFixComponent;