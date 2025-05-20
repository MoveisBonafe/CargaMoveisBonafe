/**
 * Patch para adicionar texturas diretamente na aplicação
 * Este script deve ser carregado após o script principal
 */

(function() {
  console.log('Texture patch iniciado');
  
  // Textura base64 básica de madeira
  const woodTextureBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCABAAEABAREA/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAMEBQIG/8QALRAAAgEDAwMEAQQCAwAAAAAAAQIDAAQRBRIhMUFRBhMiYRQycYGRFaEjwdH/2gAIAQEAAD8A+qUpSuXdVGWIA+zVdtVtEOGuYxj/AOVwdYsl63kQ/wA1UVlcblgQfIzXdKVS1OC5ks3SzlWOZgQrMMDPY/z0r59YDU9LvpdM1KASQKZEcBcgOv6lyOxxzjsa1NN9a61YqLfU7dbhUON7yFHx58g/zmu9TuJNZ1sO7MLa3JIHx4VerY7k8D+SfFQI7EbVyRnJ7VbtZ2OBn5DI4rS/7plIZdxJPYHAr594i0rX31e/mt5Z7yWeQtKPkWTJ6HHIx2xXrLHWdc0GMwX8ZuFJK+7jDEeeB19iuIdY1vVIzIEitVDYQD5ue3PP+hUCJvWGx+V0hDggZGR0J/8ASKnvL2K0xvJ3McMOprNt9UtOkiyEsccDAPOK2JLm2khZ1LbeOACSfpR1NeO0v01FNmRtcSIjEbVlAIGf9GvT6VHLFpsCTkGTbknGOprQpSlYN9qMVn+nDSnsnj+TVA6neXBPsW6xqf1PIcn+BWnZwqi5kZpZT1dzk/8AnyakureC5iKTRJKh7OoI/wAVCt9Ggt5yNPlktQTuijkwEP2D0+xXdvbyx3RkM7yRnpHu+K/2B/2aupSlczSxxLukdUHliAKxbjWrNUJhb3pOOE6Z/fpVQareyN/4bRicYDSMF/xya7hnv5GPuSRQDttTDH+TVkORXVKUqve2FrfR7J41YdmPVT9HtVSO1vbH/jx7sXaM/wCj4P8As1ZivIHTaXUN2wwqkbw6xJFiRPcjPVl6j9xUiKQSLuA2nvUlKUpSlK4kRJF2uqsPBGa5jgjiBEaKgPXaMUupIbe3aSQEhflhRkn6Hk1Y026kuI3WSNY3Q8YHBB+/+6vpSlKV//Z';
  
  // Criação direta para uso global
  const woodTextureImage = new Image();
  woodTextureImage.src = woodTextureBase64;
  
  // Garantir que a imagem está carregada
  woodTextureImage.onload = function() {
    console.log('Imagem da textura de madeira carregada com sucesso');
  };
  
  // Expor globalmente para acesso simplificado
  window.textures = {
    wood: {
      image: woodTextureImage,
      base64: woodTextureBase64
    }
  };
  
  // Função para criar uma textura Three.js a partir da imagem
  function createThreeJsTexture() {
    try {
      if (!window.THREE) {
        return null;
      }
      
      const texture = new THREE.Texture();
      texture.image = woodTextureImage;
      texture.needsUpdate = true;
      return texture;
    } catch (e) {
      console.error('Erro ao criar textura THREE.js:', e);
      return null;
    }
  }
  
  // Função para monitorar e corrigir erros de textura
  function monitorTextureErrors() {
    // Buscar erros de textura no console
    const originalError = console.error;
    console.error = function(...args) {
      // Se encontrar um erro relacionado à textura de madeira
      if (args.length > 0 && typeof args[0] === 'string' && 
          (args[0].includes('/textures/wood.jpg') || 
           (args[0].includes('Could not load') && args[0].includes('wood.jpg')))) {
        console.log('Interceptando erro de textura, aplicando patch...');
        
        // Tentar corrigir imediatamente
        patchThreeJs();
      }
      
      // Chamar o método original
      return originalError.apply(this, args);
    };
  }
  
  // Função para aplicar o patch no Three.js
  function patchThreeJs() {
    if (!window.THREE) {
      console.log('THREE.js ainda não disponível, aguardando...');
      setTimeout(patchThreeJs, 300);
      return;
    }
    
    try {
      // Criar a textura
      const woodTexture = createThreeJsTexture();
      if (!woodTexture) {
        console.log('Não foi possível criar a textura. Tentando novamente...');
        setTimeout(patchThreeJs, 300);
        return;
      }
      
      // Adicionar ao cache do THREE
      if (THREE.Cache && typeof THREE.Cache.add === 'function') {
        THREE.Cache.add('/textures/wood.jpg', woodTexture);
        console.log('Textura adicionada ao cache do THREE.js');
      }
      
      // Patch global para THREE.TextureLoader
      if (THREE.TextureLoader && THREE.TextureLoader.prototype) {
        const originalLoad = THREE.TextureLoader.prototype.load;
        
        THREE.TextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
          // Interceptar carregamentos de textura de madeira
          if (url === '/textures/wood.jpg') {
            console.log('Interceptando requisição para /textures/wood.jpg');
            
            // Chamar o callback imediatamente
            if (typeof onLoad === 'function') {
              setTimeout(() => onLoad(woodTexture), 0);
            }
            
            return woodTexture;
          }
          
          // Para outras texturas, usar o método original
          return originalLoad.call(this, url, onLoad, onProgress, onError);
        };
        
        console.log('TextureLoader.load substituído com sucesso');
      }
      
      // PATCH: Adicionar à raiz do THREE para acesso direto
      THREE.woodTexture = woodTexture;
      
      console.log('Patch de texturas aplicado com sucesso no THREE.js');
      
    } catch (e) {
      console.error('Erro ao aplicar patch de textura:', e);
    }
  }
  
  // Iniciar as funções de correção
  
  // 1. Monitorar erros no console
  monitorTextureErrors();
  
  // 2. Tentar aplicar o patch quando o DOM estiver pronto
  window.addEventListener('DOMContentLoaded', function() {
    // Tentar aplicar o patch
    setTimeout(patchThreeJs, 100);
  });
  
  // 3. Tentar novamente quando a janela estiver totalmente carregada
  window.addEventListener('load', function() {
    // Tentar aplicar o patch novamente
    setTimeout(patchThreeJs, 500);
  });
  
  // 4. Aplicar imediatamente se possível
  setTimeout(patchThreeJs, 0);
  
})();