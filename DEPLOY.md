# Guia de Implantação para GitHub Pages

Este documento explica como implantar o projeto CargaMoveisBonafe no GitHub Pages.

## Pré-requisitos
- Ter uma conta no GitHub
- Ter permissões para fazer push no repositório CargaMoveisBonafe

## Passos para implantação

### 1. Construir a versão de produção

Antes de fazer o deploy, você precisa construir a versão de produção:

```bash
npm run build
```

### 2. Copiar os arquivos para a pasta docs

Depois de construir, copie todo o conteúdo da pasta `dist/public` para a pasta `docs`:

```bash
cp -r dist/public/* docs/
```

### 3. Verificar configuração

Certifique-se de que os seguintes arquivos estão presentes na pasta `docs`:
- index.html
- .nojekyll (arquivo vazio para evitar o processamento Jekyll)
- 404.html (para redirecionar páginas não encontradas)

### 4. Fazer commit e push das alterações

```bash
git add docs/
git commit -m "Atualizar versão para GitHub Pages"
git push origin main
```

### 5. Configurar GitHub Pages

1. Acesse o repositório no GitHub
2. Vá para "Settings" > "Pages"
3. Na seção "Source", selecione "Deploy from a branch"
4. Em "Branch", escolha "main" e "/docs"
5. Clique em "Save"

Após alguns minutos, seu site estará disponível em:
`https://seu-usuario.github.io/CargaMoveisBonafe/`

### Observações importantes

- Quando desenvolver localmente, lembre-se de que a aplicação estará rodando em uma base path diferente no GitHub Pages (/CargaMoveisBonafe/)
- Em caso de problemas com rotas, verifique que o arquivo `404.html` está redirecionando corretamente.