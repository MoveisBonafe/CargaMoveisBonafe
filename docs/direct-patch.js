/**
 * Patch de inserção direta de texturas para o GitHub Pages
 * Este é um patch de último recurso que modifica diretamente o código compilado
 */

(function() {
  // Aguardar o carregamento completo da página
  window.addEventListener('load', function() {
    console.log('Aplicando patch direto de textura...');
    
    // Textura de madeira em base64
    const woodTextureBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCABAAEABAREA/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAMEBQIG/8QALRAAAgEDAwMEAQQCAwAAAAAAAQIDAAQRBRIhMUFRBhMiYRQycYGRFaEjwdH/2gAIAQEAAD8A+qUpSuXdVGWIA+zVdtVtEOGuYxj/AOVwdYsl63kQ/wA1UVlcblgQfIzXdKVS1OC5ks3SzlWOZgQrMMDPY/z0r59YDU9LvpdM1KASQKZEcBcgOv6lyOxxzjsa1NN9a61YqLfU7dbhUON7yFHx58g/zmu9TuJNZ1sO7MLa3JIHx4VerY7k8D+SfFQI7EbVyRnJ7VbtZ2OBn5DI4rS/7plIZdxJPYHAr594i0rX31e/mt5Z7yWeQtKPkWTJ6HHIx2xXrLHWdc0GMwX8ZuFJK+7jDEeeB19iuIdY1vVIzIEitVDYQD5ue3PP+hUCJvWGx+V0hDggZGR0J/8ASKnvL2K0xvJ3McMOprNt9UtOkiyEsccDAPOK2JLm2khZ1LbeOACSfpR1NeO0v01FNmRtcSIjEbVlAIGf9GvT6VHLFpsCTkGTbknGOprQpSlYN9qMVn+nDSnsnj+TVA6neXBPsW6xqf1PIcn+BWnZwqi5kZpZT1dzk/8AnyakureC5iKTRJKh7OoI/wAVCt9Ggt5yNPlktQTuijkwEP2D0+xXdvbyx3RkM7yRnpHu+K/2B/2aupSlczSxxLukdUHliAKxbjWrNUJhb3pOOE6Z/fpVQareyN/4bRicYDSMF/xya7hnv5GPuSRQDttTDH+TVkORXVKUqve2FrfR7J41YdmPVT9HtVSO1vbH/jx7sXaM/wCj4P8As1ZivIHTaXUN2wwqkbw6xJFiRPcjPVl6j9xUiKQSLuA2nvUlKUpSlK4kRJF2uqsPBGa5jgjiBEaKgPXaMUupIbe3aSQEhflhRkn6Hk1Y026kuI3WSNY3Q8YHBB+/+6vpSlKV//Z';
    
    // Criar um elemento de imagem para carregar e testar a textura
    const img = new Image();
    img.src = woodTextureBase64;
    
    // Verificar quando a imagem estiver carregada
    img.onload = function() {
      console.log('Imagem de textura carregada com sucesso!');
      
      // Criar um patch direto para injetar a textura no código
      // Este é o método mais extremo, mas funciona quando tudo falha
      try {
        // Obter a textura diretamente no THREE global
        if (window.THREE) {
          console.log('THREE encontrado, aplicando patch direto');
          
          // Criar uma textura THREE.js
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          
          // Monitorar todas as requisições de textura
          const originalTextureLoader = THREE.TextureLoader.prototype.load;
          
          THREE.TextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
            if (url === '/textures/wood.jpg') {
              console.log('Interceptando solicitação de textura wood.jpg');
              setTimeout(() => {
                if (onLoad) onLoad(texture);
              }, 10);
              return texture;
            }
            
            return originalTextureLoader.call(this, url, onLoad, onProgress, onError);
          };
          
          // Adicionar a textura diretamente ao cache global do THREE
          if (THREE.Cache) {
            THREE.Cache.add('/textures/wood.jpg', texture);
            console.log('Textura adicionada ao cache do THREE');
          }
          
          // Medida extrema: substituir qualquer tentativa de carregar a textura
          document.querySelectorAll('script').forEach(script => {
            if (script.textContent && script.textContent.includes('/textures/wood.jpg')) {
              console.log('Script com referência a wood.jpg encontrado, observando...');
            }
          });
          
          // Expor a textura globalmente
          window._woodTexture = texture;
          THREE.woodTexture = texture;
          
          console.log('Patch direto aplicado com sucesso!');
        } else {
          console.log('THREE.js não encontrado. Aguardando...');
          setTimeout(arguments.callee, 200);
        }
      } catch (e) {
        console.error('Erro ao aplicar patch direto:', e);
      }
    };
    
    // Em caso de erro no carregamento da imagem
    img.onerror = function() {
      console.error('Falha ao carregar imagem base64');
    };
  });
})();