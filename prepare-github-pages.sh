#!/bin/bash

# Script para preparar o deploy para GitHub Pages

# Cores para melhorar a legibilidade
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando preparação para GitHub Pages...${NC}"

# 1. Garantir que a pasta docs existe
mkdir -p docs

# 2. Criar arquivo .nojekyll se não existir
if [ ! -f docs/.nojekyll ]; then
  touch docs/.nojekyll
  echo -e "${GREEN}Arquivo .nojekyll criado.${NC}"
fi

# 3. Construir o projeto
echo -e "${YELLOW}Construindo o projeto...${NC}"
npm run build

# 4. Verificar se o build foi bem-sucedido
if [ ! -d "dist/public" ]; then
  echo -e "${RED}Erro: Pasta dist/public não encontrada. O build falhou?${NC}"
  exit 1
fi

# 5. Limpar a pasta docs (mantendo apenas alguns arquivos especiais)
echo -e "${YELLOW}Limpando a pasta docs...${NC}"
find docs -type f -not -name ".nojekyll" -not -name "404.html" -not -name ".github-pages-fix.js" -not -name "texture-patch.js" -not -name "README.md" -delete
find docs -type d -not -path "docs" -empty -delete

# 6. Copiar os arquivos de dist/public para docs
echo -e "${YELLOW}Copiando arquivos para a pasta docs...${NC}"
cp -r dist/public/* docs/

# 7. Verificar se precisa atualizar o index.html
echo -e "${YELLOW}Atualizando caminhos em index.html...${NC}"
sed -i 's|src="/assets|src="./assets|g' docs/index.html
sed -i 's|href="/assets|href="./assets|g' docs/index.html

# 8. Copiar textura base64 para a pasta textures
echo -e "${YELLOW}Copiando texturas e sons...${NC}"
mkdir -p docs/textures docs/sounds
cp -n client/public/textures/wood_base64.js docs/textures/
touch docs/textures/placeholder.txt
touch docs/sounds/placeholder.txt

# 9. Inserir nossa nova versão do index.html
echo -e "${YELLOW}Aplicando correções ao index.html...${NC}"
cat > docs/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Carga Móveis Bonafé</title>
    <meta name="description" content="Ferramenta de visualização de carregamento de caminhão de móveis com restrições de empilhamento e múltiplos pontos de vista" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
    
    <!-- Textura wood.jpg em base64 -->
    <script>
      window.WOOD_TEXTURE_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCABAAEABAREA/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAMEBQIG/8QALRAAAgEDAwMEAQQCAwAAAAAAAQIDAAQRBRIhMUFRBhMiYRQycYGRFaEjwdH/2gAIAQEAAD8A+qUpSuXdVGWIA+zVdtVtEOGuYxj/AOVwdYsl63kQ/wA1UVlcblgQfIzXdKVS1OC5ks3SzlWOZgQrMMDPY/z0r59YDU9LvpdM1KASQKZEcBcgOv6lyOxxzjsa1NN9a61YqLfU7dbhUON7yFHx58g/zmu9TuJNZ1sO7MLa3JIHx4VerY7k8D+SfFQI7EbVyRnJ7VbtZ2OBn5DI4rS/7plIZdxJPYHAr594i0rX31e/mt5Z7yWeQtKPkWTJ6HHIx2xXrLHWdc0GMwX8ZuFJK+7jDEeeB19iuIdY1vVIzIEitVDYQD5ue3PP+hUCJvWGx+V0hDggZGR0J/8ASKnvL2K0xvJ3McMOprNt9UtOkiyEsccDAPOK2JLm2khZ1LbeOACSfpR1NeO0v01FNmRtcSIjEbVlAIGf9GvT6VHLFpsCTkGTbknGOprQpSlYN9qMVn+nDSnsnj+TVA6neXBPsW6xqf1PIcn+BWnZwqi5kZpZT1dzk/8AnyakureC5iKTRJKh7OoI/wAVCt9Ggt5yNPlktQTuijkwEP2D0+xXdvbyx3RkM7yRnpHu+K/2B/2aupSlczSxxLukdUHliAKxbjWrNUJhb3pOOE6Z/fpVQareyN/4bRicYDSMF/xya7hnv5GPuSRQDttTDH+TVkORXVKUqve2FrfR7J41YdmPVT9HtVSO1vbH/jx7sXaM/wCj4P8As1ZivIHTaXUN2wwqkbw6xJFiRPcjPVl6j9xUiKQSLuA2nvUlKUpSlK4kRJF2uqsPBGa5jgjiBEaKgPXaMUupIbe3aSQEhflhRkn6Hk1Y026kuI3WSNY3Q8YHBB+/+6vpSlKV//Z';
    </script>
    
    <!-- Script para resolver problemas no GitHub Pages -->
    <script>
    (function() {
      console.log('Iniciando correções para GitHub Pages');
      
      // Texturas base64 para injeção
      const textures = {
        '/textures/wood.jpg': window.WOOD_TEXTURE_BASE64,
      };
      
      // Sons injetados para carregar corretamente
      const sounds = {
        '/sounds/background.mp3': 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA=',
        '/sounds/hit.mp3': 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA=',
        '/sounds/success.mp3': 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCYXNlNjQgZW5jb2RlZCBhdWRpbyBmb3IgR2l0SHViIFBhZ2VzAFRYWFgAAAAPAAADc2ltcGxlIHNvdW5kAAAAAAAAAAA='
      };
      
      // Quando o DOM estiver carregado, aplicar as correções
      window.addEventListener('DOMContentLoaded', function() {
        // Carregar as texturas antecipadamente
        for (const path in textures) {
          const img = new Image();
          img.src = textures[path];
          img.id = 'preload-' + path.replace(/[\/\.]/g, '-');
          img.style.display = 'none';
          document.body.appendChild(img);
        }
        
        // Substituir o método Image.prototype.src
        const originalSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
        if (originalSrc && originalSrc.set) {
          Object.defineProperty(HTMLImageElement.prototype, 'src', {
            set: function(url) {
              // Caso especial para texturas
              if (url === '/textures/wood.jpg' && textures[url]) {
                console.log('Substituindo URL de textura por versão base64');
                originalSrc.set.call(this, textures[url]);
              } else {
                originalSrc.set.call(this, url);
              }
            },
            get: originalSrc.get
          });
        }
        
        // Substituir o construtor Audio
        const originalAudio = window.Audio;
        window.Audio = function(src) {
          if (src && sounds[src]) {
            console.log('Substituindo áudio por versão base64:', src);
            return new originalAudio(sounds[src]);
          }
          return new originalAudio(src);
        };
        window.Audio.prototype = originalAudio.prototype;
        
        // Quando o THREE.js estiver carregado, aplicar mais correções
        function patchThreeJs() {
          if (!window.THREE) {
            setTimeout(patchThreeJs, 300);
            return;
          }
          
          try {
            // Interceptar o carregamento de texturas
            const originalLoader = THREE.TextureLoader.prototype.load;
            THREE.TextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
              // Verificar se temos uma versão base64 da textura
              if (textures[url]) {
                console.log('Carregando textura base64:', url);
                
                // Criar nova imagem e textura
                const img = new Image();
                img.src = textures[url];
                
                const texture = new THREE.Texture(img);
                
                // Quando a imagem for carregada, atualizar a textura
                img.onload = function() {
                  texture.needsUpdate = true;
                  if (onLoad) onLoad(texture);
                };
                
                // Retornar a textura
                return texture;
              }
              
              // Caso contrário, usar o método original
              return originalLoader.call(this, url, onLoad, onProgress, onError);
            };
            
            console.log('Correções do THREE.js aplicadas com sucesso!');
          } catch (e) {
            console.error('Erro ao aplicar correções do THREE.js:', e);
          }
        }
        
        // Iniciar o processo de patch do THREE.js
        patchThreeJs();
      });
    })();
    </script>
    
    <script type="module" crossorigin src="./assets/index-CFfwdjQH.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/index-C9Psxqmb.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOL

# Garantir que o script esteja usando o nome correto do arquivo gerado pelo Vite
INDEX_NAME=$(find docs/assets -name "index-*.js" | head -n 1 | xargs basename)
if [ -n "$INDEX_NAME" ]; then
  echo -e "${YELLOW}Atualizando referência de script para: $INDEX_NAME${NC}"
  sed -i "s/index-CFfwdjQH.js/$INDEX_NAME/g" docs/index.html
fi

echo -e "${GREEN}Index.html atualizado com sucesso!${NC}"

# 9. Garantir que os scripts de correção estão presentes
if [ ! -f docs/.github-pages-fix.js ]; then
  echo -e "${RED}ERRO: Arquivo .github-pages-fix.js não encontrado em docs/. Verifique se ele existe.${NC}"
  exit 1
fi

if [ ! -f docs/texture-patch.js ]; then
  echo -e "${RED}ERRO: Arquivo texture-patch.js não encontrado em docs/. Verifique se ele existe.${NC}"
  exit 1
fi

# 10. Atualizar o título para "Carga Móveis Bonafé"
echo -e "${YELLOW}Atualizando título da página...${NC}"
sed -i 's|<title>.*</title>|<title>Carga Móveis Bonafé</title>|' docs/index.html

# 11. Atualizar a meta descrição
echo -e "${YELLOW}Atualizando meta descrição...${NC}"
sed -i 's|<meta name="description" content=".*" />|<meta name="description" content="Ferramenta de visualização de carregamento de caminhão de móveis com restrições de empilhamento e múltiplos pontos de vista" />|' docs/index.html

echo -e "${GREEN}Preparação concluída com sucesso!${NC}"
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Faça commit e push dos arquivos para o GitHub"
echo "2. Configure o GitHub Pages para usar a pasta docs/ no branch main"
echo "3. O site estará disponível em: https://moveisbonafe.github.io/CargaMoveisBonafe/"