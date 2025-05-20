/**
 * Script para corrigir os caminhos de recursos no GitHub Pages
 * Este arquivo é carregado antes do aplicativo principal e corrige os caminhos dos recursos
 */

(function() {
  console.log('GitHub Pages path fixer iniciado');

  // Detecta se estamos no GitHub Pages ou no ambiente de desenvolvimento
  const isGitHubPages = window.location.hostname.includes('github.io');
  const hostname = window.location.hostname;
  
  // Determina o domínio base para os recursos
  let baseDomain = '';
  if (hostname === 'moveisbonafe.github.io') {
    baseDomain = 'https://moveisbonafe.github.io/CargaMoveisBonafe';
  } else if (hostname.includes('github.io')) {
    baseDomain = window.location.origin + '/CargaMoveisBonafe';
  }
  
  if (isGitHubPages) {
    console.log('Executando no GitHub Pages, ajustando caminhos para: ' + baseDomain);
    
    // Armazena a implementação original do Audio
    const originalAudio = window.Audio;
    
    // Sobrescreve o construtor Audio para corrigir URLs
    window.Audio = function(src) {
      if (src && typeof src === 'string') {
        if (src.startsWith('/')) {
          // Caminho absoluto, precisa ser corrigido
          const newSrc = `${baseDomain}${src}`;
          console.log(`Audio src corrigida: ${src} -> ${newSrc}`);
          return new originalAudio(newSrc);
        }
      }
      return new originalAudio(src);
    };
    
    // Preserva o prototype
    window.Audio.prototype = originalAudio.prototype;
    
    // Sobrescreve THREE.js TextureLoader
    window.addEventListener('load', function() {
      if (window.THREE && window.THREE.TextureLoader) {
        const originalLoad = window.THREE.TextureLoader.prototype.load;
        
        window.THREE.TextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
          if (url && typeof url === 'string' && url.startsWith('/')) {
            const newUrl = `${baseDomain}${url}`;
            console.log(`Texture url corrigida: ${url} -> ${newUrl}`);
            return originalLoad.call(this, newUrl, onLoad, onProgress, onError);
          }
          return originalLoad.call(this, url, onLoad, onProgress, onError);
        };
      }
    });
    
    // Expõe função global para ajustar URLs
    window.getCorrectPath = function(path) {
      if (path && typeof path === 'string' && path.startsWith('/')) {
        return `${baseDomain}${path}`;
      }
      return path;
    };
    
    // Sobrescreve as requisições XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      let newUrl = url;
      if (url && typeof url === 'string' && url.startsWith('/')) {
        newUrl = `${baseDomain}${url}`;
        console.log(`XHR url corrigida: ${url} -> ${newUrl}`);
      }
      return originalOpen.call(this, method, newUrl, async, user, password);
    };
    
    // Sobrescreve fetch para corrigir URLs
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      let newUrl = url;
      if (url && typeof url === 'string' && url.startsWith('/')) {
        newUrl = `${baseDomain}${url}`;
        console.log(`Fetch url corrigida: ${url} -> ${newUrl}`);
      }
      return originalFetch(newUrl, options);
    };
    
    // Adicionamos base href para o THREE.js e outros recursos
    const base = document.createElement('base');
    base.href = baseDomain + '/';
    document.head.appendChild(base);
    
    // Define globalmente o basePath para o aplicativo
    window.basePath = baseDomain;

    // Informa ao console que os patches foram aplicados
    console.log('Patches para GitHub Pages aplicados com sucesso!');
  }
})();