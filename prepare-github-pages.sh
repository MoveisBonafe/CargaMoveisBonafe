#!/bin/bash

# Script para preparar o deploy no GitHub Pages

echo "Iniciando preparação para deploy no GitHub Pages..."

# Criar diretório docs se não existir
mkdir -p docs

# Executar o build
npm run build

# Copiar os arquivos do build para o diretório docs
echo "Copiando arquivos do build para o diretório docs..."
cp -r dist/public/* docs/

# Criar um arquivo .nojekyll para evitar o processamento do Jekyll
touch docs/.nojekyll

# Criar um arquivo index.html em docs para carregar a aplicação
cat > docs/index.html << 'EOL'
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Carga Móveis Bonafé - Otimizador de Carregamento</title>
    <meta name="description" content="Sistema de otimização de carregamento de caminhão para móveis e produtos" />
    <meta name="author" content="Móveis Bonafé" />
    <script type="module" crossorigin src="./assets/index.js"></script>
    <link rel="stylesheet" href="./assets/index.css">
  </head>
  <body>
    <div id="root"></div>
    <!-- Carrega os scripts da aplicação -->
    <script>
      // Configuração para Base URL do GitHub Pages
      window.githubPagesBasePath = '/CargaMoveisBonafe/';
    </script>
  </body>
</html>
EOL

echo "Preparação concluída! Arquivos prontos para deploy no GitHub Pages."
echo "Por favor, faça upload do conteúdo da pasta 'docs' para o seu repositório GitHub."