/* scrip.js - versión limpia
   Funcionalidad: render dinámico (si aplica), modal con colores/tallas, carrito básico,
   carrusel y navegación móvil. Diseñado para páginas estáticas del workspace.
*/

// Reescritura limpia: script mínimo y robusto
(function(){
  'use strict';

  const CART_KEY = 'swag_cart';
  const money = v => (v||0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  function getCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }catch(e){ return []; }
  }
  function saveCart(CART){ localStorage.setItem(CART_KEY, JSON.stringify(CART)); }

  function updateCartCount(){ const cnt = document.getElementById('cart-count'); if(!cnt) return; const CART = getCart(); cnt.textContent = CART.reduce((s,i)=>s + (Number(i.qty)||0), 0); }

  // Add product with optional product data (name, price, img)
  function addToCart(id, qty=1, productData){
    if(id === undefined || id === null) return;
    const CART = getCart();
    const key = String(id);
    let found = CART.find(x=>String(x.id) === key);
    if(!found){
      // try to enrich from DOM if productData not provided
      let item = { id: key, qty: Number(qty)||1 };
      if(productData && typeof productData === 'object'){
        item.name = productData.name || productData.title || item.name;
        item.price = Number(productData.price) || Number(productData.pr) || 0;
        item.img = productData.img || productData.image || '';
      } else {
        const card = document.querySelector(`[data-product-id="${key}"]`);
        if(card){ const p = productFromCard(card); if(p){ item.name = p.name; item.price = p.price; item.img = p.img; } }
      }
      CART.push(item);
    } else {
      found.qty = Number(found.qty||0) + Number(qty||0);
      // update productData if provided
      if(productData && typeof productData === 'object'){
        found.name = productData.name || found.name;
        found.price = Number(productData.price) || found.price;
        found.img = productData.img || found.img;
      }
    }
    saveCart(CART);
    updateCartCount();
  }

  function removeFromCart(id){
    const key = String(id);
    let CART = getCart();
    CART = CART.filter(x=>String(x.id) !== key);
    saveCart(CART);
    updateCartCount();
    // if cart modal open, re-render
    const overlay = document.querySelector('.cart-overlay');
    if(overlay) renderCart(overlay);
  }

  function changeQty(id, qty){
    const key = String(id);
    const CART = getCart();
    const found = CART.find(x=>String(x.id) === key);
    if(!found) return;
    found.qty = Math.max(0, Number(qty)||0);
    if(found.qty === 0) removeFromCart(id);
    else { saveCart(CART); updateCartCount(); const overlay = document.querySelector('.cart-overlay'); if(overlay) renderCart(overlay); }
  }

  function productFromCard(card){
    if(!card) return null;
    const imgEl = card.querySelector('img');
    const img = imgEl ? imgEl.src : '';
    const name = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '';
    const priceText = card.querySelector('.price') ? card.querySelector('.price').textContent : '';
    const price = Number((priceText||'').replace(/[^0-9]/g,'')) || 0;
    // read optional data attributes
    const colors = card.dataset.colors ? card.dataset.colors.split(',').map(s=>s.trim()).filter(Boolean) : null;
    const colorImages = card.dataset.colorImages ? card.dataset.colorImages.split(',').map(s=>s.trim()).filter(Boolean) : null;
    const sizes = card.dataset.sizes ? card.dataset.sizes.split(',').map(s=>s.trim()).filter(Boolean) : null;
    const noSizes = card.dataset.noSizes === 'true' || card.dataset.noSizes === '1';
    const id = card.dataset.productId ? (isNaN(Number(card.dataset.productId)) ? card.dataset.productId : Number(card.dataset.productId)) : undefined;
    return { id, name, price, img, desc: '', colors, colorImages, sizes, noSizes, cardEl: card, imgEl };
  }

  // Cart modal rendering
  function renderCart(overlay){
    if(!overlay) return;
    overlay.innerHTML = '';
    overlay.className = 'cart-overlay';
    const panel = document.createElement('div'); panel.className = 'cart-panel';

    const header = document.createElement('div'); header.className = 'cart-header';
    const h2 = document.createElement('h3'); h2.textContent = 'Carrito';
    const btnClose = document.createElement('button'); btnClose.className = 'close-cart'; btnClose.textContent = '✕';
    header.appendChild(h2); header.appendChild(btnClose);

    const body = document.createElement('div'); body.className = 'cart-body';
    const list = document.createElement('div'); list.className = 'cart-list';

    const CART = getCart();
    if(CART.length === 0){
      const empty = document.createElement('p'); empty.className = 'muted'; empty.textContent = 'Tu carrito está vacío.';
      list.appendChild(empty);
    } else {
      CART.forEach(item =>{
        const row = document.createElement('div'); row.className = 'cart-item';
        const img = document.createElement('img'); img.src = item.img || ''; img.alt = item.name || '';
        img.className = 'cart-thumb';
        const info = document.createElement('div'); info.className = 'cart-info';
        const name = document.createElement('div'); name.className = 'cart-name'; name.textContent = item.name || ('Producto ' + item.id);
        const price = document.createElement('div'); price.className = 'cart-price'; price.textContent = money(item.price || 0);
        const qtyWrap = document.createElement('div'); qtyWrap.className = 'cart-qty';
        const minus = document.createElement('button'); minus.className = 'qty-btn minus'; minus.textContent = '−';
        const qty = document.createElement('input'); qty.type = 'number'; qty.min = '0'; qty.value = item.qty; qty.className = 'qty-input';
        const plus = document.createElement('button'); plus.className = 'qty-btn plus'; plus.textContent = '+';
        const remove = document.createElement('button'); remove.className = 'cart-remove'; remove.textContent = 'Eliminar';

        qtyWrap.appendChild(minus); qtyWrap.appendChild(qty); qtyWrap.appendChild(plus);
        info.appendChild(name); info.appendChild(price); info.appendChild(qtyWrap); info.appendChild(remove);

        row.appendChild(img); row.appendChild(info);
        list.appendChild(row);

  minus.addEventListener('click', ()=>{ const cur = Number(qty.value)||0; changeQty(item.id, cur - 1); });
  plus.addEventListener('click', ()=>{ const cur = Number(qty.value)||0; changeQty(item.id, cur + 1); });
  qty.addEventListener('change', ()=> changeQty(item.id, qty.value));
        remove.addEventListener('click', ()=> removeFromCart(item.id));
      });
    }

    const footer = document.createElement('div'); footer.className = 'cart-footer';
    const total = CART.reduce((s,i)=> s + ((Number(i.qty)||0) * (Number(i.price)||0)), 0);
    const totalDiv = document.createElement('div'); totalDiv.className = 'cart-total'; totalDiv.innerHTML = '<strong>Total: ' + money(total) + '</strong>';
    const checkout = document.createElement('button'); checkout.className = 'btn'; checkout.textContent = 'Finalizar compra';
    footer.appendChild(totalDiv); footer.appendChild(checkout);

    body.appendChild(list);
    panel.appendChild(header); panel.appendChild(body); panel.appendChild(footer);
    overlay.appendChild(panel);

    // handlers
    btnClose.addEventListener('click', ()=> document.body.removeChild(overlay));
    overlay.addEventListener('click', (ev)=>{ if(ev.target === overlay) document.body.removeChild(overlay); });
    checkout.addEventListener('click', ()=>{
      // Simular proceso de compra: deshabilitar controles, mostrar estado y luego éxito
      checkout.disabled = true;
      checkout.textContent = 'Procesando...';
      // deshabilitar controles dentro del panel para evitar cambios durante el proceso
      panel.querySelectorAll('.qty-btn, .cart-remove, .qty-input').forEach(el=>{ try{ el.disabled = true; }catch(e){} });

      // Simulación asíncrona (ej: llamada a API de pago)
      setTimeout(()=>{
        // generar ID de orden simulado
        const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random()*9000 + 1000);
        // vaciar carrito
        saveCart([]);
        updateCartCount();

        // reemplazar contenido del panel por mensaje de éxito
        panel.innerHTML = '';
        const successHeader = document.createElement('div'); successHeader.className = 'cart-header';
        const h = document.createElement('h3'); h.textContent = 'Compra finalizada';
        const closeBtn2 = document.createElement('button'); closeBtn2.className = 'close-cart'; closeBtn2.textContent = '✕';
        successHeader.appendChild(h); successHeader.appendChild(closeBtn2);

        const successBody = document.createElement('div'); successBody.className = 'cart-body';
        const msg = document.createElement('p'); msg.className = 'success-message';
        msg.innerHTML = '¡Compra exitosa!<br>Orden: <strong>' + orderId + '</strong><br>Total: ' + money(total);
        successBody.appendChild(msg);

        const successFooter = document.createElement('div'); successFooter.className = 'cart-footer';
        const done = document.createElement('button'); done.className = 'btn'; done.textContent = 'Cerrar';
        successFooter.appendChild(done);

        panel.appendChild(successHeader); panel.appendChild(successBody); panel.appendChild(successFooter);

        // handlers para cerrar
        closeBtn2.addEventListener('click', ()=>{ if(document.body.contains(overlay)) document.body.removeChild(overlay); });
        done.addEventListener('click', ()=>{ if(document.body.contains(overlay)) document.body.removeChild(overlay); });
        overlay.addEventListener('click', (ev)=>{ if(ev.target === overlay) document.body.removeChild(overlay); });

      }, 1400);
    });
  }

  function openCartModal(){
    const overlay = document.createElement('div'); overlay.className = 'cart-overlay';
    document.body.appendChild(overlay);
    renderCart(overlay);
  }

  // Delegación global: abrir modal desde tarjeta o botones
  document.addEventListener('click', (e)=>{
    const t = e.target;
    // abrir carrito (usar closest para detectar clicks en hijos del botón)
    if(t && t.closest && t.closest('#open-cart')){ e.preventDefault(); openCartModal(); return; }
    // botón agregar directo (si existe)
    if(t.closest && t.closest('.add-btn')){ const id = t.closest('.add-btn').dataset.id; if(id) addToCart(id, 1); return; }
    // botón ver (small-btn)
    if(t.closest && t.closest('.small-btn') && !t.classList.contains('add-btn')){ const el = t.closest('.small-btn'); const id = el.dataset.id; if(id){ const card = document.querySelector(`[data-product-id="${id}"]`); if(card){ openModalForProduct(productFromCard(card)); } else { openModalForProduct({id, name: el.textContent||'Producto', price:0}); } } return; }
    // click en tarjeta (evitar cuando clic en botón/enlace)
    const card = t.closest && t.closest('.card');
    if(card && !t.closest('button') && !t.closest('a')){ openModalForProduct(productFromCard(card)); return; }
  });

  function openModalForProduct(p){
    if(!p) return;
    const overlay = document.createElement('div'); overlay.className = 'qty-overlay';
    const panel = document.createElement('div'); panel.className = 'qty-panel';
    panel.innerHTML = '';

    const header = document.createElement('div'); header.className = 'qty-header';
    const h3 = document.createElement('h3'); h3.textContent = p.name || 'Producto';
    const btnClose = document.createElement('button'); btnClose.className = 'close-qty'; btnClose.textContent = '✕';
    header.appendChild(h3); header.appendChild(btnClose);

    const body = document.createElement('div'); body.className = 'qty-body';
    const imgWrap = document.createElement('div'); imgWrap.className = 'qty-image';
    const imgEl = document.createElement('img'); imgEl.src = p.img || ''; imgEl.alt = p.name || '';
    imgWrap.appendChild(imgEl);

    const controls = document.createElement('div'); controls.className = 'qty-controls';
    const desc = document.createElement('p'); desc.className = 'muted'; desc.textContent = p.desc || '';
    const priceDiv = document.createElement('div'); priceDiv.className = 'price-info'; priceDiv.innerHTML = '<strong>' + money(p.price) + '</strong>';

    const sizesLabel = document.createElement('label'); sizesLabel.textContent = 'Tallas';
    const sizesList = document.createElement('div'); sizesList.className = 'size-list';

    const actions = document.createElement('div'); actions.className = 'qty-actions';
    const addBtn = document.createElement('button'); addBtn.className = 'btn'; addBtn.id = 'modal-add'; addBtn.textContent = 'Agregar';
    const closeBtn = document.createElement('button'); closeBtn.className = 'btn ghost'; closeBtn.id = 'modal-close-2'; closeBtn.textContent = 'Cerrar';
    actions.appendChild(addBtn); actions.appendChild(closeBtn);

    const hints = document.createElement('div'); hints.className = 'qty-hints'; hints.innerHTML = 'Seleccionado: <span id="modal-selected">-</span>';

    controls.appendChild(desc); controls.appendChild(priceDiv);
    controls.appendChild(sizesLabel); controls.appendChild(sizesList);
    controls.appendChild(actions); controls.appendChild(hints);

    body.appendChild(imgWrap); body.appendChild(controls);
    panel.appendChild(header); panel.appendChild(body); overlay.appendChild(panel); document.body.appendChild(overlay);

    const sizes = (p.sizes && p.sizes.length) ? p.sizes : ['S','M','L','XL'];
    let selectedSize = sizes.length ? sizes[0] : '-';

    if(!p.noSizes){
      sizes.forEach((s,i)=>{
        const b = document.createElement('button'); b.type='button'; b.className = 'size' + (i===0? ' active' : ''); b.textContent = s;
        b.addEventListener('click', ()=>{ selectedSize = s; panel.querySelectorAll('.size').forEach(x=>x.classList.remove('active')); b.classList.add('active'); panel.querySelector('#modal-selected').textContent = selectedSize; });
        sizesList.appendChild(b);
      });
    } else { sizesLabel.style.display = 'none'; sizesList.style.display = 'none'; panel.querySelector('#modal-selected').textContent = '-'; }

    addBtn.addEventListener('click', ()=>{ addToCart(p.id || Date.now(), 1, { name: p.name, price: p.price, img: p.img }); document.body.removeChild(overlay); });
    closeBtn.addEventListener('click', ()=> document.body.removeChild(overlay));
    btnClose.addEventListener('click', ()=> document.body.removeChild(overlay));
    overlay.addEventListener('click', (ev)=>{ if(ev.target === overlay) document.body.removeChild(overlay); });
    // update cart count on init
    updateCartCount();
  }

  // init
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ updateCartCount(); });
  } else updateCartCount();

})();
