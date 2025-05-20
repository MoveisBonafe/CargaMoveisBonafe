# Carga Móveis Bonafé

Aplicativo para otimização de carregamento de caminhão para a empresa Móveis Bonafé.

## Instruções para Deploy

Para atualizar este site no GitHub Pages:

1. Execute o script `./prepare-github-pages.sh`
2. Faça commit e push das mudanças para o GitHub
3. Configure o GitHub Pages para usar a pasta `docs/` no branch main

## Características

- Visualização 3D do caminhão e da carga
- Gerenciamento de diferentes tipos de caminhão
- Cadastro e gerenciamento de móveis
- Visualização da lista de itens disponíveis
- Salvamento automático de configurações

## Instruções de Uso

1. Selecione um tipo de caminhão ou cadastre um novo
2. Adicione ou gerencie os móveis
3. Organize os móveis no caminhão
4. Use as ferramentas de exportação quando terminar

## Desenvolvimento

Este projeto foi desenvolvido usando:
- React 
- TypeScript
- Three.js (via React Three Fiber)
- Tailwind CSS