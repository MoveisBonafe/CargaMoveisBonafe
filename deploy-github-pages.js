// Script para preparar o deploy no GitHub Pages
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Iniciando preparação para deploy no GitHub Pages...');

// Diretório docs para GitHub Pages
const docsDir = path.join(__dirname, 'docs');

// Garantir que o diretório docs existe
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Criar arquivo .nojekyll para evitar processamento Jekyll
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

// Copiar arquivos do diretório cliente (HTML, CSS, JS)
try {
  console.log('Copiando arquivos do cliente para o diretório docs...');
  
  // Copiar index.html se ainda não existe
  if (!fs.existsSync(path.join(docsDir, 'client'))) {
    fs.mkdirSync(path.join(docsDir, 'client'), { recursive: true });
  }
  
  // Copiar diretório public
  if (fs.existsSync(path.join(__dirname, 'client', 'public'))) {
    execSync(`cp -r ${path.join(__dirname, 'client', 'public')}/* ${path.join(docsDir, 'client')}`);
  }

  // Importante: Preparar o script para GitHub Pages
  console.log('Criando arquivos de configuração para GitHub Pages...');
  
  // Criar arquivo 404.html para roteamento correto no GitHub Pages
  const notFoundHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página não encontrada - Carga Móveis Bonafé</title>
  <script>
    // Redirecionar para a página principal
    window.location.href = '/CargaMoveisBonafe/';
  </script>
</head>
<body>
  <h1>Página não encontrada</h1>
  <p>Redirecionando para a página principal...</p>
</body>
</html>`;

  fs.writeFileSync(path.join(docsDir, '404.html'), notFoundHTML);

  console.log('Preparação concluída!');
  console.log('Para fazer o deploy:');
  console.log('1. Faça o build da aplicação: npm run build');
  console.log('2. Copie o conteúdo da pasta dist/public para a pasta docs');
  console.log('3. Faça commit e push para o GitHub');
  console.log('4. Configure o GitHub Pages para usar o diretório docs (Settings > Pages)');
  
} catch (error) {
  console.error('Erro durante a preparação:', error);
}