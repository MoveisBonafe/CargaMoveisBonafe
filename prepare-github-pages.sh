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

# 8. Inserir os scripts de correção no index.html, se não estiverem presentes
echo -e "${YELLOW}Atualizando index.html com scripts de correção...${NC}"
if ! grep -q "github-pages-fix.js" docs/index.html; then
  sed -i 's|<head>|<head>\n    <!-- Script para corrigir caminhos no GitHub Pages -->\n    <script src="./.github-pages-fix.js"></script>|' docs/index.html
  echo -e "${GREEN}Script .github-pages-fix.js adicionado ao index.html${NC}"
fi

if ! grep -q "texture-patch.js" docs/index.html; then
  sed -i 's|</body>|    <!-- Script para corrigir texturas -->\n    <script src="./texture-patch.js"></script>\n  </body>|' docs/index.html
  echo -e "${GREEN}Script texture-patch.js adicionado ao index.html${NC}"
fi

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