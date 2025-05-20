/**
 * Script para corrigir os caminhos de recursos no GitHub Pages
 * Este arquivo é carregado antes do aplicativo principal e corrige os caminhos dos recursos
 */

(function() {
  console.log('GitHub Pages path fixer iniciado');

  // Detecta se estamos no GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    console.log('Executando no GitHub Pages, ajustando caminhos');
    
    // Armazena o caminho base original para interceptar requisições de recursos
    window.originalFetch = window.fetch;
    
    // Sobrescreve o método fetch para corrigir URLs
    window.fetch = function(url, options) {
      let newUrl = url;
      
      // Corrige URLs absolutas para recursos como texturas e sons
      if (typeof url === 'string' && url.startsWith('/')) {
        newUrl = `/CargaMoveisBonafe${url}`;
        console.log(`URL corrigida: ${url} -> ${newUrl}`);
      }
      
      return window.originalFetch(newUrl, options);
    };
    
    // Corrige o carregamento de imagens e áudios
    const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    const originalAudioSrc = Object.getOwnPropertyDescriptor(HTMLAudioElement.prototype, 'src');
    
    if (originalImageSrc && originalImageSrc.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        set: function(url) {
          if (url.startsWith('/')) {
            const newUrl = `/CargaMoveisBonafe${url}`;
            console.log(`Image src corrigida: ${url} -> ${newUrl}`);
            originalImageSrc.set.call(this, newUrl);
          } else {
            originalImageSrc.set.call(this, url);
          }
        },
        get: originalImageSrc.get
      });
    }
    
    if (originalAudioSrc && originalAudioSrc.set) {
      Object.defineProperty(HTMLAudioElement.prototype, 'src', {
        set: function(url) {
          if (url.startsWith('/')) {
            const newUrl = `/CargaMoveisBonafe${url}`;
            console.log(`Audio src corrigida: ${url} -> ${newUrl}`);
            originalAudioSrc.set.call(this, newUrl);
          } else {
            originalAudioSrc.set.call(this, url);
          }
        },
        get: originalAudioSrc.get
      });
    }
    
    // Expõe uma função global para ajustar URLs
    window.getGitHubPagesPath = function(path) {
      if (path.startsWith('/')) {
        return `/CargaMoveisBonafe${path}`;
      }
      return path;
    };
    
    // Simula base href para o THREE.js encontrar recursos
    const base = document.createElement('base');
    base.href = '/CargaMoveisBonafe/';
    document.head.appendChild(base);
  }
})();