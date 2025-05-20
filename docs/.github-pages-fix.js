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
  
  // Criação de texturas base64 para substituir as texturas que faltam
  const textureBase64Data = {
    '/textures/wood.jpg': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCABAAEABAREA/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAMEBQIG/8QALRAAAgEDAwMEAQQCAwAAAAAAAQIDAAQRBRIhMUFRBhMiYRQycYGRFaEjwdH/2gAIAQEAAD8A+qUpSuXdVGWIA+zVdtVtEOGuYxj/AOVwdYsl63kQ/wA1UVlcblgQfIzXdKVS1OC5ks3SzlWOZgQrMMDPY/z0r59YDU9LvpdM1KASQKZEcBcgOv6lyOxxzjsa1NN9a61YqLfU7dbhUON7yFHx58g/zmu9TuJNZ1sO7MLa3JIHx4VerY7k8D+SfFQI7EbVyRnJ7VbtZ2OBn5DI4rS/7plIZdxJPYHAr594i0rX31e/mt5Z7yWeQtKPkWTJ6HHIx2xXrLHWdc0GMwX8ZuFJK+7jDEeeB19iuIdY1vVIzIEitVDYQD5ue3PP+hUCJvWGx+V0hDggZGR0J/8ASKnvL2K0xvJ3McMOprNt9UtOkiyEsccDAPOK2JLm2khZ1LbeOACSfpR1NeO0v01FNmRtcSIjEbVlAIGf9GvT6VHLFpsCTkGTbknGOprQpSlYN9qMVn+nDSnsnj+TVA6neXBPsW6xqf1PIcn+BWnZwqi5kZpZT1dzk/8AnyakureC5iKTRJKh7OoI/wAVCt9Ggt5yNPlktQTuijkwEP2D0+xXdvbyx3RkM7yRnpHu+K/2B/2aupSlczSxxLukdUHliAKxbjWrNUJhb3pOOE6Z/fpVQareyN/4bRicYDSMF/xya7hnv5GPuSRQDttTDH+TVkORXVKUqve2FrfR7J41YdmPVT9HtVSO1vbH/jx7sXaM/wCj4P8As1ZivIHTaXUN2wwqkbw6xJFiRPcjPVl6j9xUiKQSLuA2nvUlKUpSlK4kRJF2uqsPBGa5jgjiBEaKgPXaMUupIbe3aSQEhflhRkn6Hk1Y026kuI3WSNY3Q8YHBB+/+6vpSlKV//Z',
  };
  
  // Arquivos de áudio como data:URIs
  const audioFiles = {
    '/sounds/background.mp3': `data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA=`,
    '/sounds/hit.mp3': `data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA=`,
    '/sounds/success.mp3': `data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA=`
  };
  
  if (isGitHubPages) {
    console.log('Executando no GitHub Pages, ajustando caminhos para: ' + baseDomain);
    
    // PATCH 1: Adicionar texturas como imagens no DOM para pré-carregar
    // Aguardar o DOM estar completamente carregado
    window.addEventListener('DOMContentLoaded', function() {
      Object.keys(textureBase64Data).forEach(key => {
        const img = new Image();
        img.src = textureBase64Data[key];
        img.style.display = 'none';
        img.id = 'preloaded-' + key.replace(/[\/\.]/g, '-');
        document.body.appendChild(img);
      });
      console.log('Texturas base64 pré-carregadas com sucesso');
    });
    
    // PATCH 2: Sobrescreve construções de URLs
    function fixResourcePath(url) {
      if (!url || typeof url !== 'string') return url;
      
      // Se for um caminho de textura com base64 disponível
      if (textureBase64Data[url]) {
        return textureBase64Data[url];
      }
      
      // Se for um caminho de áudio, substituir pelo blob criado
      if (audioFiles[url]) {
        return audioFiles[url];
      }
      
      // Se for um caminho absoluto, corrigir para o domínio do GitHub Pages
      if (url.startsWith('/')) {
        // Se for textura ou som, tentar corrigir especificamente
        if (url.includes('/textures/') || url.includes('/sounds/')) {
          const baseName = url.split('/').pop();
          return `${baseDomain}/${url.substring(1)}`;
        }
        
        const newUrl = `${baseDomain}${url}`;
        return newUrl;
      }
      
      return url;
    }
    
    // PATCH 3: Sobrescrever THREE.js
    window.addEventListener('load', function() {
      // Injetar no código do THREE.js após ele ser carregado
      setTimeout(() => {
        // THREE.js geralmente estará disponível neste ponto
        if (window.THREE) {
          console.log('THREE.js detectado - ajustando TextureLoader');
          
          // Patch para o TextureLoader
          if (window.THREE.TextureLoader) {
            const originalLoad = window.THREE.TextureLoader.prototype.load;
            
            window.THREE.TextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
              // Verificar se é uma URL que precisa de correção
              let newUrl = url;
              
              // Se for um caminho de textura com base64 disponível
              if (textureBase64Data[url]) {
                newUrl = textureBase64Data[url];
                console.log(`Substituindo textura por versão base64: ${url}`);
                return originalLoad.call(this, newUrl, onLoad, onProgress, onError);
              }
              
              // Corrigir caminho se for absoluto
              if (url.startsWith('/')) {
                newUrl = `${baseDomain}${url}`;
                console.log(`Texture URL corrigida: ${url} -> ${newUrl}`);
              }
              
              return originalLoad.call(this, newUrl, onLoad, onProgress, onError);
            };
          }
        }
      }, 500); // Pequeno atraso para garantir que o THREE.js seja carregado
    });
    
    // PATCH 4: Armazena a implementação original do Audio
    const originalAudio = window.Audio;
    
    // Sobrescreve o construtor Audio para corrigir URLs
    window.Audio = function(src) {
      let newSrc = src;
      
      // Verificar se é um arquivo de áudio conhecido
      if (src && typeof src === 'string') {
        if (audioFiles[src]) {
          newSrc = audioFiles[src];
          console.log(`Substituindo áudio por versão base64: ${src}`);
        } else if (src.startsWith('/')) {
          newSrc = `${baseDomain}${src}`;
          console.log(`Audio src corrigida: ${src} -> ${newSrc}`);
        }
      }
      
      return new originalAudio(newSrc);
    };
    
    // Preserva o prototype
    window.Audio.prototype = originalAudio.prototype;
    
    // PATCH 5: Corrige imagens e outros recursos
    
    // Modifica o Image.prototype.src para corrigir caminhos de texturas
    const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (originalImageSrc && originalImageSrc.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        set: function(url) {
          let newUrl = url;
          
          if (url && typeof url === 'string') {
            // Verificar se temos uma versão base64 dessa textura
            if (textureBase64Data[url]) {
              newUrl = textureBase64Data[url];
              console.log(`Substituindo imagem por versão base64: ${url}`);
            } else if (url.startsWith('/')) {
              newUrl = `${baseDomain}${url}`;
              console.log(`Image src corrigida: ${url} -> ${newUrl}`);
            }
          }
          
          originalImageSrc.set.call(this, newUrl);
        },
        get: originalImageSrc.get
      });
    }
    
    // PATCH 6: Sobrescreve as requisições XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      let newUrl = url;
      
      if (url && typeof url === 'string' && url.startsWith('/')) {
        newUrl = `${baseDomain}${url}`;
        console.log(`XHR url corrigida: ${url} -> ${newUrl}`);
      }
      
      return originalOpen.call(this, method, newUrl, async, user, password);
    };
    
    // PATCH 7: Sobrescreve fetch para corrigir URLs
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      let newUrl = url;
      
      if (url && typeof url === 'string' && url.startsWith('/')) {
        newUrl = `${baseDomain}${url}`;
        console.log(`Fetch url corrigida: ${url} -> ${newUrl}`);
      }
      
      return originalFetch(newUrl, options);
    };
    
    // PATCH 8: Adiciona base href no documento
    const base = document.createElement('base');
    base.href = baseDomain + '/';
    document.head.appendChild(base);
    
    // PATCH 9: Expõe função global para ajustar URLs e base path
    window.getCorrectPath = fixResourcePath;
    window.basePath = baseDomain;
    
    // PATCH 10: Informa ao console que os patches foram aplicados
    console.log('Patches para GitHub Pages aplicados com sucesso!');
  }
})();