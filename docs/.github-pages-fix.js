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
    
    // Cria cópias dos arquivos de áudio no próprio domínio
    const audioFiles = {
      '/sounds/background.mp3': `data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA=`,
      '/sounds/hit.mp3': `data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA=`,
      '/sounds/success.mp3': `data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA=`
    };
    
    // Sobrescreve construções de URLs
    function fixResourcePath(url) {
      if (!url || typeof url !== 'string') return url;
      
      // Se for um caminho de áudio, substituir pelo blob criado
      if (audioFiles[url]) {
        return audioFiles[url];
      }
      
      // Se for um caminho absoluto, corrigir para o domínio do GitHub Pages
      if (url.startsWith('/')) {
        const newUrl = `${baseDomain}${url}`;
        return newUrl;
      }
      
      return url;
    }
    
    // Armazena a implementação original do Audio
    const originalAudio = window.Audio;
    
    // Sobrescreve o construtor Audio para corrigir URLs
    window.Audio = function(src) {
      const newSrc = fixResourcePath(src);
      if (newSrc !== src) {
        console.log(`Audio src corrigida: ${src} -> [data url]`);
      }
      return new originalAudio(newSrc);
    };
    
    // Preserva o prototype
    window.Audio.prototype = originalAudio.prototype;
    
    // Sobrescreve THREE.js TextureLoader
    window.addEventListener('load', function() {
      if (window.THREE && window.THREE.TextureLoader) {
        const originalLoad = window.THREE.TextureLoader.prototype.load;
        
        window.THREE.TextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
          const newUrl = fixResourcePath(url);
          if (newUrl !== url) {
            console.log(`Texture url corrigida: ${url} -> ${newUrl}`);
          }
          return originalLoad.call(this, newUrl, onLoad, onProgress, onError);
        };
      }
    });
    
    // Expõe função global para ajustar URLs
    window.getCorrectPath = fixResourcePath;
    
    // Sobrescreve as requisições XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      const newUrl = fixResourcePath(url);
      if (newUrl !== url) {
        console.log(`XHR url corrigida: ${url} -> [corrigido]`);
      }
      return originalOpen.call(this, method, newUrl, async, user, password);
    };
    
    // Sobrescreve fetch para corrigir URLs
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      const newUrl = fixResourcePath(url);
      if (newUrl !== url) {
        console.log(`Fetch url corrigida: ${url} -> [corrigido]`);
      }
      return originalFetch(newUrl, options);
    };
    
    // Modifica o Image.prototype.src para corrigir caminhos de texturas
    const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (originalImageSrc && originalImageSrc.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        set: function(url) {
          const newUrl = fixResourcePath(url);
          if (newUrl !== url) {
            console.log(`Image src corrigida: ${url} -> [corrigido]`);
          }
          originalImageSrc.set.call(this, newUrl);
        },
        get: originalImageSrc.get
      });
    }
    
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