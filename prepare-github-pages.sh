#!/bin/bash

# Script para preparar o deploy para GitHub Pages

# Cores para melhorar a legibilidade
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 4. Copiar os arquivos de dist/public para docs
echo -e "${YELLOW}Copiando arquivos para a pasta docs...${NC}"
cp -r dist/public/* docs/

# 5. Verificar se precisa atualizar o index.html
echo -e "${YELLOW}Atualizando caminhos em index.html...${NC}"
sed -i 's|src="/assets|src="./assets|g' docs/index.html
sed -i 's|href="/assets|href="./assets|g' docs/index.html

echo -e "${GREEN}Preparação concluída!${NC}"
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Faça commit e push dos arquivos para o GitHub"
echo "2. Configure o GitHub Pages para usar a pasta docs/ no branch main"
echo "3. O site estará disponível em: https://seu-usuario.github.io/CargaMoveisBonafe/"