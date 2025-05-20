/**
 * Script para remover elementos indesejados no GitHub Pages
 * Este arquivo é carregado antes do aplicativo principal e modifica a interface
 */

(function() {
  console.log('Script para remoção de elementos indesejados iniciado');

  // Detecta se estamos no GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    console.log('Executando no GitHub Pages, preparando para remover elementos indesejados');
    
    // Função para remover elementos indesejados
    function removerElementosIndesejados() {
      // Observa mudanças no DOM para encontrar e modificar elementos quando forem adicionados
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes && mutation.addedNodes.length) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              
              // 1. Verifica se é o painel flutuante
              if (node.classList) {
                // Verificação mais abrangente para o painel flutuante
                if ((node.classList.contains('fixed') || node.classList.contains('absolute')) && 
                    (node.classList.contains('bg-card') || node.classList.contains('shadow-lg')) &&
                    (node.classList.contains('border') || node.classList.contains('rounded-md'))) {
                  console.log('Painel flutuante encontrado e removido');
                  node.remove(); // Remove o painel
                }
                
                // Verifica pelo conteúdo de texto para maior precisão
                if (node.textContent && node.textContent.includes('Itens Disponíveis')) {
                  console.log('Painel de itens disponíveis encontrado e removido');
                  node.remove(); // Remove o painel
                }
              }
              
              // 2. Verifica se é o botão "Reiniciar Caminhão"
              if (node.tagName === 'BUTTON' && 
                  node.textContent && 
                  node.textContent.includes('Reiniciar Caminhão')) {
                console.log('Botão Reiniciar Caminhão encontrado e removido');
                node.style.display = 'none'; // Oculta o botão
              }
              
              // 3. Verificação mais abrangente para o botão pelo texto
              if (node.nodeType === 1) { // É um elemento DOM
                const buttons = node.querySelectorAll('button');
                if (buttons.length) {
                  buttons.forEach(button => {
                    if (button.textContent && button.textContent.includes('Reiniciar Caminhão')) {
                      console.log('Botão Reiniciar Caminhão encontrado em elemento aninhado e removido');
                      button.style.display = 'none';
                    }
                  });
                }
              }
            }
          }
        });
      });
      
      // Verifica se já existem botões para remover
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.textContent && button.textContent.includes('Reiniciar Caminhão')) {
          console.log('Botão Reiniciar Caminhão existente encontrado e removido');
          button.style.display = 'none';
        }
      });
      
      // Observa todo o documento para alterações no DOM
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
      
      console.log('Observer para remoção de elementos indesejados configurado');
    }
    
    // Função para verificar periodicamente elementos
    function verificarPeriodicamente() {
      // Verificar botões e painéis a cada segundo
      setInterval(() => {
        // Verificar e remover botões "Reiniciar Caminhão"
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          if (button.textContent && button.textContent.includes('Reiniciar Caminhão')) {
            console.log('Botão Reiniciar Caminhão encontrado em verificação periódica');
            button.style.display = 'none';
          }
        });
        
        // Verificar e remover aba flutuante pela classe ou conteúdo
        const paineis = document.querySelectorAll('div');
        paineis.forEach(painel => {
          if (painel.classList && 
              ((painel.classList.contains('fixed') || painel.classList.contains('absolute')) && 
               (painel.classList.contains('bg-card') || painel.classList.contains('shadow-lg')) && 
               (painel.classList.contains('border') || painel.classList.contains('rounded-md')))) {
            console.log('Painel flutuante encontrado em verificação periódica');
            painel.remove();
          }
          
          // Verificação adicional pelo texto contido
          if (painel.textContent && 
              (painel.textContent.includes('Itens Disponíveis') || 
               painel.textContent.includes('Arraste aqui'))) {
            console.log('Painel com texto "Itens Disponíveis" encontrado em verificação periódica');
            painel.remove();
          }
        });
      }, 1000);
    }
    
    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        removerElementosIndesejados();
        verificarPeriodicamente();
      });
    } else {
      removerElementosIndesejados();
      verificarPeriodicamente();
    }
  }
})();