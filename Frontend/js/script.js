(function () {  
    const viewport = document.querySelector('.inv-viewport');  
    const track = document.querySelector('.inv-track');  
    const prevBtn = document.querySelector('.inv-prev');  
    const nextBtn = document.querySelector('.inv-next');  
    const items = Array.from(document.querySelectorAll('.inv-item'));  

    const porPagina = 3;  
    const total = items.length;
    const paginas = Math.max(1, Math.ceil(total / porPagina));
    let pagina = 0;  
  
    function atualizar() {  
      // Cada página = 100% da largura do viewport  
      track.style.transform = `translateX(-${pagina * 100}%)`;  
      // Habilita/desabilita botões conforme posição  
      prevBtn.disabled = pagina === 0;  
      nextBtn.disabled = pagina >= paginas - 1;  
    }  
  
    prevBtn.addEventListener('click', () => {  
      pagina = Math.max(0, pagina - 1);  
      atualizar();  
    });  
  
    nextBtn.addEventListener('click', () => {  
      pagina = Math.min(paginas - 1, pagina + 1);  
      atualizar();  
    });  
  
    // Inicial  
    atualizar();  
  
    // Observação importante:  
    // O cálculo de 100% por página só funciona porque cada .inv-item  
    // foi dimensionado para ocupar exatamente 1/3 do viewport (com gaps).  
    // Se você mudar gaps/larguras, ajuste o CSS do .inv-item.  
  })();


  // Cria um elemento .inv-item com conteúdo e eventos
function criarSlotItem({ id, nome, imgSrc, removeOnClick = true }) {
  const el = document.createElement('div');
  el.className = 'inv-item';
  // Atributos úteis para identificar o item
  if (id != null) el.dataset.id = String(id);
  if (nome) el.dataset.nome = nome;

  // Conteúdo: imagem opcional + label
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = nome || 'Item';
    el.appendChild(img);
  }
  const label = document.createElement('span');
  label.textContent = nome || 'Item';
  el.appendChild(label);

  // Remover ao clicar (opcional)
  if (removeOnClick) {
    el.addEventListener('click', () => {
      removerItem(el);
    });
  }

  return el;
}

// Retorna referências internas do inventário (por container)
function refsDoInventory(inventoryEl) {
  const viewport = inventoryEl.querySelector('.inv-viewport');
  const track = inventoryEl.querySelector('.inv-track');
  const prevBtn = inventoryEl.querySelector('.inv-prev');
  const nextBtn = inventoryEl.querySelector('.inv-next');
  const itens = () => Array.from(track.querySelectorAll('.inv-item'));
  return { viewport, track, prevBtn, nextBtn, itens };
}

// Mantém a navegação funcionando (mesma lógica anterior)
function criarControladorDeNavegacao(inventoryEl, porPagina = 3) {
  const { track, prevBtn, nextBtn, itens } = refsDoInventory(inventoryEl);
  let pagina = 0;

  function paginas() {
    return Math.max(1, Math.ceil(itens().length / porPagina));
  }

  function atualizar() {
    track.style.transform = `translateX(-${pagina * 100}%)`;
    prevBtn.disabled = pagina === 0;
    nextBtn.disabled = pagina >= paginas() - 1;
  }

  function irAnterior() {
    pagina = Math.max(0, pagina - 1);
    atualizar();
  }

  function irProximo() {
    pagina = Math.min(paginas() - 1, pagina + 1);
    atualizar();
  }

  prevBtn.addEventListener('click', irAnterior);
  nextBtn.addEventListener('click', irProximo);

  // expõe uma API para ser usada por add/remove
  return {
    atualizar,
    getPagina: () => pagina,
    setPagina: (p) => { pagina = Math.min(Math.max(0, p), paginas() - 1); atualizar(); },
    getPorPagina: () => porPagina,
  };
}

// Adiciona um item ao final da lista
function adicionarItem(inventoryEl, dadosItem) {
  const { track } = refsDoInventory(inventoryEl);
  const slot = criarSlotItem(dadosItem);
  track.appendChild(slot);
  // Após adicionar, atualize a navegação (se você guardou 'nav' fora, chame nav.atualizar())
  if (inventoryEl._nav) inventoryEl._nav.atualizar();
  return slot;
}

// Remove um item (elemento) do inventário
function removerItem(invItemEl) {
  const inventoryEl = invItemEl.closest('.inventory');
  if (!inventoryEl) return;
  invItemEl.remove();
  if (inventoryEl._nav) inventoryEl._nav.atualizar();
}

// Remove por id (se você tiver usado dataset.id)
function removerItemPorId(inventoryEl, id) {
  const { itens } = refsDoInventory(inventoryEl);
  const alvo = itens().find(el => el.dataset.id === String(id));
  if (alvo) removerItem(alvo);
}


// Inicialização completa (uma vez)
(function initInventario() {
  const inventoryEl = document.querySelector('.inventory');
  if (!inventoryEl) return;

  // cria e guarda o controlador na própria div
  const nav = criarControladorDeNavegacao(inventoryEl, 3);
  inventoryEl._nav = nav;
  nav.atualizar();

  // Opcional: se já existirem itens no HTML, colocar listeners de remover
  const { itens } = refsDoInventory(inventoryEl);
  itens().forEach(el => {
    el.addEventListener('click', () => removerItem(el));
  });

  // Exemplo: expor no window para facilitar testes no console
  window.InventoryAPI = {
    add: (dadosItem) => adicionarItem(inventoryEl, dadosItem),
    removeById: (id) => removerItemPorId(inventoryEl, id),
    state: () => ({
      pagina: nav.getPagina(),
      porPagina: nav.getPorPagina(),
      total: refsDoInventory(inventoryEl).itens().length,
    }),
  };
})();