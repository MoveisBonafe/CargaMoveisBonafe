/**
 * Script para remover a aba flutuante no GitHub Pages
 * Este arquivo é carregado antes do aplicativo principal e remove o painel flutuante
 */

(function() {
  console.log('Script para remoção do painel flutuante iniciado');

  // Detecta se estamos no GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    console.log('Executando no GitHub Pages, preparando para remover o painel flutuante');
    
    // Função para remover o painel flutuante
    function removePainelFlutuante() {
      // Observa mudanças no DOM para encontrar e remover o painel quando for adicionado
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes && mutation.addedNodes.length) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              
              // Verifica se é um elemento com a classe do painel flutuante
              if (node.classList && 
                  node.classList.contains('fixed') && 
                  node.classList.contains('bg-card') &&
                  node.classList.contains('border') &&
                  node.classList.contains('rounded-md')) {
                  
                console.log('Painel flutuante encontrado e removido');
                node.remove(); // Remove o painel
              }
            }
          }
        });
      });
      
      // Observa todo o documento para alterações no DOM
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
      
      console.log('Observer para remoção do painel flutuante configurado');
    }
    
    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', removePainelFlutuante);
    } else {
      removePainelFlutuante();
    }
  }
})();