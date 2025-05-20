/**
 * Patch para adicionar texturas diretamente na aplicação
 * Este script deve ser carregado após o script principal
 */

(function() {
  console.log('Texture patch iniciado');
  
  // Textura base64 básica de madeira
  const woodTextureBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCABAAEABAREA/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAMEBQIG/8QALRAAAgEDAwMEAQQCAwAAAAAAAQIDAAQRBRIhMUFRBhMiYRQycYGRFaEjwdH/2gAIAQEAAD8A+qUpSuXdVGWIA+zVdtVtEOGuYxj/AOVwdYsl63kQ/wA1UVlcblgQfIzXdKVS1OC5ks3SzlWOZgQrMMDPY/z0r59YDU9LvpdM1KASQKZEcBcgOv6lyOxxzjsa1NN9a61YqLfU7dbhUON7yFHx58g/zmu9TuJNZ1sO7MLa3JIHx4VerY7k8D+SfFQI7EbVyRnJ7VbtZ2OBn5DI4rS/7plIZdxJPYHAr594i0rX31e/mt5Z7yWeQtKPkWTJ6HHIx2xXrLHWdc0GMwX8ZuFJK+7jDEeeB19iuIdY1vVIzIEitVDYQD5ue3PP+hUCJvWGx+V0hDggZGR0J/8ASKnvL2K0xvJ3McMOprNt9UtOkiyEsccDAPOK2JLm2khZ1LbeOACSfpR1NeO0v01FNmRtcSIjEbVlAIGf9GvT6VHLFpsCTkGTbknGOprQpSlYN9qMVn+nDSnsnj+TVA6neXBPsW6xqf1PIcn+BWnZwqi5kZpZT1dzk/8AnyakureC5iKTRJKh7OoI/wAVCt9Ggt5yNPlktQTuijkwEP2D0+xXdvbyx3RkM7yRnpHu+K/2B/2aupSlczSxxLukdUHliAKxbjWrNUJhb3pOOE6Z/fpVQareyN/4bRicYDSMF/xya7hnv5GPuSRQDttTDH+TVkORXVKUqve2FrfR7J41YdmPVT9HtVSO1vbH/jx7sXaM/wCj4P8As1ZivIHTaXUN2wwqkbw6xJFiRPcjPVl6j9xUiKQSLuA2nvUlKUpSlK4kRJF2uqsPBGa5jgjiBEaKgPXaMUupIbe3aSQEhflhRkn6Hk1Y026kuI3WSNY3Q8YHBB+/+6vpSlKV//Z';
  
  // Função para criar uma textura a partir de uma imagem base64
  function createTextureFromBase64(base64Data) {
    const image = new Image();
    image.src = base64Data;
    
    // Garantir que a imagem está carregada
    if (!image.complete) {
      image.onload = function() {
        console.log('Imagem base64 carregada com sucesso');
      };
      image.onerror = function() {
        console.error('Erro ao carregar imagem base64');
      };
    }
    
    // Criar uma textura Three.js se o THREE estiver disponível
    if (window.THREE) {
      try {
        const texture = new THREE.Texture();
        texture.image = image;
        texture.needsUpdate = true;
        
        // Adicionar a textura ao cache global do THREE.js
        THREE.Cache.add('/textures/wood.jpg', texture);
        
        console.log('Textura adicionada ao cache do THREE.js');
        
        // Substituir o método TextureLoader.load para fornecer a textura 
        // quando /textures/wood.jpg for solicitada
        const originalLoad = THREE.TextureLoader.prototype.load;
        THREE.TextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
          // Se for a textura de madeira, retornar nossa textura pré-carregada
          if (url === '/textures/wood.jpg') {
            console.log('Interceptando requisição de textura para /textures/wood.jpg');
            
            // Chamar o callback de carregamento, se fornecido
            if (onLoad) {
              setTimeout(() => onLoad(texture), 10);
            }
            
            return texture;
          }
          
          // Caso contrário, chamar o método original
          return originalLoad.call(this, url, onLoad, onProgress, onError);
        };
        
      } catch (e) {
        console.error('Erro ao criar textura THREE.js:', e);
      }
    }
    
    return image;
  }
  
  // Função para aplicar o patch
  function applyTexturePatch() {
    // Criar a textura base64
    const woodTexture = createTextureFromBase64(woodTextureBase64);
    
    // Se THREE não estiver disponível, aguardar e tentar novamente
    if (!window.THREE) {
      console.log('THREE.js ainda não disponível, aguardando...');
      setTimeout(applyTexturePatch, 500);
      return;
    }
    
    console.log('Patch de textura aplicado com sucesso!');
  }
  
  // Iniciar o processo de patch
  applyTexturePatch();
  
})();